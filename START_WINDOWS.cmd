@echo off
cd /d "%~dp0"
where py >nul 2>&1
if %errorlevel%==0 (
  echo Open http://localhost:8040
  py -m http.server 8040
) else (
  where python >nul 2>&1
  if %errorlevel%==0 (
    echo Open http://localhost:8040
    python -m http.server 8040
  ) else (
    echo Python is required. Install Python, or run npx http-server -p 8040
    pause
  )
)
