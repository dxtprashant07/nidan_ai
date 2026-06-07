@echo off
echo Starting NIDAN AI Backend...
cd /d "%~dp0backend"

if not exist "venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
pip install -r requirements.txt --quiet
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
