import { NextRequest, NextResponse } from "next/server";
import { db, checkDatabaseConnection } from "@/lib/db";

// Función para verificar si la tabla Route existe y crearla si es necesario
async function ensureRouteTableExists() {
  try {
    // Verificar si la tabla existe consultando sqlite_master
    const tableExists = await db.$queryRaw`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='Route'
    `;
    
    if (!tableExists || (Array.isArray(tableExists) && tableExists.length === 0)) {
      console.log("La tabla Route no existe, creándola...");
      
      // Crear la tabla Route usando SQL directo
      await db.$queryRaw`
        CREATE TABLE "Route" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "province" TEXT,
          "distance" TEXT,
          "routeType" TEXT,
          "difficulty" TEXT,
          "comments" TEXT,
          "mapsLink" TEXT,
          "wikilocLink" TEXT,
          "photos" TEXT,
          "gpsTrack" TEXT,
          "gpsTrackName" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL
        );
      `;
      
      console.log("Tabla Route creada exitosamente");
      return true;
    }
    
    return true;
  } catch (error) {
    console.error("Error al verificar/crear la tabla Route:", error);
    return false;
  }
}

export async function GET() {
  try {
    console.log("Iniciando GET /api/routes...");
    
    // Verificar la conexión a la base de datos
    console.log("Probando conexión a la base de datos...");
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json({ error: 'Error de conexión a la base de datos' }, { status: 500 });
    }
    
    // Asegurarse de que la tabla Route exista
    const tableReady = await ensureRouteTableExists();
    if (!tableReady) {
      return NextResponse.json({ error: 'Error al inicializar la tabla de rutas' }, { status: 500 });
    }
    
    console.log("Obteniendo rutas de la base de datos...");
    const routes = await db.route.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    console.log(`Se encontraron ${routes.length} rutas en la base de datos`);

    // Convertir fotos de string separado por ||| a array
    const routesWithPhotosArray = routes.map(route => {
      const photos = route.photos ? route.photos.split("|||").filter(Boolean) : [];
      console.log(`Procesando ruta ${route.name} (${route.id}):`, { photosCount: photos.length, hasPhotos: photos.length > 0 });
      return {
        ...route,
        photos
      };
    });

    console.log(`Retornando ${routesWithPhotosArray.length} rutas procesadas`);
    return NextResponse.json(routesWithPhotosArray);
  } catch (error) {
    console.error("Error fetching routes:", error);
    return NextResponse.json({ error: "Error fetching routes", details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Asegurarse de que la tabla Route exista antes de intentar crear una ruta
    const tableReady = await ensureRouteTableExists();
    if (!tableReady) {
      return NextResponse.json({ error: 'Error al inicializar la tabla de rutas' }, { status: 500 });
    }

    // Clonar la solicitud para poder leer el cuerpo múltiples veces
    const clonedRequest = request.clone();
    const body = await clonedRequest.json();
    
    // Registrar el tamaño del payload
    const payloadSize = JSON.stringify(body).length;
    console.log("📦 Payload recibido:", { 
      size: payloadSize, 
      sizeKB: Math.round(payloadSize / 1024 * 100) / 100 
    });

    const { name, province, distance, routeType, difficulty, elevationGain, comments, mapsLink, wikilocLink, photos, gpsTrack, gpsTrackName } = body;

    console.log("Recibiendo ruta:", { 
      name, 
      province, 
      distance, 
      routeType, 
      difficulty, 
      elevationGain,
      comments, 
      mapsLink, 
      wikilocLink, 
      photosCount: photos?.length,
      hasGpsTrack: !!gpsTrack,
      gpsTrackName,
      gpsTrackSize: gpsTrack ? gpsTrack.length : 0
    }); // Debug más completo

    // Validación básica
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: 'El nombre de la ruta es obligatorio' }, { status: 400 });
    }

    // Convertir array de fotos a string separado por |||
    const photosString = photos && photos.length > 0 ? photos.join("|||") : null;
    
    console.log("Photos string length:", photosString?.length); // Debug

    // Validar y procesar el track GPS
    let processedGpsTrack = null;
    if (gpsTrack && gpsTrack.trim() !== "") {
      // Si el track GPS viene como data URL, extraer solo la parte base64
      if (gpsTrack.startsWith('data:')) {
        const base64Part = gpsTrack.split(',')[1];
        if (base64Part) {
          processedGpsTrack = base64Part;
        } else {
          console.warn("Track GPS con formato data URL inválido");
        }
      } else {
        // Si ya es base64 puro, usarlo directamente
        processedGpsTrack = gpsTrack;
      }
    }
    
    console.log("GPS track procesado:", { 
      hasOriginal: !!gpsTrack, 
      hasProcessed: !!processedGpsTrack,
      originalSize: gpsTrack?.length,
      processedSize: processedGpsTrack?.length 
    });

    // Preparar datos para la base de datos
    const routeData = {
      name: name.trim(),
      province: province && province.trim() !== "" ? province.trim() : null,
      distance: distance && distance.trim() !== "" ? distance.trim() : null,
      routeType: routeType && routeType.trim() !== "" ? routeType.trim() : null,
      difficulty: difficulty && difficulty.trim() !== "" ? difficulty.trim() : null,
      elevationGain: elevationGain && elevationGain.trim() !== "" ? elevationGain.trim() : null,
      comments: comments && comments.trim() !== "" ? comments.trim() : null,
      mapsLink: mapsLink && mapsLink.trim() !== "" ? mapsLink.trim() : null,
      wikilocLink: wikilocLink && wikilocLink.trim() !== "" ? wikilocLink.trim() : null,
      photos: photosString,
      gpsTrack: processedGpsTrack,
      gpsTrackName: gpsTrackName && gpsTrackName.trim() !== "" ? gpsTrackName.trim() : null
    };

    console.log("Datos a guardar en BD:", routeData); // Debug

    try {
      const route = await db.route.create({
        data: routeData
      });

      // Devolver la ruta con fotos como array
      const routeWithPhotosArray = {
        ...route,
        photos: route.photos ? route.photos.split("|||").filter(Boolean) : []
      };

      console.log("Ruta creada exitosamente:", { 
        id: route.id, 
        name: route.name,
        photosCount: routeWithPhotosArray.photos.length,
        firstPhoto: routeWithPhotosArray.photos[0]?.substring(0, 50) + "..."
      }); // Debug

      return NextResponse.json(routeWithPhotosArray, { status: 201 });
    } catch (dbError) {
      console.error("Error específico de la base de datos:", dbError);
      return NextResponse.json({ 
        error: "Error de base de datos al crear la ruta", 
        details: dbError.message 
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Error creating route:", error);
    return NextResponse.json({ error: "Error creating route" }, { status: 500 });
  }
}