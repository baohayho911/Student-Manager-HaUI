@echo off
cd /d "%~dp0.."
if not exist .env (
 echo Hay sao chep .env.example thanh .env va dien ket noi Supabase theo README.md.
 pause
 exit /b 1
)
if not exist node_modules (
 call npm ci
 if errorlevel 1 goto :error
)
start "" http://localhost:3000
call npm run dev
exit /b
:error
 echo Cai thu vien that bai. Kiem tra Node.js va mang.
 pause
