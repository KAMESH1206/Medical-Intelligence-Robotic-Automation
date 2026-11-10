@echo off
TITLE MIRA Ops Intelligence - Full Stack Launcher
COLOR 0B

echo ======================================================================
echo           MIRA OPS INTELLIGENCE - FULL WORKING MODEL
echo     Intelligent Healthcare Operations & Robotic Workflow Automation
echo ======================================================================
echo.

echo [1/3] Verifying Python Environment...
python -c "import fastapi, sqlalchemy; print('  ✓ Python FastAPI and SQLAlchemy verified.')"
if %errorlevel% neq 0 (
    echo [!] Python dependencies missing. Installing...
    pip install -r backend\requirements.txt
)

echo.
echo [2/3] Seeding Initial Synthetic Clinical Database...
cd backend
python seed.py
cd ..

echo.
echo [3/3] Launching Full-Stack Services...
echo.
echo Starting FastAPI Backend on http://localhost:8000 (Swagger docs: http://localhost:8000/docs)...
start "MIRA Ops - FastAPI Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --port 8000"

echo Starting Next.js 16 Frontend on http://localhost:3000...
start "MIRA Ops - Next.js Frontend" cmd /k "npm run dev"

echo.
echo ======================================================================
echo [OK] Both services are now running!
echo      - Frontend Web App:  http://localhost:3000
echo      - Backend REST API:  http://localhost:8000/docs
echo ======================================================================
pause

