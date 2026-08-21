@echo off
chcp 65001 >nul
echo [i] Tuer les processus sur les ports 3000 et 8000...

:: Utiliser PowerShell pour une gestion plus fiable des processus
powershell -Command "$ports = @(3000, 8000); foreach ($port in $ports) { $p = Get-NetTCPConnection -LocalPort $port -State Listen | Select-Object -ExpandProperty OwningProcess; if ($p) { Stop-Process -Id $p -Force; Write-Host \"[✓] Port $port - Processus PID $p halté\" } else { Write-Host \"[✓] Port $port est déjà libre\" } }"

echo.
echo [✓] Nettoyage des ports terminé.
pause
