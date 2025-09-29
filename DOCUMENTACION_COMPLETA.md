# Documentación Completa - API Sitios Recomendados

## 📋 Resumen del Proyecto

Aplicación web completa para gestionar sitios recomendados (restaurantes, hoteles) y rutas con GPS, construida con Next.js 15, TypeScript, Prisma y SQLite.

### Características Principales
- 🏪 Gestión de sitios (comer/dormir) con fotos, comentarios y enlaces
- 🥾 Gestión de rutas con tracks GPS, distancia, desnivel, dificultad
- 📱 Interfaz responsive con diseño moderno
- 🗺️ Integración con Google Maps y Wikiloc
- 📊 Sistema de contadores y filtros
- 🔄 Subida y descarga de tracks GPS (GPX/KML)

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS 4
- **Componentes**: shadcn/ui
- **Iconos**: Lucide React
- **Estado**: Zustand + TanStack Query

### Backend
- **API**: Endpoints REST con Next.js API Routes
- **Base de Datos**: SQLite con Prisma ORM
- **Autenticación**: NextAuth.js (disponible)
- **Real-time**: Socket.io (configurado)
- **AI SDK**: z-ai-web-dev-sdk (integrado)

## 📁 Estructura del Proyecto

```
/home/z/my-project/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Página principal
│   │   ├── api/
│   │   │   ├── sites/              # API de sitios
│   │   │   │   ├── route.ts        # GET/POST sitios
│   │   │   │   └── [id]/route.ts   # PUT/DELETE sitios
│   │   │   └── routes/             # API de rutas
│   │   │       ├── route.ts        # GET/POST rutas
│   │   │       └── [id]/route.ts   # PUT/DELETE rutas
│   │   └── layout.tsx              # Layout principal
│   ├── components/
│   │   └── ui/                     # Componentes shadcn/ui
│   └── lib/
│       ├── db.ts                   # Configuración Prisma
│       └── utils.ts                # Utilidades
├── prisma/
│   └── schema.prisma               # Esquema de base de datos
├── db/
│   └── custom.db                   # Base de datos SQLite
├── package.json                    # Dependencias
├── tailwind.config.ts             # Configuración Tailwind
└── tsconfig.json                  # Configuración TypeScript
```

## 🗄️ Base de Datos

### Ubicación
- **Archivo**: `/home/z/my-project/db/custom.db`
- **Motor**: SQLite
- **ORM**: Prisma

### Esquema

#### Tabla `Site`
```sql
- id: String (Primary Key)
- name: String
- city: String
- province: String
- priceRange: String
- comments: String?
- type: String ("comer" | "dormir")
- photos: String? (URLs separadas por |||)
- mapsLink: String?
- createdAt: DateTime
- updatedAt: DateTime
```

#### Tabla `Route`
```sql
- id: String (Primary Key)
- name: String
- province: String?
- distance: String?
- routeType: String?
- difficulty: String?
- elevationGain: String?
- comments: String?
- mapsLink: String?
- wikilocLink: String?
- photos: String? (URLs separadas por |||)
- gpsTrack: String? (Base64 GPX/KML)
- gpsTrackName: String?
- createdAt: DateTime
- updatedAt: DateTime
```

## 🌐 API Endpoints

### Sitios

#### GET `/api/sites`
- **Descripción**: Obtener todos los sitios
- **Response**: Array de objetos `Site`
- **Ejemplo**:
```json
[
  {
    "id": "cmg3jqe6h0000qa6avprr7cx7",
    "name": "Comer y picar",
    "city": "Betanzos",
    "province": "A Coruña",
    "priceRange": "15-30€",
    "comments": "Excelente comida casera",
    "type": "comer",
    "photos": ["data:image/jpeg;base64,...|||data:image/jpeg;base64,..."],
    "mapsLink": "https://maps.google.com/...",
    "createdAt": "2024-09-02T10:30:00.000Z",
    "updatedAt": "2024-09-02T10:30:00.000Z"
  }
]
```

#### POST `/api/sites`
- **Descripción**: Crear nuevo sitio
- **Body**: Objeto `Site` (sin id, createdAt, updatedAt)
- **Response**: Objeto `Site` creado

#### PUT `/api/sites/[id]`
- **Descripción**: Actualizar sitio existente
- **Body**: Objeto `Site` actualizado
- **Response**: Objeto `Site` actualizado

#### DELETE `/api/sites/[id]`
- **Descripción**: Eliminar sitio
- **Response**: Success message

### Rutas

#### GET `/api/routes`
- **Descripción**: Obtener todas las rutas
- **Response**: Array de objetos `Route`

#### POST `/api/routes`
- **Descripción**: Crear nueva ruta
- **Body**: Objeto `Route` (sin id, createdAt, updatedAt)
- **Special**: Maneja tracks GPS en base64
- **Response**: Objeto `Route` creado

