"use client"

import type React from "react"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Clock, Camera, ArrowRight, Heart, Upload } from "lucide-react"

const stages = [
  { id: "reception", name: "Recepción", color: "bg-slate-100" },
  { id: "pre-check", name: "Pre-chequeo", color: "bg-blue-100" },
  { id: "bath", name: "Baño", color: "bg-cyan-100" },
  { id: "dry", name: "Secado", color: "bg-yellow-100" },
  { id: "cut", name: "Corte/Estilo", color: "bg-orange-100" },
  { id: "review", name: "Revisión Final", color: "bg-green-100" },
  { id: "delivery", name: "Entrega", color: "bg-purple-100" },
]

export default function GroomingPage() {
  const { groomingWorkflows, pets, clients, appointments, updateGroomingStage } = useAppStore()
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const getPetData = (petId: string) => {
    return pets.find((p) => p.id === petId)
  }

  const getClientData = (petId: string) => {
    const pet = pets.find((p) => p.id === petId)
    if (!pet) return null
    return clients.find((c) => c.id === pet.clientId)
  }

  const getAppointmentData = (appointmentId: string) => {
    return appointments.find((a) => a.id === appointmentId)
  }

  const getTimeInStage = (startTime: string) => {
    const start = new Date(`2024-01-17T${startTime}:00`)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - start.getTime()) / (1000 * 60))
    return Math.max(0, diffMinutes)
  }

  const getWorkflowsInStage = (stageId: string) => {
    return groomingWorkflows.filter((workflow) => workflow.stage === stageId)
  }

  const handleDragStart = (workflowId: string) => {
    setDraggedItem(workflowId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault()
    if (draggedItem) {
      updateGroomingStage(draggedItem, targetStage as any)
      setDraggedItem(null)
    }
  }

  const selectedWorkflowData = selectedWorkflow ? groomingWorkflows.find((w) => w.id === selectedWorkflow) : null

  const selectedPet = selectedWorkflowData ? getPetData(selectedWorkflowData.petId) : null
  const selectedClient = selectedWorkflowData ? getClientData(selectedWorkflowData.petId) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pipeline de Grooming</h1>
          <p className="text-muted-foreground">Seguimiento del proceso de grooming en tiempo real</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary">{groomingWorkflows.length} mascotas en proceso</Badge>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {stages.map((stage) => {
              const count = getWorkflowsInStage(stage.id).length
              return (
                <div key={stage.id} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground">{stage.name}</div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-7 gap-4 min-h-[600px]">
        {stages.map((stage) => {
          const workflows = getWorkflowsInStage(stage.id)
          return (
            <Card
              key={stage.id}
              className="flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>{stage.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {workflows.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {workflows.map((workflow) => {
                  const pet = getPetData(workflow.petId)
                  const client = getClientData(workflow.petId)
                  const timeInStage = getTimeInStage(workflow.startTime)

                  if (!pet || !client) return null

                  return (
                    <Card
                      key={workflow.id}
                      className={`cursor-move hover:shadow-md transition-shadow ${stage.color} border-l-4 border-l-primary`}
                      draggable
                      onDragStart={() => handleDragStart(workflow.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={pet.photo || "/placeholder.svg"} alt={pet.name} />
                            <AvatarFallback>
                              <Heart className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{pet.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{client.name}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{timeInStage}min</span>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2"
                                onClick={() => setSelectedWorkflow(workflow.id)}
                              >
                                <Camera className="w-3 h-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Evidencias - {pet?.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Foto Antes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {workflow.photos.before ? (
                                        <img
                                          src={workflow.photos.before || "/placeholder.svg"}
                                          alt="Antes"
                                          className="w-full h-32 object-cover rounded"
                                        />
                                      ) : (
                                        <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                                          <Upload className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Foto Después</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      {workflow.photos.after ? (
                                        <img
                                          src={workflow.photos.after || "/placeholder.svg"}
                                          alt="Después"
                                          className="w-full h-32 object-cover rounded"
                                        />
                                      ) : (
                                        <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
                                          <Upload className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                      )}
                                    </CardContent>
                                  </Card>
                                </div>
                                <div className="flex space-x-2">
                                  <Button variant="outline" className="flex-1 bg-transparent">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Subir Foto Antes
                                  </Button>
                                  <Button variant="outline" className="flex-1 bg-transparent">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Subir Foto Después
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        {stage.id !== "delivery" && (
                          <div className="mt-2">
                            <Progress value={(timeInStage / 60) * 100} className="h-1" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
                {workflows.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-sm">Sin mascotas</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Stage Flow Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-4">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full ${stage.color} border-2 border-primary flex items-center justify-center`}
                  >
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                  <span className="text-xs mt-1 text-center">{stage.name}</span>
                </div>
                {index < stages.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground mx-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Instrucciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Arrastra las tarjetas entre columnas para actualizar el estado</p>
            <p>• Haz clic en el ícono de cámara para subir fotos de evidencia</p>
            <p>• El tiempo en cada etapa se actualiza automáticamente</p>
            <p>• Las mascotas en "Entrega" están listas para recoger</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
