import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, city, province, priceRange, comments, type, photos, mapsLink } = body;

    // Convertir array de fotos a string separado por |||
    const photosString = photos && photos.length > 0 ? photos.join("|||") : null;

    const site = await db.site.update({
      where: { id },
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

    return NextResponse.json(siteWithPhotosArray);
  } catch (error) {
    console.error("Error updating site:", error);
    return NextResponse.json({ error: "Error updating site" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.site.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Site deleted successfully" });
  } catch (error) {
    console.error("Error deleting site:", error);
    return NextResponse.json({ error: "Error deleting site" }, { status: 500 });
  }
}