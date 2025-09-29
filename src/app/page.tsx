"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit, Trash2, Plus, Search, Upload, ZoomIn, Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Site {
  id: string;
  name: string;
  city: string;
  province: string;
  priceRange: string;
  comments: string;
  type: "comer" | "dormir";
  photos: string[];
  mapsLink?: string;
  createdAt: string;
  updatedAt: string;
}

interface Route {
  id: string;
  name: string;
  province?: string;
  distance?: string;
  elevation?: string; // Added elevation field
  routeType?: string;
  difficulty?: string;
  comments?: string;
  mapsLink?: string;
  wikilocLink?: string;
  gpxLink?: string; // Added GPX download link field
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}



const provinces = [
  "A Coruña",
  "Lugo",
  "Ourense",
  "Pontevedra",
  "Asturias",
  "Cantabria",
  "León",
  "Madrid"
];

const priceRanges = [
  "10-20€",
  "15-30€",
  "15-40€",
  "20-30€",
  "20-40€",
  "20-50€",
  "30-40€",
  "30-50€",
  "+50€"
];

const routeTypes = [
  "Circular",
  "Lineal",
  "Ida y vuelta",
  "Enlazado"
];

const difficulties = [
  "Fácil",
  "Moderado",
  "Difícil",
  "Muy difícil"
];



