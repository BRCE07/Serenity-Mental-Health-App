@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  npm install
)
echo Starting Serenity API server on port 3000...
echo Make sure MySQL is running and the serenity database is created.
echo.
node server.js