#### PUT `/api/routes/[id]`
- **Descripción**: Actualizar ruta existente
- **Body**: Objeto `Route` actualizado
- **Special**: Maneja tracks GPS en base64
- **Response**: Objeto `Route` actualizado

#### DELETE `/api/routes/[id]`
- **Descripción**: Eliminar ruta
- **Response**: Success message

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js 18+
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd <nombre-del-proyecto>
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env
echo "DATABASE_URL=file:./db/custom.db" > .env
```

4. **Generar cliente Prisma**
```bash
npm run db:generate
```

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

### Scripts Disponibles
```json
{
  "dev": "nodemon --exec \"npx tsx server.ts\" --watch server.ts --watch src --ext ts,tsx,js,jsx 2>&1 | tee dev.log",
  "build": "next build",
  "start": "NODE_ENV=production tsx server.ts 2>&1 | tee server.log",
  "lint": "next lint",
  "db:push": "prisma db push",
  "db:generate": "prisma generate",
  "db:migrate": "prisma migrate dev",
  "db:reset": "prisma migrate reset"
}
```

## 🎨 Características de la Interfaz

### Diseño Principal
- **Tema**: Gradiente desde gris/azul hasta violeta
- **Componentes**: shadcn/ui con estilo New York
- **Responsive**: Mobile-first con breakpoints
- **Colores**: Sin indigo/azul (usar verdes, naranjas, morados)

### Organización de Elementos
- **Botones de acción**: Maps, Wikiloc, Track, Editar, Borrar (misma línea)
- **Campos de ruta**: 
  - Línea 1: Distancia | Desnivel +
  - Línea 2: Tipo de ruta | Dificultad
- **Cuadro de resumen**: Minimalista, sin marco ni botón de actualizar

### Funcionalidades Especiales
- **Upload de fotos**: Múltiple, con vista previa
- **Tracks GPS**: Soporte para GPX/KML, límite 1MB
- **Filtros**: Por tipo (todos/comer/dormir/rutas) y búsqueda
- **Contadores**: Tiempo real, actualizados automáticamente

## 🔧 Configuraciones Importantes

### Base de Datos
- **URL por defecto**: `file:./dev.db`
- **URL actual**: `file:./db/custom.db`
- **Conexión**: Automática con verificación

### Límites y Restricciones
- **Tamaño de fotos**: Variable (recomendado < 5MB)
- **Tamaño de tracks GPS**: 1MB máximo
- **Formatos soportados**: GPX, KML
- **Tipos de archivos de imagen**: JPG, PNG, GIF, WebP

### Variables de Entorno
```env
DATABASE_URL=file:./db/custom.db
NODE_ENV=development
```

## 📝 Notas para Desarrollo Futuro

### Características Implementadas
✅ CRUD completo para sitios y rutas  
✅ Upload de fotos y tracks GPS  
✅ Interfaz responsive y moderna  
✅ Integración con mapas  
✅ Sistema de filtros y búsqueda  
✅ Contadores en tiempo real  

### Posibles Mejoras
- [ ] Sistema de usuarios y autenticación
- [ ] Comentarios y valoraciones
- [ ] Categorías adicionales
- [ ] Búsqueda avanzada
- [ ] Exportación/Importación de datos
- [ ] Sistema de favoritos
- [ ] Notificaciones en tiempo real

## 🆘 Soporte y Mantenimiento

### Para Contactar con el Desarrollador
- **Contexto del proyecto**: Aplicación Next.js con API REST
- **Base de datos**: SQLite con Prisma
- **Funcionalidades clave**: Gestión de sitios, rutas con GPS, fotos
- **Stack**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui

### Problemas Comunes y Soluciones

1. **Error de conexión a base de datos**
   - Verificar `DATABASE_URL` en `.env`
   - Ejecutar `npm run db:push`

2. **Error al subir archivos grandes**
   - Verificar límites de tamaño (1MB para tracks GPS)
   - Optimizar imágenes antes de subir

3. **Problemas con dependencias**
   - Ejecutar `npm install`
   - Limpiar caché: `npm cache clean --force`

## 📊 Información del Entorno Actual

### Sistema
- **Node.js**: Versión actual
- **npm**: Versión actual
- **Sistema**: Linux/Unix

### Dependencias Clave
- **next**: 15.3.5
- **react**: 19.0.0
- **@prisma/client**: 6.11.1
- **tailwindcss**: 4
- **typescript**: 5

### Estado Actual
- **Última actualización**: Septiembre 2024
- **Versión**: 0.1.0
- **Estado**: Funcional y en producción
- **Base de datos**: Operativa con datos de prueba

---

*Este documento fue generado automáticamente y contiene toda la información necesaria para continuar el desarrollo del proyecto.*