import { NextRequest, NextResponse } from "next/server";
import { db, checkDatabaseConnection } from "@/lib/db";

export async function GET() {
  try {
    console.log("Iniciando GET /api/sites...");
    
    // Verificar la conexión a la base de datos
    console.log("Probando conexión a la base de datos...");
    const isConnected = await checkDatabaseConnection();
    if (!isConnected) {
      return NextResponse.json({ error: 'Error de conexión a la base de datos' }, { status: 500 });
    }
    
    console.log("Obteniendo sitios de la base de datos...");
    const sites = await db.site.findMany({
      orderBy: {
        createdAt: "desc"
      }
    });

    console.log(`Se encontraron ${sites.length} sitios en la base de datos`);

    // Convertir fotos de string separado por ||| a array
    const sitesWithPhotosArray = sites.map(site => {
      const photos = site.photos ? site.photos.split("|||").filter(Boolean) : [];
      console.log(`Procesando sitio ${site.name} (${site.id}):`, { photosCount: photos.length, hasPhotos: photos.length > 0 });
      return {
        ...site,
        photos
      };
    });

    console.log(`Retornando ${sitesWithPhotosArray.length} sitios procesados`);
    return NextResponse.json(sitesWithPhotosArray);
  } catch (error) {
    console.error("Error fetching sites:", error);
    return NextResponse.json({ error: "Error fetching sites", details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, city, province, priceRange, comments, type, photos, mapsLink } = body;

    console.log("Recibiendo sitio:", { name, photosCount: photos?.length }); // Debug

    // Convertir array de fotos a string separado por |||
    const photosString = photos && photos.length > 0 ? photos.join("|||") : null;
    
    console.log("Photos string length:", photosString?.length); // Debug

    const site = await db.site.create({
      data: {
        name,
        city,
        province,
        priceRange,
        comments,
        type,
        photos: photosString,
        mapsLink
      }
    });

    // Devolver el sitio con fotos como array
    const siteWithPhotosArray = {
      ...site,
      photos: site.photos ? site.photos.split("|||").filter(Boolean) : []
    };

    console.log("Sitio creado:", { 
      id: site.id, 
      photosCount: siteWithPhotosArray.photos.length,
      firstPhoto: siteWithPhotosArray.photos[0]?.substring(0, 50) + "..."
    }); // Debug

    return NextResponse.json(siteWithPhotosArray, { status: 201 });
  } catch (error) {
    console.error("Error creating site:", error);
    return NextResponse.json({ error: "Error creating site" }, { status: 500 });
  }
}