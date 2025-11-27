# Monitor Build Progress
# Run this in a separate terminal to watch the build

$terminalId = "08f5a347-607f-4dae-ac1e-3eca8056ec6d"  # Update if needed

Write-Host "Monitoring build progress..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Yellow
Write-Host ""

while ($true) {
    Clear-Host
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  BUILD MONITOR" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Time: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
    Write-Host ""
    
    # Check if build directory exists
    if (Test-Path ".\android\app\build") {
        Write-Host "✓ Build directory created" -ForegroundColor Green
        
        # Check for APK
        if (Test-Path ".\android\app\build\outputs\apk\debug\app-debug.apk") {
            Write-Host "✓ APK BUILT SUCCESSFULLY!" -ForegroundColor Green
            $apk = Get-Item ".\android\app\build\outputs\apk\debug\app-debug.apk"
            Write-Host "  Size: $([math]::Round($apk.Length / 1MB, 2)) MB" -ForegroundColor Cyan
            Write-Host "  Location: $($apk.FullName)" -ForegroundColor Cyan
            break
        } else {
            Write-Host "○ Building APK..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "○ Configuring project..." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Waiting for build to complete..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "Build monitoring complete!" -ForegroundColor Green
