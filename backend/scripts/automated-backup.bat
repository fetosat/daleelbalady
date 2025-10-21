@echo off
REM ==========================================
REM Daleel Balady - Automated Database Backup
REM ==========================================

echo Starting automated database backup...

REM Set variables
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%

REM Database connection details (update these)
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=daleelbalady
set DB_USER=daleelbalady
set DB_PASSWORD=daleelbalady_password

REM Backup directories
set BACKUP_DIR=C:\backups\daleelbalady
set ARCHIVE_DIR=%BACKUP_DIR%\archive

REM Create backup directories if they don't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
if not exist "%ARCHIVE_DIR%" mkdir "%ARCHIVE_DIR%"

echo [%time%] Creating database backup...

REM Create main database backup
mysqldump -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% ^
  --single-transaction ^
  --routines ^
  --triggers ^
  --events ^
  --add-drop-database ^
  --databases %DB_NAME% > "%BACKUP_DIR%\daleel_backup_%TIMESTAMP%.sql"

if %errorlevel% equ 0 (
    echo [%time%] ✅ Main database backup completed successfully
) else (
    echo [%time%] ❌ Main database backup failed
    exit /b 1
)

REM Create medical database backup (if exists)
set MEDICAL_DB_NAME=medical_db
mysqldump -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% ^
  --single-transaction ^
  --routines ^
  --triggers ^
  --events ^
  --add-drop-database ^
  --databases %MEDICAL_DB_NAME% > "%BACKUP_DIR%\medical_backup_%TIMESTAMP%.sql" 2>nul

if %errorlevel% equ 0 (
    echo [%time%] ✅ Medical database backup completed successfully
) else (
    echo [%time%] ⚠️  Medical database backup skipped or failed
)

REM Backup uploads directory
if exist "uploads" (
    echo [%time%] Creating uploads backup...
    tar -czf "%BACKUP_DIR%\uploads_backup_%TIMESTAMP%.tar.gz" uploads
    if %errorlevel% equ 0 (
        echo [%time%] ✅ Uploads backup completed successfully
    ) else (
        echo [%time%] ❌ Uploads backup failed
    )
)

REM Create compressed archive of all backups
echo [%time%] Creating compressed archive...
cd /d "%BACKUP_DIR%"
tar -czf "%ARCHIVE_DIR%\complete_backup_%TIMESTAMP%.tar.gz" *.sql *.tar.gz 2>nul

REM Clean up individual files (keep compressed archive only)
del /q *.sql 2>nul
del /q uploads_backup_*.tar.gz 2>nul

REM Remove old archives (keep only last 30 days)
forfiles /p "%ARCHIVE_DIR%" /s /m *.tar.gz /d -30 /c "cmd /c del @path" 2>nul

REM Log backup completion
echo [%time%] ==========================================
echo [%time%] Backup Summary:
echo [%time%] - Timestamp: %TIMESTAMP%
echo [%time%] - Location: %ARCHIVE_DIR%\complete_backup_%TIMESTAMP%.tar.gz
dir "%ARCHIVE_DIR%\complete_backup_%TIMESTAMP%.tar.gz" | find "complete_backup_%TIMESTAMP%.tar.gz"
echo [%time%] - Old backups cleaned (>30 days)
echo [%time%] ==========================================

REM Optional: Send backup notification
REM You can add email notification or webhook here
REM Example:
REM curl -X POST -H "Content-Type: application/json" ^
REM   -d "{\"message\": \"Database backup completed: %TIMESTAMP%\"}" ^
REM   http://localhost:5000/api/admin/backup-notification

echo [%time%] ✅ Automated backup completed successfully!
pause
