import { NextResponse } from 'next/server'
import { db, checkDatabaseConnection } from '@/lib/db'

export async function GET() {
  try {
    console.log("=== VERIFICANDO SCHEMA DE BASE DE DATOS ===");
    
    // Verificar conexión
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json({ error: 'No hay conexión a la base de datos' }, { status: 500 });
    }

    // Intentar crear una ruta de prueba para verificar los campos
    try {
      const testRoute = await db.route.create({
        data: {
          name: "TEST_ROUTE_" + Date.now(),
          province: "Test Province",
          distance: "10 km",
          elevation: "500 m",
          routeType: "Circular",
          difficulty: "Fácil",
          comments: "Test comments",
          mapsLink: "https://test.com",
          wikilocLink: "https://wikiloc.com/test",
          gpxLink: "https://test.com/track.gpx",
          photos: "photo1|||photo2"
        }
      });

      console.log("Ruta de prueba creada:", testRoute.id);

      // Eliminar la ruta de prueba
      await db.route.delete({
        where: { id: testRoute.id }
      });

      console.log("Ruta de prueba eliminada");

      // Obtener información de la tabla
      const routes = await db.route.findMany({
        take: 1,
        select: {
          id: true,
          name: true,
          elevation: true,
          gpxLink: true,
          createdAt: true
        }
      });

      return NextResponse.json({
        status: 'success',
        message: 'Schema verificado correctamente',
        databaseConnected: true,
        hasElevationField: true,
        hasGpxLinkField: true,
        testRouteCreated: true,
        sampleRoutes: routes.length
      });

    } catch (createError) {
      console.error("Error creando ruta de prueba:", createError);
      
      // Si falla la creación, intentar obtener una ruta existente para ver los campos disponibles
      try {
        const existingRoute = await db.route.findFirst({
          select: {
            id: true,
            name: true,
            elevation: true,
            gpxLink: true,
            createdAt: true
          }
        });

        return NextResponse.json({
          status: 'partial',
          message: 'No se pudo crear ruta de prueba, pero se puede leer',
          databaseConnected: true,
          error: createError.message,
          existingRoute: existingRoute ? {
            id: existingRoute.id,
            name: existingRoute.name,
            hasElevation: existingRoute.elevation !== undefined,
            hasGpxLink: existingRoute.gpxLink !== undefined
          } : null
        });
      } catch (readError) {
        return NextResponse.json({
          status: 'error',
          message: 'No se pudo leer la tabla Route',
          databaseConnected: true,
          createError: createError.message,
          readError: readError.message
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error("Error general en verificación de schema:", error);
    return NextResponse.json({
      status: 'error',
      message: 'Error en verificación de schema',
      error: error.message
    }, { status: 500 });
  }
}