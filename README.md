# Crypto Swing Analyzer

A comprehensive cryptocurrency swing trading analysis tool powered by AI.

## Features

- Real-time market data visualization (H4 & D1 timeframes)
- AI-powered swing trading recommendations
- Portfolio tracking and management
- Dynamic target coins configuration
- Indonesian localization
- Responsive web interface
- Docker containerization for easy deployment

## Prerequisites

- Docker and Docker Compose
- Google Gemini API key

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/luthfialghz/crypto-swing-analyzer.git
cd crypto-swing-analyzer
```

### 2. Environment Configuration

Create a `.env` file in the project root with your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Build and Run with Docker Compose

```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

The application will be available at `http://localhost:3000`.

### 4. Alternative: Build and Run Individual Container

```bash
# Navigate to the web-app directory
cd web-app

# Build the Docker image
docker build -t crypto-swing-analyzer .

# Run the container
docker run -p 3000:3000 -e GEMINI_API_KEY=your_api_key_here crypto-swing-analyzer
```

## Configuration

- The application stores portfolio data in the `./web-app/data` directory
- The API key can be passed as an environment variable
- Port can be changed in the docker-compose.yml file
- Health check endpoint available at `/api/health`

## Development

For development purposes, you can run the application without Docker:

```bash
cd web-app
npm install
npm run dev
```

## Architecture

- Built with Next.js 14 and TypeScript
- Uses Tailwind CSS for styling
- Integrates with CoinGecko API for market data
- Powered by Google Gemini AI for analysis
- Includes a dynamic target coins management system
- Containerized with Docker for consistent deployments

## Docker Configuration

The application is configured with the following Docker features:
- Production-optimized Next.js build using standalone output
- Health check endpoint for container monitoring
- Persistent volume for portfolio data
- Environment variable support for API keys
- Proper port mapping for web access

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request