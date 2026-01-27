#!/bin/bash
# Script to build and run the Crypto Swing Analyzer with Docker

echo "Building and running Crypto Swing Analyzer..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Please create one with your GEMINI_API_KEY."
    echo "Using .env.example as template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
    else
        echo "GEMINI_API_KEY=your_api_key_here" > .env
    fi
    echo "Please edit .env to add your actual API key."
fi

# Build and run with docker-compose
docker-compose up -d --build

echo "Application is running at http://localhost:3000"
echo "View logs with: docker-compose logs -f"