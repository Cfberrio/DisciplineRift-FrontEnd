@echo off
echo ========================================
echo MERGE A MAIN Y PUSH AL REPOSITORIO
echo ========================================

echo.
echo 1. Verificando rama actual...
git branch

echo.
echo 2. Añadiendo cambios si los hay...
git add .

echo.
echo 3. Commiteando cambios en fresh-start...
git commit -m "feat: Implement season reminders system and fix date issues"

echo.
echo 4. Cambiando a rama main...
git checkout main

echo.
echo 5. Pulling latest changes from main...
git pull origin main

echo.
echo 6. Merging fresh-start into main...
git merge fresh-start

echo.
echo 7. Pushing to main...
git push origin main

echo.
echo 8. Verificando estado final...
git status

echo.
echo 9. Ultimo commit en main...
git log --oneline -1

echo.
echo ========================================
echo MERGE COMPLETADO
echo ========================================

pause
