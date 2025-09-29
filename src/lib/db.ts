import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Verificar que la URL de la base de datos esté configurada
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL no está configurada en las variables de entorno");
  // En desarrollo, podemos continuar con una URL por defecto para pruebas
  if (process.env.NODE_ENV === 'development') {
    console.warn("Usando URL de base de datos por defecto para desarrollo");
  }
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    datasources: {
      db: {
        url: databaseUrl || 'file:./dev.db'
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Exportar una función para verificar la conexión
export const checkDatabaseConnection = async () => {
  try {
    await db.$queryRaw`SELECT 1`;
    console.log("Conexión a la base de datos verificada exitosamente");
    return true;
  } catch (error) {
    console.error("Error al verificar la conexión a la base de datos:", error);
    return false;
  }
}