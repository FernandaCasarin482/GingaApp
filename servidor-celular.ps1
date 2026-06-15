$port = 8080
$base = "C:\Users\casar\OneDrive\Desktop\aplicativo"

# Pega o IP Wi-Fi
$ip = (Get-NetIPAddress -InterfaceAlias Wi-Fi -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
if (!$ip) { $ip = "127.0.0.1" }

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)

try {
    $listener.Start()
} catch {
    Write-Host "ERRO: Porta $port ja esta em uso. Fechando processo antigo..." -ForegroundColor Red
    $proc = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($proc) { Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
    $listener.Start()
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   GINGA! SERVER ONLINE (TcpListener)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " Computador : http://localhost:$port/" -ForegroundColor White
Write-Host " Celular    : http://${ip}:$port/" -ForegroundColor Yellow -BackgroundColor DarkBlue
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " Pressione Ctrl+C para encerrar." -ForegroundColor DarkGray
Write-Host ""

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".ttf"  = "font/ttf"
    ".woff" = "font/woff"
    ".woff2"= "font/woff2"
    ".mp4"  = "video/mp4"
    ".mov"  = "video/quicktime"
    ".webm" = "video/webm"
    ".mp3"  = "audio/mpeg"
    ".wav"  = "audio/wav"
    ".ogg"  = "audio/ogg"
    ".webp" = "image/webp"
}

function Send-Response {
    param($client, $statusCode, $statusText, $contentType, $bodyBytes)
    $stream = $client.GetStream()
    $headerStr = "HTTP/1.1 $statusCode $statusText`r`nContent-Type: $contentType`r`nContent-Length: $($bodyBytes.Length)`r`nAccess-Control-Allow-Origin: *`r`nAccept-Ranges: bytes`r`nConnection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headerStr)
    $stream.Write($headerBytes, 0, $headerBytes.Length)
    $stream.Write($bodyBytes, 0, $bodyBytes.Length)
    $stream.Flush()
    $client.Close()
}

function Send-RangeResponse {
    param($client, $contentType, $filePath, $rangeHeader)
    $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
    $totalSize = $fileBytes.Length

    # Parse Range: bytes=START-END
    $range = $rangeHeader -replace "bytes=", ""
    $parts = $range.Split("-")
    $start = [long]$parts[0]
    $end = if ($parts[1] -ne "") { [long]$parts[1] } else { $totalSize - 1 }
    if ($end -ge $totalSize) { $end = $totalSize - 1 }
    $length = $end - $start + 1

    $stream = $client.GetStream()
    $headerStr = "HTTP/1.1 206 Partial Content`r`nContent-Type: $contentType`r`nContent-Length: $length`r`nContent-Range: bytes $start-$end/$totalSize`r`nAccept-Ranges: bytes`r`nAccess-Control-Allow-Origin: *`r`nConnection: close`r`n`r`n"
    $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headerStr)
    $stream.Write($headerBytes, 0, $headerBytes.Length)
    $stream.Write($fileBytes, $start, $length)
    $stream.Flush()
    $client.Close()
}

while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream)

        # Lê a primeira linha: GET /path HTTP/1.1
        $requestLine = $reader.ReadLine()
        if (-not $requestLine) { $client.Close(); continue }

        # Lê headers
        $headers = @{}
        while ($true) {
            $line = $reader.ReadLine()
            if ([string]::IsNullOrEmpty($line)) { break }
            $colonIdx = $line.IndexOf(":")
            if ($colonIdx -gt 0) {
                $key = $line.Substring(0, $colonIdx).Trim().ToLower()
                $val = $line.Substring($colonIdx + 1).Trim()
                $headers[$key] = $val
            }
        }

        $parts = $requestLine.Split(" ")
        if ($parts.Length -lt 2) { $client.Close(); continue }

        $urlPath = $parts[1].TrimStart("/")
        if ($urlPath -eq "" -or $urlPath -eq "/") { $urlPath = "index.html" }

        # Decodifica URL
        $urlPath = [System.Uri]::UnescapeDataString($urlPath)
        # Remove query string
        if ($urlPath.Contains("?")) { $urlPath = $urlPath.Split("?")[0] }

        $filePath = Join-Path $base $urlPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }

            # Suporte a Range requests (necessario para video no celular)
            if ($headers.ContainsKey("range")) {
                Write-Host "206 $urlPath (Range: $($headers['range']))" -ForegroundColor Magenta
                Send-RangeResponse -client $client -contentType $mime -filePath $filePath -rangeHeader $headers["range"]
            } else {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                Write-Host "200 $urlPath" -ForegroundColor Green
                Send-Response -client $client -statusCode 200 -statusText "OK" -contentType $mime -bodyBytes $bytes
            }
        } else {
            Write-Host "404 $urlPath" -ForegroundColor Red
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            Send-Response -client $client -statusCode 404 -statusText "Not Found" -contentType "text/plain" -bodyBytes $msg
        }
    } catch {
        # Ignora erros de conexão
    }
}
