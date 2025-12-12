"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Truck, MapPin, Clock, Navigation, Heart, CheckCircle, Circle, AlertCircle } from "lucide-react"

export default function RoutesPage() {
  const { routes, clients, pets, selectedBranch, selectedDate, updateRouteStopStatus } = useAppStore()
  const [selectedZone, setSelectedZone] = useState("all")

  // Filter routes by branch and date
  const todayRoutes = routes.filter((route) => route.branchId === selectedBranch && route.date === selectedDate)

  const filteredRoutes =
    selectedZone === "all" ? todayRoutes : todayRoutes.filter((route) => route.zone === selectedZone)

  const getClientData = (clientId: string) => {
    return clients.find((c) => c.id === clientId)
  }

  const getPetData = (petId: string) => {
    return pets.find((p) => p.id === petId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "secondary"
      case "ARRIVED":
        return "default"
      case "PICKED_UP":
        return "default"
      case "DELIVERED":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendiente"
      case "ARRIVED":
        return "Llegó"
      case "PICKED_UP":
        return "Recogido"
      case "DELIVERED":
        return "Entregado"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Circle className="w-4 h-4" />
      case "ARRIVED":
        return <AlertCircle className="w-4 h-4" />
      case "PICKED_UP":
        return <Truck className="w-4 h-4" />
      case "DELIVERED":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <Circle className="w-4 h-4" />
    }
  }

  const getRouteProgress = (route: any) => {
    const totalStops = route.stops.length
    const completedStops = route.stops.filter((stop: any) => stop.status === "DELIVERED").length
    return totalStops > 0 ? Math.round((completedStops / totalStops) * 100) : 0
  }

  const handleStatusChange = (routeId: string, stopId: string, newStatus: string) => {
    updateRouteStopStatus(routeId, stopId, newStatus as any)
  }

  const zones = ["10", "20", "30", "40", "50", "60", "70", "80", "90"]

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rutas</h1>
          <p className="text-muted-foreground">Gestión de rutas de recogida y entrega</p>
        </div>
        <Badge variant="secondary">{filteredRoutes.length} rutas activas</Badge>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Large Map - Main Feature */}
        <div className="lg:col-span-8">
          <Card className="h-[calc(100vh-280px)] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <MapPin className="w-5 h-5" />
                  <span>Mapa de Rutas - Monterrey, N.L.</span>
                </CardTitle>
                <div className="flex items-center space-x-3 text-sm">
                  <span className="text-muted-foreground">
                    {filteredRoutes.reduce((sum, route) => sum + route.stops.length, 0)} paradas
                  </span>
                  <Badge variant="secondary">{filteredRoutes.length} rutas</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-4">
              <div className="h-full w-full rounded-lg overflow-hidden border border-border bg-muted">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d230183.9708112148!2d-100.4431819!3d25.6866142!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662bfd5b3180241%3A0x4b8b6e8b8b8b8b8b!2sMonterrey%2C%20N.L.%2C%20M%C3%A9xico!5e0!3m2!1ses!2smx!4v1234567890!5m2!1ses!2smx"
                  title="Mapa de Rutas - Monterrey, Nuevo León"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Bento Cards */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Zone Selector Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <Truck className="w-4 h-4" />
                <span>Filtrar Zonas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las zonas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las zonas</SelectItem>
                  {zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>
                      Zona {zone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Route Overview Cards - Compact */}
          {filteredRoutes.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {filteredRoutes.map((route) => {
                const progress = getRouteProgress(route)
                const pendingStops = route.stops.filter((stop) => stop.status === "PENDING").length
                const completedStops = route.stops.filter((stop) => stop.status === "DELIVERED").length

                return (
                  <Card key={route.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <Truck className="w-3 h-3" />
                          <span>Zona {route.zone}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">{progress}%</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Progress value={progress} className="h-1.5" />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-muted-foreground">Pendientes</div>
                          <div className="text-base font-bold">{pendingStops}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Completadas</div>
                          <div className="text-base font-bold">{completedStops}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No hay rutas para la fecha seleccionada
                </div>
              </CardContent>
            </Card>
          )}

          {/* Driver View Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <Navigation className="w-4 h-4" />
                <span>Vista Chofer</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filteredRoutes.length > 0 && filteredRoutes[0].stops.length > 0 ? (
                <>
                  {(() => {
                    const firstRoute = filteredRoutes[0]
                    const nextStop = firstRoute.stops
                      .sort((a, b) => a.order - b.order)
                      .find((stop) => stop.status === "PENDING" || stop.status === "ARRIVED")
                    if (!nextStop) return null
                    const client = getClientData(nextStop.clientId)
                    const pet = getPetData(nextStop.petId)
                    if (!client || !pet) return null

                    return (
                      <div className="bg-primary/10 p-3 rounded-lg">
                        <div className="text-xs font-medium">Próxima Parada</div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {client.name} - {pet.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{nextStop.address}</div>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{nextStop.timeWindow}</span>
                        </div>
                      </div>
                    )
                  })()}
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      <Navigation className="w-3 h-3 mr-1" />
                      Navegar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      Llamar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-xs">
                  No hay rutas activas
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <Truck className="w-4 h-4" />
                <span>Estadísticas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Total paradas:</span>
                <span className="font-medium">
                  {filteredRoutes.reduce((sum, route) => sum + route.stops.length, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Pendientes:</span>
                <span className="font-medium">
                  {filteredRoutes.reduce(
                    (sum, route) => sum + route.stops.filter((s) => s.status === "PENDING").length,
                    0,
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Completadas:</span>
                <span className="font-medium">
                  {filteredRoutes.reduce(
                    (sum, route) => sum + route.stops.filter((s) => s.status === "DELIVERED").length,
                    0,
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t text-xs">
                <span className="font-medium">Progreso:</span>
                <span className="font-bold">
                  {filteredRoutes.length > 0
                    ? Math.round(
                        (filteredRoutes.reduce(
                          (sum, route) => sum + route.stops.filter((s) => s.status === "DELIVERED").length,
                          0,
                        ) /
                          filteredRoutes.reduce((sum, route) => sum + route.stops.length, 0)) *
                            100,
                        )
                      : 0}
                  %
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Route Details - Full Width Below Everything */}
      {filteredRoutes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="w-5 h-5" />
              <span>Detalles de Paradas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRoutes.map((route) => (
                <div key={route.id} className="space-y-3">
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Ruta Zona {route.zone}</span>
                    <Badge variant="outline" className="ml-auto">{route.stops.length} paradas</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {route.stops
                      .sort((a, b) => a.order - b.order)
                      .map((stop) => {
                        const client = getClientData(stop.clientId)
                        const pet = getPetData(stop.petId)
                        if (!client || !pet) return null

                        return (
                          <Card key={stop.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full">
                                      <span className="text-xs font-medium">{stop.order}</span>
                                    </div>
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage src={pet.photo || "/placeholder.svg"} alt={pet.name} />
                                      <AvatarFallback>
                                        <Heart className="w-4 h-4" />
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <Badge variant={getStatusColor(stop.status)} className="flex items-center space-x-1 text-xs">
                                    {getStatusIcon(stop.status)}
                                    <span>{getStatusText(stop.status)}</span>
                                  </Badge>
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{client.name}</div>
                                  <div className="text-xs text-muted-foreground">{pet.name}</div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                    <MapPin className="w-3 h-3" />
                                    <span className="line-clamp-2">{stop.address}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>{stop.timeWindow}</span>
                                  </div>
                                </div>
                                <div className="pt-2">
                                  {stop.status === "PENDING" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full text-xs"
                                      onClick={() => handleStatusChange(route.id, stop.id, "ARRIVED")}
                                    >
                                      Marcar Llegada
                                    </Button>
                                  )}
                                  {stop.status === "ARRIVED" && (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="w-full text-xs"
                                      onClick={() => handleStatusChange(route.id, stop.id, "PICKED_UP")}
                                    >
                                      Marcar Recogido
                                    </Button>
                                  )}
                                  {stop.status === "PICKED_UP" && (
                                    <Button
                                      size="sm"
                                      variant="default"
                                      className="w-full text-xs"
                                      onClick={() => handleStatusChange(route.id, stop.id, "DELIVERED")}
                                    >
                                      Marcar Entregado
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
