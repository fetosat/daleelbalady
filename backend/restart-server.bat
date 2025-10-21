@echo off
echo Stopping server...
taskkill /F /IM node.exe 2>nul
timeout /t 2
echo Starting server...
cd /d C:\Users\WDAGUtilityAccount\Desktop\daleelbalady\backend
node server.js
