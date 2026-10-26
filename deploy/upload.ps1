# deploy/upload.ps1
# -----------------------------------------------------------------------------
# 把网站打包上传到自己的服务器（国内云 / 香港轻量都适用）。
#
# 用法（在项目根目录执行）：
#   .\deploy\upload.ps1 -Server 1.2.3.4 -User root
#   .\deploy\upload.ps1 -Server 1.2.3.4 -User root -RemotePath /var/www/sanqi -Domain sanqi.design
#
# 前提：服务器已装 nginx + unzip，且本机能用 ssh 登录（建议先配好免密）。
# -----------------------------------------------------------------------------
param(
    [Parameter(Mandatory = $true)][string]$Server,
    [string]$User = "root",
    [string]$RemotePath = "/var/www/sanqi",
    [string]$Domain = "",
    [switch]$SkipNginxReload
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$stage = Join-Path $env:TEMP "sanqi-deploy"
$zip = Join-Path $env:TEMP "sanqi-site.zip"

Write-Host "→ 收集站点文件…" -ForegroundColor Cyan
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null

# 只发布站点本身，不带 README / preview / deploy 之类的辅助文件
$items = @("index.html", "404.html", "favicon.svg", "robots.txt", "assets")
foreach ($item in $items) {
    $src = Join-Path $root $item
    if (Test-Path $src) {
        Copy-Item $src -Destination $stage -Recurse -Force
    } else {
        Write-Warning "缺少 $item"
    }
}

if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $stage "*") -DestinationPath $zip -CompressionLevel Optimal
$size = [math]::Round((Get-Item $zip).Length / 1KB, 1)
Write-Host "→ 打包完成：$zip（$size KB）" -ForegroundColor Cyan

Write-Host "→ 上传到 $User@$Server …" -ForegroundColor Cyan
scp $zip "${User}@${Server}:/tmp/sanqi-site.zip"

$remoteCmd = @"
set -e
mkdir -p $RemotePath
rm -rf $RemotePath/*
unzip -oq /tmp/sanqi-site.zip -d $RemotePath
rm -f /tmp/sanqi-site.zip
chown -R www-data:www-data $RemotePath 2>/dev/null || chown -R nginx:nginx $RemotePath
find $RemotePath -type d -exec chmod 755 {} \;
find $RemotePath -type f -exec chmod 644 {} \;
"@

if (-not $SkipNginxReload) {
    $remoteCmd += @"

nginx -t
systemctl reload nginx
"@
}

Write-Host "→ 服务器上解压并重载 Nginx…" -ForegroundColor Cyan
ssh "${User}@${Server}" $remoteCmd

Write-Host ""
Write-Host "✔ 部署完成" -ForegroundColor Green
if ($Domain) {
    Write-Host "  访问 https://$Domain" -ForegroundColor Green
} else {
    Write-Host "  访问 http://$Server" -ForegroundColor Green
}
Write-Host "  如浏览器有缓存，按 Ctrl + F5 强制刷新" -ForegroundColor DarkGray
