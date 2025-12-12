"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Search, Heart, AlertTriangle, QrCode, FileText, Calendar } from "lucide-react"

export default function PetsPage() {
  const { pets, clients, selectedBranch, addPet, updatePet } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewPetOpen, setIsNewPetOpen] = useState(false)
  const [selectedPet, setSelectedPet] = useState<string | null>(null)
  const [editingPet, setEditingPet] = useState<string | null>(null)
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

  const selectedPetData = selectedPet ? pets.find((p) => p.id === selectedPet) : null

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

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar mascotas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">{filteredPets.length} mascotas</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Pets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPets.map((pet) => (
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
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => setSelectedPet(pet.id)}
                    >
                      Ver Ficha
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Ficha de {selectedPetData?.name}</DrawerTitle>
                    </DrawerHeader>
                    <div className="p-6 space-y-6">
                      {selectedPetData && (
                        <>
                          <div className="flex items-center space-x-4">
                            <Avatar className="w-20 h-20">
                              <AvatarImage
                                src={selectedPetData.photo || "/placeholder.svg"}
                                alt={selectedPetData.name}
                              />
                              <AvatarFallback>
                                <Heart className="w-10 h-10" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-2xl font-bold">{selectedPetData.name}</h3>
                              <p className="text-muted-foreground">{getClientName(selectedPetData.clientId)}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant={selectedPetData.species === "dog" ? "default" : "secondary"}>
                                  {selectedPetData.species === "dog" ? "Perro" : "Gato"}
                                </Badge>
                                <span className="text-sm">{selectedPetData.breed}</span>
                              </div>
                            </div>
                          </div>

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
                                  <QrCode className="w-8 h-8 mx-auto mb-2" />
                                  <div className="text-sm text-muted-foreground">QR Demo</div>
                                </div>
                              </CardContent>
                            </Card>
                            <Card>
                              <CardContent className="pt-4">
                                <div className="text-center">
                                  <FileText className="w-8 h-8 mx-auto mb-2" />
                                  <div className="text-sm text-muted-foreground">Carnét PDF</div>
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

                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center space-x-2">
                                <Calendar className="w-5 h-5" />
                                <span>Próximas Vacunas</span>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 bg-muted rounded">
                                  <span>Múltiple DHPP</span>
                                  <Badge variant="secondary">30 días</Badge>
                                </div>
                                <div className="flex items-center justify-between p-2 bg-muted rounded">
                                  <span>Rabia</span>
                                  <Badge variant="destructive">Vencida</Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <div className="flex space-x-2">
                            <Button variant="outline" className="flex-1 bg-transparent">
                              <FileText className="w-4 h-4 mr-2" />
                              Ver Carnét (PDF Demo)
                            </Button>
                            <Button variant="outline" className="flex-1 bg-transparent">
                              <QrCode className="w-4 h-4 mr-2" />
                              Generar QR
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </DrawerContent>
                </Drawer>
                <Button variant="ghost" size="sm">
                  <QrCode className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
