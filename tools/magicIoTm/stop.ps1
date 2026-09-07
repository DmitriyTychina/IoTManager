# Stop magicIoTm server
$ErrorActionPreference = "SilentlyContinue"

# Get the directory where this script is located
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# [1] Kill python processes running app.py from this folder
Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object {
    $_.CommandLine -like "*$scriptDir*app.py*"
} | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force
}

# [2] Kill cmd.exe windows running run.bat by window title
#     The run.bat sets title to "magicIoTm - Configurator"
Get-CimInstance Win32_Process -Filter "Name='cmd.exe'" | Where-Object {
    $cmd = $_.CommandLine
    ($cmd -like "*run.bat*") -and
    ($cmd -notlike "*stop*") -and
    ($cmd -notlike "*restart*")
} | ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force
}

# [3] Also try by window title (only if not already killed above)
Get-Process | Where-Object {
    $_.MainWindowTitle -like "*Configurator*"
} | ForEach-Object {
    # Double-check it's not our own stop/restart window
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$($_.Id)" -ErrorAction SilentlyContinue
    if ($proc -and $proc.CommandLine -like "*run.bat*") {
        Stop-Process -Id $_.Id -Force
    }
}

# [4] Kill anything on port 5005
$connections = Get-NetTCPConnection -LocalPort 5005 -State Listen -ErrorAction SilentlyContinue
if ($connections) {
    $connections.OwningProcess | Select-Object -Unique | ForEach-Object {
        Stop-Process -Id $_ -Force
    }
}
