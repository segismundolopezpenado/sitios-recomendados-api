import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, province, distance, routeType, difficulty, elevationGain, comments, mapsLink, wikilocLink, photos, gpsTrack, gpsTrackName } = body;

    console.log("📝 Actualizando ruta:", { 
      id, 
      name, 
      photosCount: photos?.length,
      hasGpsTrack: !!gpsTrack,
      gpsTrackName,
      gpsTrackSize: gpsTrack?.length || 0,
      elevationGain
    });

    // Convertir array de fotos a string separado por |||
    const photosString = photos && photos.length > 0 ? photos.join("|||") : null;

    // Validar y procesar el track GPS
    let processedGpsTrack = null;
    if (gpsTrack && gpsTrack.trim() !== "") {
      // Si el track GPS viene como data URL, extraer solo la parte base64
      if (gpsTrack.startsWith('data:')) {
        const base64Part = gpsTrack.split(',')[1];
        if (base64Part) {
          processedGpsTrack = base64Part;
        } else {
          console.warn("⚠️ Track GPS con formato data URL inválido");
        }
      } else {
        // Si ya es base64 puro, usarlo directamente
        processedGpsTrack = gpsTrack;
      }
    }
    
    console.log("🔄 GPS track procesado (edición):", { 
      hasOriginal: !!gpsTrack, 
      hasProcessed: !!processedGpsTrack,
      originalSize: gpsTrack?.length,
      processedSize: processedGpsTrack?.length 
    });

    const route = await db.route.update({
      where: { id },
      data: {
        name,
        province: province || null,
        distance: distance || null,
        routeType: routeType || null,
        difficulty: difficulty || null,
        elevationGain: elevationGain || null,
        comments: comments || null,
        mapsLink: mapsLink || null,
        wikilocLink: wikilocLink || null,
        photos: photosString,
        gpsTrack: processedGpsTrack,
        gpsTrackName: gpsTrackName || null
      }
    });

    // Devolver la ruta con fotos como array
    const routeWithPhotosArray = {
      ...route,
      photos: route.photos ? route.photos.split("|||").filter(Boolean) : []
    };

    console.log("✅ Ruta actualizada:", { 
      id: route.id, 
      name: route.name,
      photosCount: routeWithPhotosArray.photos.length,
      hasGpsTrack: !!route.gpsTrack,
      gpsTrackName: route.gpsTrackName,
      elevationGain: route.elevationGain
    });

    return NextResponse.json(routeWithPhotosArray);
  } catch (error) {
    console.error("❌ Error updating route:", error);
    return NextResponse.json({ error: "Error updating route" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.route.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Route deleted successfully" });
  } catch (error) {
    console.error("Error deleting route:", error);
    return NextResponse.json({ error: "Error deleting route" }, { status: 500 });
  }
}