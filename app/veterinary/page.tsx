"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Stethoscope, Calendar, FileText, AlertTriangle, Heart, Clock, Pill, Syringe, Scissors, CheckCircle2, XCircle } from "lucide-react"

export default function VeterinaryPage() {
  const { appointments, pets, clients, vaccinations, groomingWorkflows, selectedBranch, selectedDate, updateGroomingConsultation } = useAppStore()
  const [selectedPet, setSelectedPet] = useState<string | null>(null)

  // Filter veterinary appointments for today
  const todayConsultations = appointments
    .filter((apt) => apt.branchId === selectedBranch && apt.date === selectedDate)
    .filter((apt) => {
      const service = apt.serviceId
      return service === "s3" || service === "s4" // consulta or vacuna
    })

  const getPetData = (petId: string) => {
    return pets.find((p) => p.id === petId)
  }

  const getClientData = (petId: string) => {
    const pet = pets.find((p) => p.id === petId)
    if (!pet) return null
    return clients.find((c) => c.id === pet.clientId)
  }

  const getPetVaccinations = (petId: string) => {
    return vaccinations.filter((v) => v.petId === petId)
  }

  const getVaccinationStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return { variant: "secondary" as const, text: "Pendiente" }
      case "DONE":
        return { variant: "outline" as const, text: "Completada" }
      case "OVERDUE":
        return { variant: "destructive" as const, text: "Vencida" }
      default:
        return { variant: "secondary" as const, text: status }
    }
  }

  const selectedPetData = selectedPet ? getPetData(selectedPet) : null
  const selectedClientData = selectedPet ? getClientData(selectedPet) : null
  const selectedPetVaccinations = selectedPet ? getPetVaccinations(selectedPet) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Veterinaria</h1>
          <p className="text-muted-foreground">Consultas médicas y esquemas de vacunación</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">{todayConsultations.length} consultas hoy</Badge>
        </div>
      </div>

      <Tabs defaultValue="grooming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="grooming">
            <Scissors className="w-4 h-4 mr-2" />
            Mascotas en Estética
          </TabsTrigger>
          <TabsTrigger value="consultations">Consultas del Día</TabsTrigger>
          <TabsTrigger value="vaccinations">Esquemas de Vacunación</TabsTrigger>
          <TabsTrigger value="history">Historia Clínica</TabsTrigger>
        </TabsList>

        <TabsContent value="grooming" className="space-y-6">
          {/* Pets in Grooming */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Scissors className="w-5 h-5" />
                <span>Mascotas en Proceso de Estética</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {groomingWorkflows.length === 0 ? (
                <div className="text-center py-8">
                  <Scissors className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">No hay mascotas en estética</h3>
                  <p className="text-sm text-muted-foreground">No se encontraron mascotas en proceso de grooming</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mascota</TableHead>
                      <TableHead>Dueño</TableHead>
                      <TableHead>Etapa</TableHead>
                      <TableHead>Consulta Solicitada</TableHead>
                      <TableHead>Autorizada</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groomingWorkflows.map((workflow) => {
                      const pet = getPetData(workflow.petId)
                      const client = getClientData(workflow.petId)
                      if (!pet || !client) return null

                      const getStageName = (stage: string) => {
                        switch (stage) {
                          case "reception":
                            return "En Sucursal"
                          case "pre-check":
                            return "Pre-chequeo"
                          case "bath":
                            return "Baño"
                          case "cut":
                            return "Corte"
                          case "delivery":
                            return "Listo para Entregar"
                          default:
                            return stage
                        }
                      }

                      const getStageBadge = (stage: string) => {
                        switch (stage) {
                          case "reception":
                            return "secondary"
                          case "pre-check":
                            return "default"
                          case "bath":
                            return "default"
                          case "cut":
                            return "default"
                          case "delivery":
                            return "outline"
                          default:
                            return "secondary"
                        }
                      }

                      return (
                        <TableRow key={workflow.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={pet.photo || "/placeholder.svg"} alt={pet.name} />
                                <AvatarFallback>
                                  <Heart className="w-5 h-5" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{pet.name}</div>
                                <div className="text-sm text-muted-foreground">{pet.breed}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{client.name}</TableCell>
                          <TableCell>
                            <Badge variant={getStageBadge(workflow.stage) as any}>
                              {getStageName(workflow.stage)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                checked={workflow.consultationRequested || false}
                                onCheckedChange={(checked) =>
                                  updateGroomingConsultation(workflow.id, checked as boolean, undefined)
                                }
                              />
                              <span className="text-sm">
                                {workflow.consultationRequested ? (
                                  <span className="flex items-center text-green-600">
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Sí
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">No</span>
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {workflow.consultationRequested ? (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={workflow.consultationAuthorized || false}
                                  onCheckedChange={(checked) =>
                                    updateGroomingConsultation(workflow.id, undefined, checked as boolean)
                                  }
                                />
                                <span className="text-sm">
                                  {workflow.consultationAuthorized ? (
                                    <span className="flex items-center text-green-600">
                                      <CheckCircle2 className="w-4 h-4 mr-1" />
                                      Autorizada
                                    </span>
                                  ) : (
                                    <span className="flex items-center text-orange-600">
                                      <XCircle className="w-4 h-4 mr-1" />
                                      Pendiente
                                    </span>
                                  )}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => setSelectedPet(pet.id)}>
                              Ver Historia
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-6">
          {/* Today's Consultations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5" />
                <span>Consultas Programadas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayConsultations.length === 0 ? (
                <div className="text-center py-8">
                  <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">No hay consultas programadas</h3>
                  <p className="text-sm text-muted-foreground">No se encontraron consultas para hoy</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayConsultations.map((appointment) => {
                    const pet = getPetData(appointment.petId)
                    const client = getClientData(appointment.petId)
                    if (!pet || !client) return null

                    return (
                      <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={pet.photo || "/placeholder.svg"} alt={pet.name} />
                                <AvatarFallback>
                                  <Heart className="w-6 h-6" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">{appointment.time}</span>
                                  <Badge variant={appointment.status === "DONE" ? "outline" : "default"}>
                                    {appointment.status === "DONE" ? "Completada" : "Programada"}
                                  </Badge>
                                </div>
                                <h3 className="text-lg font-semibold mt-1">{pet.name}</h3>
                                <div className="text-sm text-muted-foreground">
                                  {client.name} • {pet.breed} • {pet.age} años
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" onClick={() => setSelectedPet(pet.id)}>
                                Ver Historia
                              </Button>
                              <Button variant="default" size="sm">
                                Iniciar Consulta
                              </Button>
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
        </TabsContent>

        <TabsContent value="vaccinations" className="space-y-6">
          {/* Vaccination Schedules */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <span>Vacunas Vencidas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vaccinations
                    .filter((v) => v.status === "OVERDUE")
                    .map((vaccination) => {
                      const pet = getPetData(vaccination.petId)
                      const client = getClientData(vaccination.petId)
                      if (!pet || !client) return null

                      return (
                        <div
                          key={vaccination.id}
                          className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{pet.name}</div>
                            <div className="text-sm text-muted-foreground">{vaccination.vaccine}</div>
                            <div className="text-xs text-destructive">
                              Vencida: {new Date(vaccination.dueDate).toLocaleDateString("es-ES")}
                            </div>
                          </div>
                          <Button size="sm" variant="destructive">
                            Programar
                          </Button>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-secondary" />
                  <span>Próximas Vacunas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vaccinations
                    .filter((v) => v.status === "PENDING")
                    .map((vaccination) => {
                      const pet = getPetData(vaccination.petId)
                      const client = getClientData(vaccination.petId)
                      if (!pet || !client) return null

                      return (
                        <div
                          key={vaccination.id}
                          className="flex items-center justify-between p-3 bg-secondary/10 rounded-lg"
                        >
                          <div>
                            <div className="font-medium">{pet.name}</div>
                            <div className="text-sm text-muted-foreground">{vaccination.vaccine}</div>
                            <div className="text-xs text-secondary">
                              Programada: {new Date(vaccination.dueDate).toLocaleDateString("es-ES")}
                            </div>
                          </div>
                          <Button size="sm" variant="secondary">
                            Recordar
                          </Button>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vaccination Table */}
          <Card>
            <CardHeader>
              <CardTitle>Esquema de Vacunación</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mascota</TableHead>
                    <TableHead>Dueño</TableHead>
                    <TableHead>Vacuna</TableHead>
                    <TableHead>Última Dosis</TableHead>
                    <TableHead>Próxima Dosis</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vaccinations.map((vaccination) => {
                    const pet = getPetData(vaccination.petId)
                    const client = getClientData(vaccination.petId)
                    if (!pet || !client) return null

                    const status = getVaccinationStatus(vaccination.status)

                    return (
                      <TableRow key={vaccination.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={pet.photo || "/placeholder.svg"} alt={pet.name} />
                              <AvatarFallback>
                                <Heart className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{pet.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{vaccination.vaccine}</TableCell>
                        <TableCell>{new Date(vaccination.date).toLocaleDateString("es-ES")}</TableCell>
                        <TableCell>{new Date(vaccination.dueDate).toLocaleDateString("es-ES")}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.text}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Syringe className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Medical History */}
          <Card>
            <CardHeader>
              <CardTitle>Historia Clínica</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedPetData ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={selectedPetData.photo || "/placeholder.svg"} alt={selectedPetData.name} />
                      <AvatarFallback>
                        <Heart className="w-8 h-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-bold">{selectedPetData.name}</h3>
                      <p className="text-muted-foreground">{selectedClientData?.name}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge>{selectedPetData.species === "dog" ? "Perro" : "Gato"}</Badge>
                        <span className="text-sm">{selectedPetData.breed}</span>
                        <span className="text-sm">{selectedPetData.age} años</span>
                        <span className="text-sm">{selectedPetData.weight}kg</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Diagnósticos Recientes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="font-medium">Revisión General</div>
                            <div className="text-sm text-muted-foreground">15/01/2024</div>
                            <div className="text-sm mt-1">Estado general bueno. Peso adecuado.</div>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="font-medium">Vacunación DHPP</div>
                            <div className="text-sm text-muted-foreground">10/12/2023</div>
                            <div className="text-sm mt-1">Vacuna aplicada sin complicaciones.</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Tratamientos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="font-medium">Desparasitación</div>
                            <div className="text-sm text-muted-foreground">Cada 3 meses</div>
                            <div className="text-sm mt-1">Última: 15/01/2024</div>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <div className="font-medium">Control de Peso</div>
                            <div className="text-sm text-muted-foreground">Mensual</div>
                            <div className="text-sm mt-1">Peso actual: {selectedPetData.weight}kg</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Vacunaciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedPetVaccinations.map((vaccination) => {
                          const status = getVaccinationStatus(vaccination.status)
                          return (
                            <div
                              key={vaccination.id}
                              className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            >
                              <div>
                                <div className="font-medium">{vaccination.vaccine}</div>
                                <div className="text-sm text-muted-foreground">
                                  Última: {new Date(vaccination.date).toLocaleDateString("es-ES")} • Próxima:{" "}
                                  {new Date(vaccination.dueDate).toLocaleDateString("es-ES")}
                                </div>
                              </div>
                              <Badge variant={status.variant}>{status.text}</Badge>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 bg-transparent">
                          <FileText className="w-4 h-4 mr-2" />
                          Generar Receta (PDF Demo)
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Receta Médica - {selectedPetData.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">PDF Preview Demo</h3>
                            <p className="text-sm text-muted-foreground">
                              Aquí se mostraría la vista previa de la receta médica
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" className="flex-1 bg-transparent">
                              Descargar PDF
                            </Button>
                            <Button variant="outline" className="flex-1 bg-transparent">
                              Enviar por Email
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Pill className="w-4 h-4 mr-2" />
                      Nueva Prescripción
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Stethoscope className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">Selecciona una mascota</h3>
                  <p className="text-sm text-muted-foreground">
                    Haz clic en "Ver Historia" desde las consultas para ver la historia clínica
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
