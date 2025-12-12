"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Plus, Filter, User, Heart, Scissors } from "lucide-react"

export default function AppointmentsPage() {
  const { appointments, clients, pets, services, selectedBranch, selectedDate } = useAppStore()
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false)
  const [filterService, setFilterService] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [newAppointment, setNewAppointment] = useState({
    clientId: "",
    petId: "",
    serviceId: "",
    date: selectedDate,
    time: "",
  })

  // Filter appointments by branch, date, service, and status
  const filteredAppointments = appointments
    .filter((apt) => apt.branchId === selectedBranch)
    .filter((apt) => apt.date === selectedDate)
    .filter((apt) => filterService === "all" || apt.serviceId === filterService)
    .filter((apt) => filterStatus === "all" || apt.status === filterStatus)
    .sort((a, b) => a.time.localeCompare(b.time))

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "Cliente desconocido"
  }

  const getPetName = (petId: string) => {
    return pets.find((p) => p.id === petId)?.name || "Mascota desconocida"
  }

  const getServiceName = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.name || "Servicio desconocido"
  }

  const getServiceType = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.type || "unknown"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "secondary"
      case "IN_PROGRESS":
        return "default"
      case "DONE":
        return "outline"
      case "CANCELLED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "Programada"
      case "IN_PROGRESS":
        return "En Proceso"
      case "DONE":
        return "Completada"
      case "CANCELLED":
        return "Cancelada"
      default:
        return status
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "grooming":
        return <Scissors className="w-4 h-4" />
      case "consulta":
        return <User className="w-4 h-4" />
      case "vacuna":
        return <Heart className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const branchClients = clients.filter((client) => client.branchId === selectedBranch)
  const clientPets = newAppointment.clientId ? pets.filter((pet) => pet.clientId === newAppointment.clientId) : []

  const handleAddAppointment = () => {
    // In a real app, this would add to the store
    console.log("Adding appointment:", newAppointment)
    setNewAppointment({
      clientId: "",
      petId: "",
      serviceId: "",
      date: selectedDate,
      time: "",
    })
    setIsNewAppointmentOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">
            Citas para{" "}
            {new Date(selectedDate).toLocaleDateString("es-ES", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Dialog open={isNewAppointmentOpen} onOpenChange={setIsNewAppointmentOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Agendar Cita
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agendar Nueva Cita</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="client">Cliente</Label>
                <Select
                  value={newAppointment.clientId}
                  onValueChange={(value) => setNewAppointment({ ...newAppointment, clientId: value, petId: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {branchClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pet">Mascota</Label>
                <Select
                  value={newAppointment.petId}
                  onValueChange={(value) => setNewAppointment({ ...newAppointment, petId: value })}
                  disabled={!newAppointment.clientId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mascota" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientPets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species === "dog" ? "Perro" : "Gato"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="service">Servicio</Label>
                <Select
                  value={newAppointment.serviceId}
                  onValueChange={(value) => setNewAppointment({ ...newAppointment, serviceId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - ${(service.priceCents / 100).toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleAddAppointment} className="w-full">
                Agendar Cita
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtros:</span>
            </div>
            <Select value={filterService} onValueChange={setFilterService}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos los servicios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los servicios</SelectItem>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="SCHEDULED">Programadas</SelectItem>
                <SelectItem value="IN_PROGRESS">En Proceso</SelectItem>
                <SelectItem value="DONE">Completadas</SelectItem>
                <SelectItem value="CANCELLED">Canceladas</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filteredAppointments.length} citas</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Timeline */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">No hay citas programadas</h3>
                <p className="text-sm text-muted-foreground">No se encontraron citas para los filtros seleccionados</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                      {getServiceIcon(getServiceType(appointment.serviceId))}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{appointment.time}</span>
                        <Badge variant={getStatusColor(appointment.status)}>{getStatusText(appointment.status)}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold mt-1">{getServiceName(appointment.serviceId)}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{getClientName(appointment.clientId)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{getPetName(appointment.petId)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {appointment.status === "SCHEDULED" && (
                      <Button variant="outline" size="sm">
                        Iniciar
                      </Button>
                    )}
                    {appointment.status === "IN_PROGRESS" && (
                      <Button variant="default" size="sm">
                        Completar
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {filteredAppointments.filter((a) => a.status === "SCHEDULED").length}
              </div>
              <div className="text-sm text-muted-foreground">Programadas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {filteredAppointments.filter((a) => a.status === "IN_PROGRESS").length}
              </div>
              <div className="text-sm text-muted-foreground">En Proceso</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground">
                {filteredAppointments.filter((a) => a.status === "DONE").length}
              </div>
              <div className="text-sm text-muted-foreground">Completadas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {filteredAppointments.filter((a) => a.status === "CANCELLED").length}
              </div>
              <div className="text-sm text-muted-foreground">Canceladas</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
