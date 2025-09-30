import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, province, distance, elevation, routeType, difficulty, comments, mapsLink, wikilocLink, gpxLink, photos } = body;

    console.log("Actualizando ruta:", { id, name, photosCount: photos?.length }); // Debug

    // Try to add missing columns if they don't exist
    try {
      await db.$executeRaw`ALTER TABLE Route ADD COLUMN elevation TEXT`;
      console.log("Elevation column added successfully");
    } catch (error: any) {
      if (error.message?.includes('duplicate column name') || error.code === 'SQLITE_ERROR') {
        console.log("Elevation column already exists");
      } else {
        console.log("Error adding elevation column:", error.message);
      }
    }

    try {
      await db.$executeRaw`ALTER TABLE Route ADD COLUMN gpxLink TEXT`;
      console.log("gpxLink column added successfully");
    } catch (error: any) {
      if (error.message?.includes('duplicate column name') || error.code === 'SQLITE_ERROR') {
        console.log("gpxLink column already exists");
      } else {
        console.log("Error adding gpxLink column:", error.message);
      }
    }

    // Convertir array de fotos a string separado por |||
    const photosString = photos && photos.length > 0 ? photos.join("|||") : null;

    const route = await db.route.update({
      where: { id },
      data: {
        name,
        province: province || null,
        distance: distance || null,
        elevation: elevation || null,
        routeType: routeType || null,
        difficulty: difficulty || null,
        comments: comments || null,
        mapsLink: mapsLink || null,
        wikilocLink: wikilocLink || null,
        gpxLink: gpxLink || null,
        photos: photosString
      }
    });

    // Devolver la ruta con fotos como array
    const routeWithPhotosArray = {
      ...route,
      photos: route.photos ? route.photos.split("|||").filter(Boolean) : []
    };

    console.log("Ruta actualizada:", { 
      id: route.id, 
      photosCount: routeWithPhotosArray.photos.length
    }); // Debug

    return NextResponse.json(routeWithPhotosArray);
  } catch (error) {
    console.error("Error updating route:", error);
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