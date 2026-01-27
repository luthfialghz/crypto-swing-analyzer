@echo off
REM Script to build and run the Crypto Swing Analyzer with Docker

echo Building and running Crypto Swing Analyzer...

REM Check if .env file exists
if not exist ".env" (
    echo Warning: .env file not found. Please create one with your GEMINI_API_KEY.
    echo Using .env.example as template...
    if exist ".env.example" (
        copy .env.example .env
    ) else (
        echo GEMINI_API_KEY=your_api_key_here > .env
    )
    echo Please edit .env to add your actual API key.
)

REM Build and run with docker-compose
docker-compose up -d --build

echo.
echo Application is running at http://localhost:3000
echo View logs with: docker-compose logs -f
pause