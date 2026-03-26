#!/bin/bash

# AGRIFATHER - Quick Start Script
# Run this from the project root: bash start.sh

echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║         🌾 AGRIFATHER STARTUP 🌾          ║"
echo "║   Advanced AI Assistant for Farmers       ║"
echo "╚═══════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v18+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js v18+ required. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Setup backend
echo ""
echo "📦 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Created backend/.env from example"
    echo "⚠️  IMPORTANT: Edit backend/.env and add your ANTHROPIC_API_KEY!"
    echo "    Get your key at: https://console.anthropic.com"
fi

npm install --silent
echo "✅ Backend dependencies installed"

cd ..

# Setup frontend
echo ""
echo "📦 Setting up frontend..."
cd frontend
npm install --silent
echo "✅ Frontend dependencies installed"
cd ..

echo ""
echo "═══════════════════════════════════════════"
echo "🚀 Starting AGRIFATHER..."
echo "═══════════════════════════════════════════"
echo ""
echo "📍 Backend:  http://localhost:5000"
echo "📍 Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start both servers
(cd backend && npm start) &
BACKEND_PID=$!

sleep 2

(cd frontend && npm run dev) &
FRONTEND_PID=$!

# Wait for both
wait $BACKEND_PID $FRONTEND_PID
