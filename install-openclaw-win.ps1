param(
    [string]$InstallDir = "$env:ProgramFiles\OpenClaw",
    [string]$Version = "v1.0"
)

$ErrorActionPreference = "Stop"

function Ensure-WingetPackage {
    param(
        [Parameter(Mandatory = $true)][string]$Id,
        [Parameter(Mandatory = $true)][string]$Name
    )

    $installed = winget list --id $Id --exact 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $installed) {
        Write-Host "Installing $Name ..."
        winget install --id $Id --exact --accept-source-agreements --accept-package-agreements
    } else {
        Write-Host "$Name already installed."
    }
}

Write-Host "=== OpenClaw Windows installer ==="

Ensure-WingetPackage -Id "Git.Git" -Name "Git"
Ensure-WingetPackage -Id "Kitware.CMake" -Name "CMake"
Ensure-WingetPackage -Id "Microsoft.VisualStudio.2022.BuildTools" -Name "Visual Studio Build Tools"
Ensure-WingetPackage -Id "Microsoft.VCRedist.2015+.x64" -Name "VC++ Redistributable"

if (-not (Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

$tempRoot = Join-Path $env:TEMP "openclaw-build"
$srcDir = Join-Path $tempRoot "OpenClaw"
$buildDir = Join-Path $tempRoot "build"

if (Test-Path $tempRoot) {
    Remove-Item -Recurse -Force $tempRoot
}

New-Item -ItemType Directory -Path $tempRoot | Out-Null

Write-Host "Cloning OpenClaw source ..."
git clone --depth 1 --branch $Version https://github.com/pjasicek/OpenClaw.git $srcDir

Write-Host "Configuring project ..."
cmake -S $srcDir -B $buildDir -G "Visual Studio 17 2022" -A x64 -DCMAKE_BUILD_TYPE=Release

Write-Host "Building OpenClaw ..."
cmake --build $buildDir --config Release --parallel

$exePath = Get-ChildItem -Path $buildDir -Filter "OpenClaw.exe" -Recurse | Select-Object -First 1
if (-not $exePath) {
    throw "OpenClaw.exe not found after build."
}

Copy-Item -Path $exePath.FullName -Destination (Join-Path $InstallDir "OpenClaw.exe") -Force

Write-Host "OpenClaw installed to: $InstallDir"
Write-Host "Tip: copy original game data files to the same folder before running OpenClaw.exe"
