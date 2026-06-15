$port = 8080
$ip = (Get-NetIPAddress -InterfaceAlias Wi-Fi -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
if (!$ip) {
    try { $ip = (Test-Connection -ComputerName $env:COMPUTERNAME -Count 1).IPV4Address.IPAddressToString } catch { $ip = "127.0.0.1" }
}

Write-Host "Configurando permissões e firewall..." -ForegroundColor Cyan

# Remove e adiciona URL ACL
netsh http delete urlacl url=http://${ip}:${port}/ 2>$null
netsh http add urlacl url=http://${ip}:${port}/ user=Everyone

# Adiciona regra de firewall
New-NetFirewallRule -DisplayName "GingaApp Server Port 8080" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null

Write-Host "Iniciando o servidor..." -ForegroundColor Green
& "c:\Users\casar\OneDrive\Desktop\aplicativo\server.ps1"
