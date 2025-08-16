@echo off
echo Verificando estado del repositorio...
git status

echo.
echo Verificando ramas...
git branch -a

echo.
echo Intentando push a fresh-start...
git push origin fresh-start

echo.
echo Intentando push con upstream...
git push -u origin fresh-start

echo.
echo Estado final...
git status

pause