export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"todos" | "comer" | "dormir" | "rutas">("todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddRouteDialogOpen, setIsAddRouteDialogOpen] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  // Routes state - now with optional fields except name
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [pendingDeleteAction, setPendingDeleteAction] = useState<{
    type: 'delete-site' | 'delete-route';
    id: string;
  } | null>(null);


  const handleImageClick = (imageSrc: string) => {
    setSelectedImage(imageSrc);
    setIsImageModalOpen(true);
  };

  const requirePasswordForDelete = (actionType: 'delete-site' | 'delete-route', id: string) => {
    setPendingDeleteAction({ type: actionType, id });
    setPasswordDialogOpen(true);
    setPasswordInput("");
  };

  const executeDeleteAction = async () => {
    console.log("executeDeleteAction called", { pendingDeleteAction, passwordInput: !!passwordInput });
    
    if (!pendingDeleteAction || !passwordInput) {
      toast.error("Por favor, introduce la contraseña");
      return;
    }

    const correctPassword = "z128488ia";
    if (passwordInput !== correctPassword) {
      toast.error("Contraseña incorrecta");
      // No cerrar el diálogo para permitir intentar de nuevo
      return;
    }

    console.log("Password correct, proceeding with deletion");
    setIsSubmitting(true);

    try {
      let response;
      const { type, id } = pendingDeleteAction;

      switch (type) {
        case 'delete-site':
          console.log("Deleting site:", id);
          response = await fetch(`/api/sites/${id}`, {
            method: "DELETE",
          });
          console.log("Delete site response:", { status: response.status, ok: response.ok });
          if (response.ok) {
            setSites(prev => prev.filter(site => site.id !== id));
            toast.success("Sitio eliminado correctamente");
            // Pequeña demora antes de refrescar para asegurar que el estado se actualice
            setTimeout(() => {
              refreshData();
            }, 100);
          } else {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            toast.error("Error al eliminar el sitio");
          }
          break;

        case 'delete-route':
          console.log("Deleting route:", id);
          response = await fetch(`/api/routes/${id}`, {
            method: "DELETE",
          });
          console.log("Delete route response:", { status: response.status, ok: response.ok });
          if (response.ok) {
            setRoutes(prev => prev.filter(route => route.id !== id));
            toast.success("Ruta eliminada correctamente");
            // Pequeña demora antes de refrescar para asegurar que el estado se actualice
            setTimeout(() => {
              refreshData();
            }, 100);
          } else {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            toast.error("Error al eliminar la ruta");
          }
          break;
      }
    } catch (error) {
      console.error("Error in delete operation:", error);
      toast.error("Error de conexión");
    } finally {
      console.log("Finally block - closing dialog");
      // Siempre cerrar el diálogo y limpiar después de intentar eliminar
      setTimeout(() => {
        setPasswordDialogOpen(false);
        setPendingDeleteAction(null);
        setPasswordInput("");
        setIsSubmitting(false);
      }, 100);
    }
  };



  // Cargar sitios desde la API
  const loadSites = async () => {
    try {
      console.log("Cargando sitios desde /api/sites...");
      const response = await fetch("/api/sites");
      console.log("Respuesta de sitios:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Sitios cargados:", data.map((site: any) => ({ 
          id: site.id, 
          name: site.name, 
          photosCount: site.photos?.length || 0 
        })));
        setSites(data);
      } else {
        const errorText = await response.text();
        console.error("Error al cargar sitios:", errorText);
        toast.error(`Error al cargar los sitios: ${errorText}`);
      }
    } catch (error) {
      console.error("Error de conexión al cargar sitios:", error);
      toast.error(`Error de conexión al cargar sitios: ${error.message}`);
    }
  };

  // Cargar rutas desde la API
  const loadRoutes = async () => {
    try {
      console.log("Cargando rutas desde /api/routes...");
      const response = await fetch("/api/routes");
      console.log("Respuesta de rutas:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Rutas cargadas:", data.map((route: any) => ({ 
          id: route.id, 
          name: route.name 
        })));
        setRoutes(data);
      } else {
        const errorText = await response.text();
        console.error("Error al cargar rutas:", errorText);
        toast.error(`Error al cargar las rutas: ${errorText}`);
      }
    } catch (error) {
      console.error("Error de conexión al cargar rutas:", error);
      toast.error(`Error de conexión al cargar rutas: ${error.message}`);
    }
  };



  // Función para refrescar todos los datos
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadSites(), loadRoutes()]);
      toast.success("Datos actualizados");
    } catch (error) {
      toast.error("Error al actualizar los datos");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadSites(), loadRoutes()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         site.province.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "todos" || site.type === filterType;
    return matchesSearch && matchesType;
  });

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (route.province && route.province.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === "todos" || filterType === "rutas";
    return matchesSearch && matchesType;
  });



  // Contadores para el resumen
  const totalRutas = routes.length;
  const totalComer = sites.filter(site => site.type === "comer").length;
  const totalDormir = sites.filter(site => site.type === "dormir").length;
  
  // Contadores filtrados
  const filteredRutasCount = filteredRoutes.length;
  const filteredComerCount = filteredSites.filter(site => site.type === "comer").length;
  const filteredDormirCount = filteredSites.filter(site => site.type === "dormir").length;

  const handleAddSite = async (siteData: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log("Enviando nuevo sitio:", {
        ...siteData,
        photos: siteData.photos.map(p => p.substring(0, 50) + "...")
      }); // Debug
      
      const response = await fetch("/api/sites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(siteData),
      });

      if (response.ok) {
        const newSite = await response.json();
        console.log("Sitio recibido:", {
          id: newSite.id,
          photosCount: newSite.photos?.length || 0
        }); // Debug
        setSites(prev => [newSite, ...prev]);
        setIsAddDialogOpen(false);
        toast.success("Sitio añadido correctamente");
        // Refrescar datos para actualizar contadores
        refreshData();
      } else {
        toast.error("Error al añadir el sitio");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleEditSite = async (siteData: Omit<Site, 'createdAt' | 'updatedAt'>) => {
    if (!editingSite) return;
    
    try {
      const response = await fetch(`/api/sites/${editingSite.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(siteData),
      });
      
      if (response.ok) {
        const updatedSite = await response.json();
        setSites(prev => prev.map(site => site.id === editingSite.id ? updatedSite : site));
        setEditingSite(null);
        toast.success("Sitio actualizado correctamente");
        refreshData();
      } else {
        toast.error("Error al actualizar el sitio");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleDeleteSite = async (siteId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este sitio?")) return;
    requirePasswordForDelete('delete-site', siteId);
  };

  // Route CRUD functions
  const handleAddRoute = async (routeData: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log("Iniciando creación de ruta:", {
      name: routeData.name,
      province: routeData.province
    });

    setIsSubmitting(true);
    
    try {
      console.log("Enviando solicitud JSON a /api/routes...");
      const response = await fetch("/api/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(routeData),
      });

      console.log("Respuesta recibida:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        const newRoute = await response.json();
        console.log("Ruta creada exitosamente:", {
          id: newRoute.id,
          name: newRoute.name
        });
        setRoutes(prev => [newRoute, ...prev]);
        setIsAddRouteDialogOpen(false);
        toast.success("Ruta añadida correctamente");
        // Refrescar datos para actualizar contadores
        refreshData();
      } else {
        const errorText = await response.text();
        console.error("Error en la respuesta del servidor:", errorText);
        toast.error(`Error al añadir la ruta: ${errorText}`);
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      toast.error(`Error de conexión: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRoute = async (routeData: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingRoute) return;
    
    try {
      const response = await fetch(`/api/routes/${editingRoute.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(routeData),
      });
      
      if (response.ok) {
        const updatedRoute = await response.json();
        setRoutes(prev => prev.map(route => route.id === editingRoute.id ? updatedRoute : route));
        setEditingRoute(null);
        toast.success("Ruta actualizada correctamente");
        refreshData();
      } else {
        toast.error("Error al actualizar la ruta");
      }
    } catch (error) {
      toast.error("Error de conexión");
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta ruta?")) return;
    requirePasswordForDelete('delete-route', routeId);
  };

  const handleViewRouteOnMaps = (route: Route) => {
    if (route.mapsLink) {
      window.open(route.mapsLink, '_blank');
    } else {
      const query = route.province ? `${route.name}, ${route.province}` : route.name;
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      window.open(url, '_blank');
    }
  };

  const handleViewOnWikiloc = (route: Route) => {
    if (route.wikilocLink) {
      window.open(route.wikilocLink, '_blank');
    } else {
      const query = route.province ? `${route.name} ${route.province}` : route.name;
      const url = `https://www.wikiloc.com/wikiloc/search.do?qt=${encodeURIComponent(query)}`;
      window.open(url, '_blank');
    }
  };

  const handleDownloadGPX = (route: Route) => {
    if (route.gpxLink) {
      try {
        // Si el enlace es un base64 (archivo cargado), descargar como archivo
        if (route.gpxLink.startsWith('data:')) {
          // Extraer el contenido base64
          const base64Content = route.gpxLink.split(',')[1];
          const decodedContent = atob(base64Content);
          
          // Crear un blob con el contenido GPX
          const blob = new Blob([decodedContent], { type: 'application/gpx+xml' });
          
          // Crear una URL para el blob
          const url = URL.createObjectURL(blob);
          
          // Crear un enlace temporal para descargar
          const a = document.createElement('a');
          a.href = url;
          a.download = `${route.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.gpx`;
          document.body.appendChild(a);
          a.click();
          
          // Limpiar
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          toast.success("Track GPX descargado correctamente");
        } else {
          // Si es una URL externa, abrirla en una nueva pestaña
          window.open(route.gpxLink, '_blank');
        }
      } catch (error) {
        console.error('Error al descargar GPX:', error);
        toast.error("Error al descargar el track GPX");
      }
    } else {
      toast.error("No hay track GPX disponible para esta ruta");
    }
  };









  const handleViewOnMaps = (site: Site) => {
    if (site.mapsLink) {
      window.open(site.mapsLink, '_blank');
    } else {
      const query = `${site.name}, ${site.city}, ${site.province}`;
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Cargando sitios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div className="text-left">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">
              Sitios Recomendados
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl">
              Descubre y comparte tus lugares favoritos para rutear, comer y dormir
            </p>
          </div>
          
          {/* Contadores */}
          <div className="min-w-[200px]">
            <div className="flex justify-between items-center mb-3">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                title="Refrescar datos"
              >
                {refreshing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-green-400 font-medium">Rutas:</span>
                <span className="text-white font-bold">{filteredRutasCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-400 font-medium">Para comer:</span>
                <span className="text-white font-bold">{filteredComerCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-400 font-medium">Para dormir:</span>
                <span className="text-white font-bold">{filteredDormirCount}</span>
              </div>
              {filterType !== "todos" && (
                <div className="pt-2 mt-2 border-t border-white/10">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-xs">Total:</span>
                    <span className="text-gray-300 text-xs font-bold">
                      {filterType === "rutas" ? totalRutas : 
                       filterType === "comer" ? totalComer : 
                       filterType === "dormir" ? totalDormir : 
                       totalRutas + totalComer + totalDormir}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Buscar por nombre, ciudad o provincia..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pl-10 h-12"
              />
            </div>
            
            <Select value={filterType} onValueChange={(value: "todos" | "comer" | "dormir" | "rutas") => setFilterType(value)}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white h-12">
                <SelectValue placeholder="Tipo de sitio" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-white/20">
                <SelectItem value="todos" className="text-white hover:bg-white/10">Todos</SelectItem>
                <SelectItem value="comer" className="text-white hover:bg-white/10">Para comer</SelectItem>
                <SelectItem value="dormir" className="text-white hover:bg-white/10">Para dormir</SelectItem>
                <SelectItem value="rutas" className="text-white hover:bg-white/10">Rutas</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 h-12 text-white font-semibold">
                    <Plus className="mr-2 h-5 w-5" />
                    Añadir Sitio
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                      Añadir Nuevo Sitio
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Completa los datos para recomendar un nuevo lugar
                    </DialogDescription>
                  </DialogHeader>
                  <AddSiteForm onSubmit={handleAddSite} onCancel={() => setIsAddDialogOpen(false)} />
                </DialogContent>
              </Dialog>

              <Dialog open={isAddRouteDialogOpen} onOpenChange={setIsAddRouteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 h-12 text-white font-semibold">
                    <Plus className="mr-2 h-5 w-5" />
                    Añadir Ruta
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                      Añadir Nueva Ruta
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">
                      Completa los datos para recomendar una nueva ruta
                    </DialogDescription>
                  </DialogHeader>
                  <AddRouteForm onSubmit={handleAddRoute} onCancel={() => setIsAddRouteDialogOpen(false)} isSubmitting={isSubmitting} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Combined Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sites */}
          {filteredSites.map((site) => (
            <Card key={site.id} className="bg-gradient-to-br from-gray-800/80 via-purple-800/60 to-violet-800/80 backdrop-blur-sm border-purple-500/30 text-white hover:border-purple-400/50 transition-all duration-300 shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                      {site.name}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {site.city}, {site.province}
                    </CardDescription>
                  </div>
                  <Badge variant={site.type === "comer" ? "default" : "secondary"} 
                         className={site.type === "comer" 
                           ? "bg-orange-500 hover:bg-orange-600 text-white" 
                           : "bg-blue-500 hover:bg-blue-600 text-white"}>
                    {site.type === "comer" ? "Para comer" : "Para dormir"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Rango de precios</p>
                    <Badge variant="outline" className="border-purple-500 text-purple-300 bg-purple-500/10">
                      {site.priceRange}
                    </Badge>
                  </div>
                  
                  {site.comments && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Comentarios</p>
                      <p className="text-gray-300 text-sm">{site.comments}</p>
                    </div>
                  )}

                  {site.photos.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Fotos ({site.photos.length})</p>
                      <div className="grid grid-cols-3 gap-2">
                        {site.photos.slice(0, 3).map((photo, index) => (
                          <div key={index} className="relative group aspect-square bg-gray-700/50 rounded-lg overflow-hidden border border-white/10 cursor-pointer" onClick={() => handleImageClick(photo)}>
                            <img 
                              src={photo} 
                              alt={`Foto ${index + 1}`} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                console.log(`Error cargando imagen ${index + 1}:`, photo.substring(0, 100)); // Debug
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-gray-500">Foto ' + (index + 1) + '</div>';
                                }
                              }}
                              onLoad={(e) => {
                                console.log(`Imagen ${index + 1} cargada correctamente`); // Debug
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex-1" onClick={() => handleViewOnMaps(site)}>
                      <MapPin className="mr-2 h-4 w-4" />
                      Maps
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setEditingSite(site)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                            Editar Sitio
                          </DialogTitle>
                          <DialogDescription className="text-gray-300">
                            Modifica los datos del sitio
                          </DialogDescription>
                        </DialogHeader>
                        {editingSite && (
                          <AddSiteForm 
                            initialData={editingSite} 
                            onSubmit={handleEditSite} 
                            onCancel={() => setEditingSite(null)} 
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDeleteSite(site.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Routes */}
          {filteredRoutes.map((route) => {
            // Ensure photos is always an array to prevent undefined errors
            const safeRoute = {
              ...route,
              photos: route.photos || []
            };
            
            return (
            <Card key={safeRoute.id} className="bg-gradient-to-br from-gray-800/80 via-green-800/60 to-blue-800/80 backdrop-blur-sm border-green-500/30 text-white hover:border-green-400/50 transition-all duration-300 shadow-xl">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                      {safeRoute.name}
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {safeRoute.province || "Sin provincia"}
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-500 hover:bg-green-600 text-white">
                    Ruta
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* First line: Distance and Elevation side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    {safeRoute.distance && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Distancia (km)</p>
                        <Badge variant="outline" className="border-green-500 text-green-300 bg-green-500/10">
                          {safeRoute.distance} km
                        </Badge>
                      </div>
                    )}

                    {safeRoute.elevation && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Desnivel + (mts)</p>
                        <Badge variant="outline" className="border-orange-500 text-orange-300 bg-orange-500/10">
                          {safeRoute.elevation} m
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Second line: Route type and difficulty side by side */}
                  <div className="grid grid-cols-2 gap-4">
                    {safeRoute.routeType && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Tipo de ruta</p>
                        <Badge variant="outline" className="border-blue-500 text-blue-300 bg-blue-500/10">
                          {safeRoute.routeType}
                        </Badge>
                      </div>
                    )}

                    {safeRoute.difficulty && (
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Dificultad</p>
                        <Badge variant="outline" className="border-yellow-500 text-yellow-300 bg-yellow-500/10">
                          {safeRoute.difficulty}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Distance field moved to first line */}
                  
                  {safeRoute.comments && (
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Comentarios</p>
                      <p className="text-gray-300 text-sm">{safeRoute.comments}</p>
                    </div>
                  )}

                  {safeRoute.photos.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Fotos ({safeRoute.photos.length})</p>
                      <div className="grid grid-cols-3 gap-2">
                        {safeRoute.photos.slice(0, 3).map((photo, index) => (
                          <div key={index} className="relative group aspect-square bg-gray-700/50 rounded-lg overflow-hidden border border-white/10 cursor-pointer" onClick={() => handleImageClick(photo)}>
                            <img 
                              src={photo} 
                              alt={`Foto ${index + 1}`} 
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                console.log(`Error cargando imagen ${index + 1}:`, photo.substring(0, 100)); // Debug
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-gray-500">Foto ' + (index + 1) + '</div>';
                                }
                              }}
                              onLoad={(e) => {
                                console.log(`Imagen ${index + 1} cargada correctamente`); // Debug
                              }}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ZoomIn className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex-1" onClick={() => handleViewRouteOnMaps(safeRoute)}>
                      <MapPin className="mr-2 h-4 w-4" />
                      Maps
                    </Button>
                    <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white flex-1" onClick={() => handleViewOnWikiloc(safeRoute)}>
                      Wikiloc
                    </Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white flex-1" onClick={() => handleDownloadGPX(safeRoute)}>
                      <Download className="mr-2 h-4 w-4" />
                      Track
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setEditingRoute(safeRoute)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-900 border-white/20 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                            Editar Ruta
                          </DialogTitle>
                          <DialogDescription className="text-gray-300">
                            Modifica los datos de la ruta
                          </DialogDescription>
                        </DialogHeader>
                        {editingRoute && (
                          <AddRouteForm 
                            initialData={editingRoute} 
                            onSubmit={handleEditRoute} 
                            onCancel={() => setEditingRoute(null)} 
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDeleteRoute(safeRoute.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>

        {(filteredSites.length === 0 && filteredRoutes.length === 0) && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400 mb-4">No se encontraron sitios ni rutas</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Sitio
              </Button>
              <Button onClick={() => setIsAddRouteDialogOpen(true)} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Ruta
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/90 border-white/20">
          <div className="relative w-full h-full flex items-center justify-center">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Imagen ampliada"
                className="max-w-full max-h-full object-contain"
              />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-white bg-black/50 hover:bg-black/70 z-10"
            >
              ✕
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Protection Dialog for Delete */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Contraseña requerida</DialogTitle>
            <DialogDescription className="text-gray-300">
              Esta acción está protegida por contraseña. Por favor, introduce la contraseña para eliminar el registro.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="password" className="text-white">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400"
                placeholder="Introduce la contraseña"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    executeDeleteAction();
                  }
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPasswordDialogOpen(false);
                  setPendingDeleteAction(null);
                  setPasswordInput("");
                }}
                className="border-gray-600 text-white hover:bg-gray-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={executeDeleteAction}
                disabled={!passwordInput || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  
    </div>
  );
}

interface AddRouteFormProps {
  initialData?: Route;
  onSubmit: (routeData: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

function AddRouteForm({ initialData, onSubmit, onCancel, isSubmitting = false }: AddRouteFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    province: initialData?.province || "",
    distance: initialData?.distance || "",
    elevation: initialData?.elevation || "",
    routeType: initialData?.routeType || "",
    difficulty: initialData?.difficulty || "",
    comments: initialData?.comments || "",
    photos: initialData?.photos || [],
    mapsLink: initialData?.mapsLink || "",
    wikilocLink: initialData?.wikilocLink || "",
    gpxLink: initialData?.gpxLink || ""
  });

  const handleTrackUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.gpx')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // Guardar el contenido del archivo GPX como base64
        setFormData(prev => ({
          ...prev,
          gpxLink: result
        }));
        toast.success('Track GPX cargado correctamente');
      };
      reader.readAsDataURL(file);
    } else {
      toast.error('Por favor, selecciona un archivo GPX válido');
    }
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          console.log("Foto cargada:", result.substring(0, 50) + "..."); // Debug
          setFormData(prev => ({
            ...prev,
            photos: [...prev.photos.slice(0, 2), result] // Máximo 3 fotos
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando formulario de ruta:", {
      ...formData,
      photos: formData.photos.map(p => p.substring(0, 50) + "...")
    }); // Debug
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-white">Nombre de la ruta</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          placeholder="Nombre de la ruta"
          required
        />
      </div>

      <div>
        <Label htmlFor="province" className="text-white">Provincia</Label>
        <Select value={formData.province} onValueChange={(value) => setFormData({...formData, province: value})}>
          <SelectTrigger className="bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="Selecciona provincia" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-white/20">
            {provinces.map((province) => (
              <SelectItem key={province} value={province} className="text-white hover:bg-white/10">
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="distance" className="text-white">Distancia (km)</Label>
          <Input
            id="distance"
            value={formData.distance}
            onChange={(e) => setFormData({...formData, distance: e.target.value})}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            placeholder="Ej: 10 km"
          />
        </div>

        <div>
          <Label htmlFor="elevation" className="text-white">Desnivel + (mts)</Label>
          <Input
            id="elevation"
            value={formData.elevation}
            onChange={(e) => setFormData({...formData, elevation: e.target.value})}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            placeholder="Ej: 500"
          />
        </div>

        <div>
          <Label htmlFor="routeType" className="text-white">Tipo de ruta</Label>
          <Select value={formData.routeType} onValueChange={(value) => setFormData({...formData, routeType: value})}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              {routeTypes.map((type) => (
                <SelectItem key={type} value={type} className="text-white hover:bg-white/10">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="difficulty" className="text-white">Dificultad</Label>
          <Select value={formData.difficulty} onValueChange={(value) => setFormData({...formData, difficulty: value})}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Dificultad" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              {difficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty} className="text-white hover:bg-white/10">
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="mapsLink" className="text-white">Enlace a Google Maps (opcional)</Label>
          <Input
            id="mapsLink"
            value={formData.mapsLink}
            onChange={(e) => setFormData({...formData, mapsLink: e.target.value})}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            placeholder="https://maps.google.com/..."
          />
        </div>

        <div>
          <Label htmlFor="wikilocLink" className="text-white">Enlace a Wikiloc (opcional)</Label>
          <Input
            id="wikilocLink"
            value={formData.wikilocLink}
            onChange={(e) => setFormData({...formData, wikilocLink: e.target.value})}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            placeholder="https://www.wikiloc.com/..."
          />
        </div>

        <div>
          <Label htmlFor="track" className="text-white">Track GPX (opcional)</Label>
          <div className="space-y-2">
            <input
              id="track-upload"
              type="file"
              accept=".gpx"
              onChange={handleTrackUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => document.getElementById('track-upload')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              {formData.gpxLink ? 'Cambiar Track' : 'Subir Track GPX'}
            </Button>
            {formData.gpxLink && (
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg p-2">
                <span className="text-sm text-green-300 truncate">
                  {formData.gpxLink.includes('data:') ? 'Track cargado' : formData.gpxLink.split('/').pop()}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-6 w-6 rounded-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={() => setFormData(prev => ({...prev, gpxLink: ''}))}
                >
                  ×
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="comments" className="text-white">Comentarios</Label>
        <Textarea
          id="comments"
          value={formData.comments}
          onChange={(e) => setFormData({...formData, comments: e.target.value})}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          placeholder="Añade tus comentarios sobre esta ruta..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="photos" className="text-white">Fotos</Label>
        <div className="space-y-3">
          {/* Botón para subir fotos */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => document.getElementById('route-file-upload')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Subir Fotos
            </Button>
            <input
              id="route-file-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="text-sm text-gray-400">
              {formData.photos.length}/3 fotos
            </span>
          </div>

          {/* Vista previa de fotos */}
          {formData.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border border-white/20"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 border-red-500 text-white hover:bg-red-600"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      photos: prev.photos.filter((_, i) => i !== index)
                    }))}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </div>
          ) : (
            initialData ? "Actualizar Ruta" : "Guardar Ruta"
          )}
        </Button>
      </div>
    </form>
  );
}

interface AddSiteFormProps {
  initialData?: Site;
  onSubmit: (siteData: Omit<Site, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function AddSiteForm({ initialData, onSubmit, onCancel }: AddSiteFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    city: initialData?.city || "",
    province: initialData?.province || "",
    priceRange: initialData?.priceRange || "",
    comments: initialData?.comments || "",
    type: initialData?.type || "comer" as "comer" | "dormir",
    photos: initialData?.photos || [],
    mapsLink: initialData?.mapsLink || ""
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          console.log("Foto cargada:", result.substring(0, 50) + "..."); // Debug
          setFormData(prev => ({
            ...prev,
            photos: [...prev.photos.slice(0, 2), result] // Máximo 3 fotos
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enviando formulario:", {
      ...formData,
      photos: formData.photos.map(p => p.substring(0, 50) + "...")
    }); // Debug
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-white">Nombre del sitio</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          placeholder="Nombre del restaurante, hotel, etc."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city" className="text-white">Ciudad</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({...formData, city: e.target.value})}
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            placeholder="Ciudad"
            required
          />
        </div>

        <div>
          <Label htmlFor="province" className="text-white">Provincia</Label>
          <Select value={formData.province} onValueChange={(value) => setFormData({...formData, province: value})}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Selecciona provincia" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              {provinces.map((province) => (
                <SelectItem key={province} value={province} className="text-white hover:bg-white/10">
                  {province}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priceRange" className="text-white">Rango de precios</Label>
          <Select value={formData.priceRange} onValueChange={(value) => setFormData({...formData, priceRange: value})}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Selecciona precio" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              {priceRanges.map((price) => (
                <SelectItem key={price} value={price} className="text-white hover:bg-white/10">
                  {price}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="type" className="text-white">Tipo de sitio</Label>
          <Select value={formData.type} onValueChange={(value: "comer" | "dormir") => setFormData({...formData, type: value})}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-white/20">
              <SelectItem value="comer" className="text-white hover:bg-white/10">Para comer</SelectItem>
              <SelectItem value="dormir" className="text-white hover:bg-white/10">Para dormir</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="mapsLink" className="text-white">Enlace a Google Maps (opcional)</Label>
        <Input
          id="mapsLink"
          value={formData.mapsLink}
          onChange={(e) => setFormData({...formData, mapsLink: e.target.value})}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          placeholder="https://maps.google.com/..."
        />
      </div>

      <div>
        <Label htmlFor="comments" className="text-white">Comentarios</Label>
        <Textarea
          id="comments"
          value={formData.comments}
          onChange={(e) => setFormData({...formData, comments: e.target.value})}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          placeholder="Añade tus comentarios sobre este lugar..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="photos" className="text-white">Fotos</Label>
        <div className="space-y-3">
          {/* Botón para subir fotos */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Subir Fotos
            </Button>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <span className="text-sm text-gray-400">
              {formData.photos.length}/3 fotos
            </span>
          </div>

          {/* Vista previa de fotos */}
          {formData.photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border border-white/20"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 border-red-500 text-white hover:bg-red-600"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      photos: prev.photos.filter((_, i) => i !== index)
                    }))}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
          {initialData ? "Actualizar Sitio" : "Guardar Sitio"}
        </Button>
      </div>
    </form>
  );
}