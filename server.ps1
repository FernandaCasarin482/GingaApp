$port = 8080
$ip = [System.Net.IPAddress]::Any
$listener = New-Object System.Net.Sockets.TcpListener($ip, $port)

try {
    $listener.Start()
    Write-Host "Server started successfully on port $port"
} catch {
    Write-Host "Failed to start server: $_"
    exit
}

$root = $PWD.Path

while ($true) {
    if (!$listener.Pending()) {
        Start-Sleep -Milliseconds 50
        continue
    }

    try {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        
        $buffer = New-Object Byte[] 2048
        $read = $stream.Read($buffer, 0, $buffer.Length)
        if ($read -eq 0) { $client.Close(); continue }
        
        $reqStr = [System.Text.Encoding]::ASCII.GetString($buffer, 0, $read)
        $firstLine = ($reqStr -split "`r`n")[0]
        
        if ([string]::IsNullOrEmpty($firstLine)) {
            $client.Close()
            continue
        }
        
        $parts = $firstLine.Split(' ')
        if ($parts.Length -ge 2) {
            $path = $parts[1]
            if ($path.Contains("?")) { $path = $path.Split('?')[0] }
            if ($path -eq '/' -or $path -eq '') { $path = '/index.html' }
            $path = [System.Uri]::UnescapeDataString($path)
            $path = $path.Replace('/', '\')
            
            $filePath = $root + $path
            
            $writer = New-Object System.IO.StreamWriter($stream)
            $writer.AutoFlush = $true
            
            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                switch ($ext) {
                    ".html" { $ct = "text/html; charset=utf-8" }
                    ".css"  { $ct = "text/css; charset=utf-8" }
                    ".js"   { $ct = "application/javascript; charset=utf-8" }
                    ".png"  { $ct = "image/png" }
                    ".jpg"  { $ct = "image/jpeg" }
                    ".svg"  { $ct = "image/svg+xml" }
                    ".mp4"  { $ct = "video/mp4" }
                    ".woff" { $ct = "font/woff" }
                    ".woff2"{ $ct = "font/woff2" }
                    ".ttf"  { $ct = "font/ttf" }
                    default { $ct = "application/octet-stream" }
                }
                
                $content = [System.IO.File]::ReadAllBytes($filePath)
                
                $writer.Write("HTTP/1.1 200 OK`r`n")
                $writer.Write("Content-Type: $ct`r`n")
                $writer.Write("Content-Length: $($content.Length)`r`n")
                $writer.Write("Connection: close`r`n`r`n")
                
                $stream.Write($content, 0, $content.Length)
                Write-Host "Served 200: $path"
            } else {
                $writer.Write("HTTP/1.1 404 Not Found`r`n")
                $writer.Write("Connection: close`r`n`r`n")
                Write-Host "Served 404: $path"
            }
        }
        $client.Close()
    } catch {
        # Ignorar erros
    }
}
