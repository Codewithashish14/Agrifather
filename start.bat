@echo off
echo.
echo ╔═══════════════════════════════════════════╗
echo ║         🌾 AGRIFATHER STARTUP 🌾          ║
echo ║   Advanced AI Assistant for Farmers       ║
echo ╚═══════════════════════════════════════════╝
echo.

:: Check if .env exists
if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo ⚠️  Created backend/.env — Please add your ANTHROPIC_API_KEY!
    echo     Get your key at: https://console.anthropic.com
    pause
)

:: Install backend
echo 📦 Installing backend dependencies...
cd backend
call npm install
cd ..

:: Install frontend
echo 📦 Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo 🚀 Starting AGRIFATHER...
echo 📍 Backend:  http://localhost:5000
echo 📍 Frontend: http://localhost:3000
echo.

:: Start backend in new window
start "AGRIFATHER Backend" cmd /k "cd backend && npm start"

:: Wait a moment
timeout /t 3 /nobreak > nul

:: Start frontend in new window
start "AGRIFATHER Frontend" cmd /k "cd frontend && npm run dev"

echo ✅ AGRIFATHER is starting in separate windows!
echo    Open http://localhost:3000 in your browser
pause
