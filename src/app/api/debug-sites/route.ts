import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Obtener todos los sitios para depuración
    const sites = await db.site.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Formatear los sitios para mostrar información útil
    const debugInfo = sites.map(site => ({
      id: site.id,
      name: site.name,
      city: site.city,
      province: site.province,
      type: site.type,
      photosCount: site.photos ? site.photos.split('|||').filter(Boolean).length : 0,
      createdAt: site.createdAt,
      updatedAt: site.updatedAt
    }));

    // Buscar duplicados por nombre
    const nameCounts = {};
    sites.forEach(site => {
      nameCounts[site.name] = (nameCounts[site.name] || 0) + 1;
    });

    const duplicates = Object.entries(nameCounts)
      .filter(([name, count]) => count > 1)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({
      totalSites: sites.length,
      duplicates,
      sites: debugInfo
    });
  } catch (error) {
    console.error("Error en depuración:", error);
    return NextResponse.json({ error: "Error en depuración" }, { status: 500 });
  }
}