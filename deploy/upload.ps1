# deploy/upload.ps1
# -----------------------------------------------------------------------------
# 一行命令把网站发到自己的服务器（大陆云 / 香港轻量都适用）。
#
# 用法（在项目根目录执行）：
#   .\deploy\upload.ps1 -Server 1.2.3.4 -User root
#   .\deploy\upload.ps1 -Server 1.2.3.4 -User root -Domain sanqi.design
#
# 如果提示「在此系统上禁止运行脚本」，二选一：
#   powershell -ExecutionPolicy Bypass -File .\deploy\upload.ps1 -Server 1.2.3.4
#   Set-ExecutionPolicy -Scope Process Bypass
#
# 前提：服务器已装 nginx；本机能 ssh 登录（建议先配好密钥免密）。
# 脚本只会清空并重写 -RemotePath 指向的目录，不碰服务器上的其它东西。
# -----------------------------------------------------------------------------
param(
    [Parameter(Mandatory = $true)][string]$Server,
    [string]$User = "root",
    [string]$RemotePath = "/var/www/sanqi",
    [string]$Domain = "",
    [switch]$SkipNginxReload
)

$ErrorActionPreference = "Stop"

foreach ($cmd in @("ssh", "scp")) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        throw "找不到 $cmd 命令。Windows 10/11 自带 OpenSSH，可在「设置 → 应用 → 可选功能」里安装 OpenSSH 客户端。"
    }
}

function Invoke-Remote {
    param([string]$Command)
    & ssh "${User}@${Server}" $Command
    if ($LASTEXITCODE -ne 0) {
        throw "远程命令失败（exit $LASTEXITCODE）：$Command"
    }
}

$root = Split-Path -Parent $PSScriptRoot
$stage = Join-Path $env:TEMP "sanqi-deploy"

try {
    Write-Host "→ 收集站点文件…" -ForegroundColor Cyan
    if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
    New-Item -ItemType Directory -Path $stage | Out-Null

    # 只发布站点本身：不含 README / DEPLOY / preview / deploy 这些辅助文件
    foreach ($item in @("index.html", "404.html", "favicon.svg", "robots.txt", "assets")) {
        $src = Join-Path $root $item
        if (Test-Path $src) {
            Copy-Item $src -Destination $stage -Recurse -Force
        } else {
            Write-Warning "缺少 $item，已跳过"
        }
    }

    $count = (Get-ChildItem $stage -Recurse -File).Count

    Write-Host "→ 清空远端目录 $RemotePath …" -ForegroundColor Cyan
    Invoke-Remote "mkdir -p '$RemotePath' && rm -rf '$RemotePath'/*"

    Write-Host "→ 上传 $count 个文件到 $User@$Server …" -ForegroundColor Cyan
    & scp -r "$stage\*" "${User}@${Server}:$RemotePath"
    if ($LASTEXITCODE -ne 0) {
        throw "上传失败（exit $LASTEXITCODE），请检查服务器地址、账号和网络。"
    }

    $remote = "set -e; (chown -R www-data:www-data '$RemotePath' 2>/dev/null || chown -R nginx:nginx '$RemotePath'); find '$RemotePath' -type d -exec chmod 755 {} \; ; find '$RemotePath' -type f -exec chmod 644 {} \;"
    if (-not $SkipNginxReload) {
        $remote += " ; nginx -t ; systemctl reload nginx"
    }

    Write-Host "→ 设置权限并重载 Nginx…" -ForegroundColor Cyan
    Invoke-Remote $remote

    Write-Host ""
    Write-Host "✔ 部署完成" -ForegroundColor Green
    if ($Domain) {
        Write-Host "  https://$Domain" -ForegroundColor Green
    } else {
        Write-Host "  http://$Server" -ForegroundColor Green
    }
    Write-Host "  浏览器有缓存的话按 Ctrl + F5 强刷" -ForegroundColor DarkGray
} finally {
    Remove-Item $stage -Recurse -Force -ErrorAction SilentlyContinue
}