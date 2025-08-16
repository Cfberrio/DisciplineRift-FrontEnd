@echo off
echo ========================================
echo FORZANDO PUSH AL REPOSITORIO GITHUB
echo ========================================

echo.
echo 1. Verificando estado actual...
git status

echo.
echo 2. Añadiendo todos los archivos...
git add .

echo.
echo 3. Verificando si hay cambios para commitear...
git status --porcelain

echo.
echo 4. Commiteando cambios (si los hay)...
git commit -m "feat: Implement season reminders system and fix date issues - Add automated daily job for season reminders (20:30 NY time) - Implement season reminders with HTML email templates - Add retry mechanism for failed email sends - Fix buildPracticeOccurrences backward date search - Fix missing last session in practice schedules - Add comprehensive CLI scripts for testing and management - Update email service to handle time format cleaning - Add scheduler system with cron jobs"

echo.
echo 5. Verificando ramas...
git branch -a

echo.
echo 6. Intentando push a fresh-start...
git push origin fresh-start

echo.
echo 7. Si falla, creando upstream...
git push -u origin fresh-start

echo.
echo 8. Verificando estado final...
git status

echo.
echo 9. Mostrando ultimo commit...
git log --oneline -1

echo.
echo ========================================
echo PROCESO COMPLETADO
echo ========================================

pause
