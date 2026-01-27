import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Perform any health checks here (database connections, external services, etc.)
    // For now, we'll just return a simple OK status
    
    return NextResponse.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'Crypto Swing Analyzer is running smoothly'
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}