# Final Build Script - Runs without interruption
Set-Location "C:\Users\mayank_aggarwal2\ball_sort_game\react-native"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILDING ANDROID APK" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Start Time: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

$startTime = Get-Date

# Run the build
.\android\gradlew.bat -p android assembleDebug --no-daemon --console=plain

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILD COMPLETED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "End Time: $($endTime.ToString('HH:mm:ss'))" -ForegroundColor Gray
Write-Host "Duration: $($duration.Minutes)m $($duration.Seconds)s" -ForegroundColor Gray
Write-Host ""

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅✅✅ BUILD SUCCESS! ✅✅✅" -ForegroundColor Green
    Write-Host ""
    
    $apkPath = ".\android\app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        $apk = Get-Item $apkPath
        Write-Host "📦 APK Details:" -ForegroundColor Cyan
        Write-Host "   Location: $($apk.FullName)" -ForegroundColor White
        Write-Host "   Size: $([math]::Round($apk.Length/1MB,2)) MB" -ForegroundColor White
        Write-Host "   Created: $($apk.LastWriteTime)" -ForegroundColor White
        Write-Host ""
        Write-Host "You can install it with:" -ForegroundColor Yellow
        Write-Host "   adb install `"$apkPath`"" -ForegroundColor White
    } else {
        Write-Host "⚠️  APK file not found at expected location" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ BUILD FAILED (Exit Code: $LASTEXITCODE)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the output above for errors" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
