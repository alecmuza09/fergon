"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Heart, AlertTriangle, QrCode, FileText, Calendar, Grid3x3, List, LayoutGrid, History } from "lucide-react"

export default function PetsPage() {
  const { pets, clients, appointments, services, selectedBranch, addPet, updatePet } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewPetOpen, setIsNewPetOpen] = useState(false)
  const [selectedPet, setSelectedPet] = useState<string | null>(null)
  const [editingPet, setEditingPet] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid")
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [newPet, setNewPet] = useState({
    name: "",
    species: "dog" as "dog" | "cat",
    breed: "",
    age: 0,
    weight: 0,
    allergies: [] as string[],
    photo: "",
    clientId: "",
    vaccinations: [],
  })

  // Filter pets by branch (through client) and search term
  const branchClients = clients.filter((client) => client.branchId === selectedBranch)
  const filteredPets = pets
    .filter((pet) => branchClients.some((client) => client.id === pet.clientId))
    .filter((pet) => pet.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleAddPet = () => {
    addPet(newPet)
    setNewPet({
      name: "",
      species: "dog",
      breed: "",
      age: 0,
      weight: 0,
      allergies: [],
      photo: "",
      clientId: "",
      vaccinations: [],
    })
    setIsNewPetOpen(false)
  }

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "Cliente desconocido"
  }

  const getPetAge = (age: number) => {
    return age === 1 ? "1 año" : `${age} años`
  }

  // Obtener última visita de una mascota
  const getLastVisit = (petId: string) => {
    const petAppointments = appointments
      .filter((apt) => apt.petId === petId && (apt.status === "DONE" || apt.status === "IN_PROGRESS"))
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateB.getTime() - dateA.getTime()
      })
    
    return petAppointments.length > 0 ? petAppointments[0] : null
  }

  // Obtener historial de visitas de una mascota
  const getVisitHistory = (petId: string) => {
    return appointments
      .filter((apt) => apt.petId === petId && (apt.status === "DONE" || apt.status === "IN_PROGRESS"))
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateB.getTime() - dateA.getTime()
      })
      .slice(0, 10) // Últimas 10 visitas
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateTime = (dateString: string, timeString: string) => {
    const date = new Date(`${dateString}T${timeString}`)
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getServiceName = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.name || "Servicio desconocido"
  }

  const getServiceType = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.type || "unknown"
  }

  const selectedPetData = selectedPet ? pets.find((p) => p.id === selectedPet) : null
  const selectedPetHistory = selectedPet ? getVisitHistory(selectedPet) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mascotas</h1>
          <p className="text-muted-foreground">Gestión de mascotas y fichas médicas</p>
        </div>
        <Dialog open={isNewPetOpen} onOpenChange={setIsNewPetOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Mascota
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Mascota</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="petName">Nombre</Label>
                <Input
                  id="petName"
                  value={newPet.name}
                  onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                  placeholder="Max"
                />
              </div>
              <div>
                <Label htmlFor="client">Dueño</Label>
                <Select value={newPet.clientId} onValueChange={(value) => setNewPet({ ...newPet, clientId: value })}>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="species">Especie</Label>
                  <Select
                    value={newPet.species}
                    onValueChange={(value: "dog" | "cat") => setNewPet({ ...newPet, species: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Perro</SelectItem>
                      <SelectItem value="cat">Gato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="breed">Raza</Label>
                  <Input
                    id="breed"
                    value={newPet.breed}
                    onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                    placeholder="Golden Retriever"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Edad (años)</Label>
                  <Input
                    id="age"
                    type="number"
                    value={newPet.age}
                    onChange={(e) => setNewPet({ ...newPet, age: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={newPet.weight}
                    onChange={(e) => setNewPet({ ...newPet, weight: Number.parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <Button onClick={handleAddPet} className="w-full">
                Crear Mascota
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and View Mode */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar mascotas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{filteredPets.length} mascotas</Badge>
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "compact" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("compact")}
                  className="h-8 w-8 p-0"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pets Display - Different Views */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.map((pet) => {
            const lastVisit = getLastVisit(pet.id)
            return (
              <Card key={pet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={pet.photo || "/placeholder.svg"} alt={pet.name} />
                      <AvatarFallback>
                        <Heart className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{pet.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{getClientName(pet.clientId)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={pet.species === "dog" ? "default" : "secondary"}>
                      {pet.species === "dog" ? "Perro" : "Gato"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{pet.breed}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Edad:</span> {getPetAge(pet.age)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Peso:</span> {pet.weight}kg
                    </div>
                  </div>
                  {lastVisit && (
                    <div className="flex items-center space-x-2 text-sm pt-1 border-t">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Última visita:</span>
                      <span className="font-medium">{formatDate(lastVisit.date)}</span>
                    </div>
                  )}
                  {pet.allergies.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      <div className="flex flex-wrap gap-1">
                        {pet.allergies.map((allergy, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedPet(pet.id)
                        setIsHistoryOpen(true)
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Ficha
                    </Button>
                    <Button variant="ghost" size="sm">
                      <QrCode className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mascota</TableHead>
                  <TableHead>Dueño</TableHead>
                  <TableHead>Especie</TableHead>
                  <TableHead>Raza</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Última Visita</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPets.map((pet) => {
                  const lastVisit = getLastVisit(pet.id)
                  return (
                    <TableRow key={pet.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={pet.photo || "/placeholder.svg"} alt={pet.name} />
                            <AvatarFallback>
                              <Heart className="w-5 h-5" />
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{pet.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getClientName(pet.clientId)}</TableCell>
                      <TableCell>
                        <Badge variant={pet.species === "dog" ? "default" : "secondary"}>
                          {pet.species === "dog" ? "Perro" : "Gato"}
                        </Badge>
                      </TableCell>
                      <TableCell>{pet.breed}</TableCell>
                      <TableCell>{getPetAge(pet.age)}</TableCell>
                      <TableCell>{pet.weight}kg</TableCell>
                      <TableCell>
                        {lastVisit ? (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span>{formatDate(lastVisit.date)}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Sin visitas</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPet(pet.id)
                              setIsHistoryOpen(true)
                            }}
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Ficha
                          </Button>
                          <Button variant="ghost" size="sm">
                            <QrCode className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {viewMode === "compact" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredPets.map((pet) => {
            const lastVisit = getLastVisit(pet.id)
            return (
              <Card key={pet.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                setSelectedPet(pet.id)
                setIsHistoryOpen(true)
              }}>
                <CardContent className="pt-6 pb-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={pet.photo || "/placeholder.svg"} alt={pet.name} />
                      <AvatarFallback>
                        <Heart className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-full">
                      <CardTitle className="text-base">{pet.name}</CardTitle>
                      <p className="text-xs text-muted-foreground truncate">{getClientName(pet.clientId)}</p>
                    </div>
                    <Badge variant={pet.species === "dog" ? "default" : "secondary"} className="text-xs">
                      {pet.species === "dog" ? "Perro" : "Gato"}
                    </Badge>
                    {lastVisit && (
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(lastVisit.date)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Pet Details Dialog with History */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedPetData && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedPetData.photo || "/placeholder.svg"} alt={selectedPetData.name} />
                    <AvatarFallback>
                      <Heart className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{selectedPetData.name}</div>
                    <p className="text-sm font-normal text-muted-foreground">{getClientName(selectedPetData.clientId)}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="info">Información</TabsTrigger>
                  <TabsTrigger value="history">
                    <History className="w-4 h-4 mr-2" />
                    Historial de Visitias
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{selectedPetData.age}</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedPetData.age === 1 ? "Año" : "Años"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold">{selectedPetData.weight}</div>
                          <div className="text-sm text-muted-foreground">Kg</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center">
                          <Badge variant={selectedPetData.species === "dog" ? "default" : "secondary"}>
                            {selectedPetData.species === "dog" ? "Perro" : "Gato"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="text-center text-sm">
                          <div className="font-medium">Raza</div>
                          <div className="text-muted-foreground mt-1">{selectedPetData.breed}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {selectedPetData.allergies.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          <span>Alergias</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedPetData.allergies.map((allergy, index) => (
                            <Badge key={index} variant="destructive">
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <FileText className="w-4 h-4 mr-2" />
                      Ver Carnét (PDF)
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <QrCode className="w-4 h-4 mr-2" />
                      Generar QR
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                  {selectedPetHistory.length > 0 ? (
                    <Card>
                      <CardHeader>
                        <CardTitle>Últimas Visitias</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedPetHistory.map((visit) => (
                            <div key={visit.id} className="flex items-start justify-between p-4 border rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <Calendar className="w-5 h-5 text-muted-foreground" />
                                  <div>
                                    <div className="font-medium">{getServiceName(visit.serviceId)}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {formatDateTime(visit.date, visit.time)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={visit.status === "DONE" ? "default" : "secondary"}>
                                  {visit.status === "DONE" ? "Completada" : "En Proceso"}
                                </Badge>
                                <Badge variant="outline">{getServiceType(visit.serviceId)}</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center py-8">
                          <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No hay visitas registradas</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
