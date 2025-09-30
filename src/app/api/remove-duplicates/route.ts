import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Verificar contraseña
    const correctPassword = "z128488ia";
    if (password !== correctPassword) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    // Obtener todos los sitios
    const allSites = await db.site.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Encontrar duplicados por nombre
    const nameGroups = {};
    allSites.forEach(site => {
      if (!nameGroups[site.name]) {
        nameGroups[site.name] = [];
      }
      nameGroups[site.name].push(site);
    });

    // Encontrar grupos duplicados
    const duplicateGroups = Object.values(nameGroups).filter(group => group.length > 1);
    
    let deletedCount = 0;
    const deletedSites = [];

    // Para cada grupo duplicado, mantener el más reciente y eliminar los demás
    for (const group of duplicateGroups) {
      // Ordenar por fecha de creación (más reciente primero)
      group.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Mantener el primero (más reciente) y eliminar los demás
      for (let i = 1; i < group.length; i++) {
        const siteToDelete = group[i];
        try {
          await db.site.delete({
            where: { id: siteToDelete.id }
          });
          deletedCount++;
          deletedSites.push({
            id: siteToDelete.id,
            name: siteToDelete.name,
            city: siteToDelete.city,
            createdAt: siteToDelete.createdAt
          });
        } catch (error) {
          console.error(`Error deleting site ${siteToDelete.id}:`, error);
        }
      }
    }

    return NextResponse.json({
      message: "Duplicados eliminados correctamente",
      deletedCount,
      deletedSites,
      duplicateGroupsFound: duplicateGroups.length
    });

  } catch (error) {
    console.error("Error eliminando duplicados:", error);
    return NextResponse.json({ error: "Error eliminando duplicados" }, { status: 500 });
  }
}