import { NextRequest, NextResponse } from "next/server";
import { db, checkDatabaseConnection } from "@/lib/db";

export async function GET() {
  try {
    console.log("Iniciando GET /api/routes...");
    
    // Verificar la conexión a la base de datos
    console.log("Probando conexión a la base de datos...");
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json({ error: 'Error de conexión a la base de datos' }, { status: 500 });
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
    const body = await request.json();
    const { name, province, distance, elevation, routeType, difficulty, comments, mapsLink, wikilocLink, gpxLink, photos } = body;

    console.log("=== INICIO CREACIÓN DE RUTA ===");
    console.log("Datos recibidos:", { 
      name, 
      province, 
      distance, 
      elevation, 
      routeType, 
      difficulty, 
      hasComments: !!comments,
      hasMapsLink: !!mapsLink,
      hasWikilocLink: !!wikilocLink,
      hasGpxLink: !!gpxLink,
      photosCount: photos?.length,
      gpxLinkLength: gpxLink?.length
    });

    // Validación básica
    if (!name || name.trim() === "") {
      console.error("Error: Nombre de ruta es requerido");
      return NextResponse.json({ error: "El nombre de la ruta es requerido" }, { status: 400 });
    }

    console.log("Validación básica superada");

    // Convertir array de fotos a string separado por |||
    const photosString = photos && photos.length > 0 ? photos.join("|||") : null;
    
    console.log("Photos string procesado, length:", photosString?.length);

    // Verificar la conexión a la base de datos
    console.log("Verificando conexión a la base de datos...");
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      console.error("Error: No hay conexión a la base de datos");
      return NextResponse.json({ error: 'Error de conexión a la base de datos' }, { status: 500 });
    }

    console.log("Conexión a la base de datos OK, creando ruta...");

    const route = await db.route.create({
      data: {
        name: name.trim(),
        province: province ? province.trim() : null,
        distance: distance ? distance.trim() : null,
        elevation: elevation ? elevation.trim() : null,
        routeType: routeType ? routeType.trim() : null,
        difficulty: difficulty ? difficulty.trim() : null,
        comments: comments ? comments.trim() : null,
        mapsLink: mapsLink ? mapsLink.trim() : null,
        wikilocLink: wikilocLink ? wikilocLink.trim() : null,
        gpxLink: gpxLink ? gpxLink.trim() : null,
        photos: photosString
      }
    });

    console.log("Ruta creada exitosamente:", { 
      id: route.id, 
      name: route.name,
      hasPhotos: !!route.photos,
      photosLength: route.photos?.length
    });

    // Devolver la ruta con fotos como array
    const routeWithPhotosArray = {
      ...route,
      photos: route.photos ? route.photos.split("|||").filter(Boolean) : []
    };

    console.log("=== RUTA CREADA EXITOSAMENTE ===");
    return NextResponse.json(routeWithPhotosArray, { status: 201 });
  } catch (error) {
    console.error("=== ERROR CREANDO RUTA ===");
    console.error("Error completo:", error);
    console.error("Mensaje de error:", error.message);
    console.error("Stack trace:", error.stack);
    
    return NextResponse.json({ 
      error: "Error creating route", 
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}