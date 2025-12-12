"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Heart, CreditCard, Clock, MapPin, AlertTriangle, Phone } from "lucide-react"

export default function ClientPortalPage() {
  const { clients, pets, appointments, vaccinations, routes } = useAppStore()

  // Mock client data - in a real app this would be based on authentication
  const mockClient = clients[0]
  const clientPets = pets.filter((pet) => pet.clientId === mockClient.id)
  const clientAppointments = appointments.filter((apt) => apt.clientId === mockClient.id)
  const upcomingAppointments = clientAppointments.filter((apt) => new Date(apt.date) >= new Date())

  // Get pet vaccinations
  const getPetVaccinations = (petId: string) => {
    return vaccinations.filter((v) => v.petId === petId && v.status !== "DONE")
  }

  // Mock route tracking
  const todayRoute = routes.find((route) => route.stops.some((stop) => stop.clientId === mockClient.id))

  const clientStop = todayRoute?.stops.find((stop) => stop.clientId === mockClient.id)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-8 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
        <h1 className="text-3xl font-bold text-foreground">Portal del Cliente</h1>
        <p className="text-muted-foreground mt-2">Bienvenido, {mockClient.name}</p>
        <Badge variant="secondary" className="mt-4">
          Vista Demo
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <Calendar className="w-6 h-6" />
              <span>Reagendar Cita</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reagendar Cita</DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Funcionalidad de reagendamiento</p>
              <p className="text-sm text-muted-foreground">Demo - No funcional</p>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
              <CreditCard className="w-6 h-6" />
              <span>Pagar Servicios</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pago en Línea</DialogTitle>
            </DialogHeader>
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Pasarela de pagos</p>
              <p className="text-sm text-muted-foreground">Demo - No funcional</p>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="h-20 flex flex-col space-y-2 bg-transparent">
          <Phone className="w-6 h-6" />
          <span>Contactar</span>
        </Button>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Próximas Citas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tienes citas programadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => {
                const pet = pets.find((p) => p.id === appointment.petId)
                if (!pet) return null

                return (
                  <Card key={appointment.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={pet.photo || "/placeholder.svg"} alt={pet.name} />
                          <AvatarFallback>
                            <Heart className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium">{pet.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(appointment.date).toLocaleDateString("es-ES")} a las {appointment.time}
                          </div>
                          <Badge variant="secondary" className="mt-1">
                            {appointment.serviceId === "s1"
                              ? "Baño Completo"
                              : appointment.serviceId === "s2"
                                ? "Corte y Peinado"
                                : appointment.serviceId === "s3"
                                  ? "Consulta General"
                                  : "Servicio"}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <Badge variant={appointment.status === "SCHEDULED" ? "secondary" : "default"}>
                            {appointment.status === "SCHEDULED" ? "Programada" : "En Proceso"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pet Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5" />
            <span>Mis Mascotas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientPets.map((pet) => {
              const petVaccinations = getPetVaccinations(pet.id)
              const overdueVaccinations = petVaccinations.filter((v) => v.status === "OVERDUE")

              return (
                <Card key={pet.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={pet.photo || "/placeholder.svg"} alt={pet.name} />
                        <AvatarFallback>
                          <Heart className="w-8 h-8" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg">{pet.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {pet.breed} • {pet.age} años • {pet.weight}kg
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant={pet.species === "dog" ? "default" : "secondary"}>
                            {pet.species === "dog" ? "Perro" : "Gato"}
                          </Badge>
                          {overdueVaccinations.length > 0 && (
                            <Badge variant="destructive" className="flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Vacunas vencidas</span>
                            </Badge>
                          )}
                        </div>
                        {pet.allergies.length > 0 && (
                          <div className="mt-2">
                            <div className="text-xs text-muted-foreground">Alergias:</div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {pet.allergies.map((allergy, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Vaccination Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5" />
            <span>Vacunas por Vencer</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clientPets.map((pet) => {
              const petVaccinations = getPetVaccinations(pet.id)
              if (petVaccinations.length === 0) return null

              return (
                <div key={pet.id}>
                  <div className="font-medium mb-2">{pet.name}</div>
                  {petVaccinations.map((vaccination) => (
                    <div
                      key={vaccination.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg mb-2"
                    >
                      <div>
                        <div className="font-medium">{vaccination.vaccine}</div>
                        <div className="text-sm text-muted-foreground">
                          Vence: {new Date(vaccination.dueDate).toLocaleDateString("es-ES")}
                        </div>
                      </div>
                      <Badge variant={vaccination.status === "OVERDUE" ? "destructive" : "secondary"}>
                        {vaccination.status === "OVERDUE" ? "Vencida" : "Próxima"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Route Tracking */}
      {clientStop && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Seguimiento de Ruta</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                <div>
                  <div className="font-medium">Ruta del día</div>
                  <div className="text-sm text-muted-foreground">
                    Zona {todayRoute?.zone} • Ventana: {clientStop.timeWindow}
                  </div>
                </div>
                <Badge
                  variant={
                    clientStop.status === "DELIVERED"
                      ? "outline"
                      : clientStop.status === "PICKED_UP"
                        ? "default"
                        : clientStop.status === "ARRIVED"
                          ? "secondary"
                          : "secondary"
                  }
                >
                  {clientStop.status === "DELIVERED"
                    ? "Entregado"
                    : clientStop.status === "PICKED_UP"
                      ? "Recogido"
                      : clientStop.status === "ARRIVED"
                        ? "Chofer en camino"
                        : "Programado"}
                </Badge>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-2">🚚</div>
                <p className="text-sm text-muted-foreground">
                  Estado actual:{" "}
                  {clientStop.status === "DELIVERED"
                    ? "Tu mascota ha sido entregada"
                    : clientStop.status === "PICKED_UP"
                      ? "Tu mascota está en camino de regreso"
                      : clientStop.status === "ARRIVED"
                        ? "El chofer ha llegado a tu ubicación"
                        : "El chofer está en camino"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Historial de Servicios</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments
              .filter((apt) => apt.clientId === mockClient.id && apt.status === "DONE")
              .slice(0, 5)
              .map((appointment) => {
                const pet = pets.find((p) => p.id === appointment.petId)
                if (!pet) return null

                return (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={pet.photo || "/placeholder.svg"} alt={pet.name} />
                        <AvatarFallback>
                          <Heart className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{pet.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.serviceId === "s1"
                            ? "Baño Completo"
                            : appointment.serviceId === "s2"
                              ? "Corte y Peinado"
                              : appointment.serviceId === "s3"
                                ? "Consulta General"
                                : "Servicio"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{new Date(appointment.date).toLocaleDateString("es-ES")}</div>
                      <Badge variant="outline">Completado</Badge>
                    </div>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
