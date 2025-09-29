import { NextResponse } from 'next/server'
import { checkDatabaseConnection } from '@/lib/db'

export async function GET() {
  try {
    console.log("Health check iniciado...");
    
    // Verificar conexión a la base de datos
    const dbConnected = await checkDatabaseConnection();
    
    // Recopilar información del sistema
    const healthStatus = {
      status: dbConnected ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        message: dbConnected ? 'Database connection successful' : 'Database connection failed'
      },
      environment: process.env.NODE_ENV || 'unknown',
      version: '1.0.0'
    }
    
    console.log("Health check completado:", healthStatus);
    
    return NextResponse.json(healthStatus, {
      status: dbConnected ? 200 : 503
    })
  } catch (error) {
    console.error('Error en health check:', error)
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 500 })
  }
}