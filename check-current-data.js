const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCurrentData() {
  try {
    console.log('Verificando datos actuales en la base de datos...');
    
    // Verificar rutas
    const routes = await prisma.route.findMany();
    console.log(`Rutas encontradas: ${routes.length}`);
    routes.forEach(route => {
      console.log(`- ${route.name} (ID: ${route.id})`);
    });
    
    // Verificar sitios
    const sites = await prisma.site.findMany();
    console.log(`Sitios encontrados: ${sites.length}`);
    sites.forEach(site => {
      console.log(`- ${site.name} (ID: ${site.id})`);
    });
    
    if (routes.length === 0 && sites.length === 0) {
      console.log('La base de datos está vacía. Restaurando datos de ejemplo...');
      await restoreSampleData();
    }
    
  } catch (error) {
    console.error('Error al verificar datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function restoreSampleData() {
  try {
    // Crear sitios de ejemplo
    const sampleSites = [
      {
        name: "Comer y picar",
        city: "Betanzos",
        province: "A Coruña",
        priceRange: "15-30€",
        type: "comer",
        comments: "Buen sitio para comer tapas",
        photos: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop|||https://images.unsplash.com/photo-1600891964599-f2b8d1b6b6b7?w=800&h=600&fit=crop",
        mapsLink: "https://maps.google.com/?q=Comer+y+picar+Betanzos"
      },
      {
        name: "Javimar",
        city: "A Coruña",
        province: "A Coruña", 
        priceRange: "15-40€",
        type: "comer",
        comments: "Restaurante familiar con buena comida",
        photos: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop|||https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
        mapsLink: "https://maps.google.com/?q=Javimar+A+Coruña"
      },
      {
        name: "Apartamentos Turisticos A Estacion",
        city: "Santiago",
        province: "A Coruña",
        priceRange: "30-50€",
        type: "dormir",
        comments: "Apartamentos céntricos y cómodos",
        photos: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop|||https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
        mapsLink: "https://maps.google.com/?q=Apartamentos+A+Estacion+Santiago"
      }
    ];

    // Crear rutas de ejemplo
    const sampleRoutes = [
      {
        name: "Monte Pindo",
        province: "A Coruña",
        distance: "12",
        elevation: "450",
        routeType: "Circular",
        difficulty: "Moderado",
        comments: "Ruta espectacular con vistas al Atlántico",
        mapsLink: "https://maps.google.com/?q=Monte+Pindo+A+Coruña",
        wikilocLink: "https://www.wikiloc.com/wikiloc/spatial.do?event=details&id=12345",
        gpxLink: "https://example.com/monte-pindo.gpx",
        photos: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop"
      },
      {
        name: "Monte Xalo",
        province: "A Coruña",
        distance: "8",
        elevation: "320",
        routeType: "Ida y vuelta",
        difficulty: "Fácil",
        comments: "Ruta sencilla ideal para familias",
        mapsLink: "https://maps.google.com/?q=Monte+Xalo+A+Coruña",
        wikilocLink: "https://www.wikiloc.com/wikiloc/spatial.do?event=details&id=67890",
        gpxLink: "https://example.com/monte-xalo.gpx",
        photos: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&h=600&fit=crop"
      }
    ];

    // Insertar sitios
    console.log('Creando sitios de ejemplo...');
    for (const site of sampleSites) {
      await prisma.site.create({ data: site });
      console.log(`- Sitio creado: ${site.name}`);
    }

    // Insertar rutas
    console.log('Creando rutas de ejemplo...');
    for (const route of sampleRoutes) {
      await prisma.route.create({ data: route });
      console.log(`- Ruta creada: ${route.name}`);
    }

    console.log('Datos de ejemplo restaurados exitosamente');

  } catch (error) {
    console.error('Error al restaurar datos:', error);
  }
}

checkCurrentData();