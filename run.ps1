# Wrapper to run run-all.bat correctly from PowerShell
# Use: .\run.ps1  or  .\run
Set-Location $PSScriptRoot
cmd /c run-all.bat
