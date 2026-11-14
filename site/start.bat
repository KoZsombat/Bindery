@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo MatekBazis indítása...
where python >nul 2>nul
if %errorlevel%==0 (
  start "MatekBazis szerver" cmd /c "python -m http.server 8765 & pause"
  timeout /t 2 >nul
  start "" "http://127.0.0.1:8765/"
) else (
  echo Python nem talalhato, kozvetlenul nyitom az index.html-t.
  start "" "index.html"
)
