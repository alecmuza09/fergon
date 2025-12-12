"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Bell, MapPin, Clock, Users, Shield, Phone, Globe, Building } from "lucide-react"
import { useAppStore } from "@/lib/store"

export default function SettingsPage() {
  const { toast } = useToast()
  const { branches } = useAppStore()
  const branch = branches[0] // Solo hay una sucursal
  const [settings, setSettings] = useState({
    notifications: {
      whatsappReminders: true,
      emailNotifications: true,
      smsAlerts: false,
      reminderHours: 24,
    },
    routes: {
      mondayZones: ["10", "20"],
      tuesdayZones: ["30", "40"],
      wednesdayZones: ["50", "60"],
      thursdayZones: ["70", "80"],
      fridayZones: ["90", "10"],
      saturdayZones: ["20", "30"],
      sundayZones: [],
    },
    business: {
      openTime: "08:00",
      closeTime: "18:00",
      lunchBreak: true,
      lunchStart: "12:00",
      lunchEnd: "13:00",
      maxAppointmentsPerHour: 4,
    },
    services: {
      groomingDuration: 120,
      consultationDuration: 30,
      vaccinationDuration: 15,
      autoConfirmAppointments: false,
    },
  })

  const handleSave = (section: string) => {
    toast({
      title: "Configuración guardada",
      description: `Los ajustes de ${section} han sido guardados (demo)`,
    })
  }

  const zones = ["10", "20", "30", "40", "50", "60", "70", "80", "90"]
  const days = [
    { key: "mondayZones", label: "Lunes" },
    { key: "tuesdayZones", label: "Martes" },
    { key: "wednesdayZones", label: "Miércoles" },
    { key: "thursdayZones", label: "Jueves" },
    { key: "fridayZones", label: "Viernes" },
    { key: "saturdayZones", label: "Sábado" },
    { key: "sundayZones", label: "Domingo" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Ajustes del sistema y preferencias</p>
        <Badge variant="secondary" className="mt-2">
          Demo - Los cambios no se guardan
        </Badge>
      </div>

      <Tabs defaultValue="branch" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="branch">Sucursal</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="routes">Rutas</TabsTrigger>
          <TabsTrigger value="business">Horarios</TabsTrigger>
          <TabsTrigger value="services">Servicios</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="branch" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Información de la Sucursal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="branch-name">Nombre de la Sucursal</Label>
                  <Input id="branch-name" value={branch?.name || ""} readOnly />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch-address">Dirección</Label>
                  <Input id="branch-address" value={branch?.address || ""} readOnly />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch-phone">Teléfono</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <Input id="branch-phone" value={branch?.phone || ""} readOnly />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch-website">Página Web</Label>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <Input id="branch-website" value={branch?.website || ""} readOnly />
                    {branch?.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={branch.website} target="_blank" rel="noopener noreferrer">
                          Visitar
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  Esta información es de solo lectura. Para modificar los datos de la sucursal, contacta al administrador del sistema.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Configuración de Notificaciones</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="whatsapp-reminders">Recordatorios por WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">Enviar recordatorios de citas a los clientes</p>
                  </div>
                  <Switch
                    id="whatsapp-reminders"
                    checked={settings.notifications.whatsappReminders}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, whatsappReminders: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">Recibir notificaciones del sistema por email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, emailNotifications: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="sms-alerts">Alertas por SMS</Label>
                    <p className="text-sm text-muted-foreground">Alertas urgentes por mensaje de texto</p>
                  </div>
                  <Switch
                    id="sms-alerts"
                    checked={settings.notifications.smsAlerts}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, smsAlerts: checked },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-hours">Horas de anticipación para recordatorios</Label>
                  <Select
                    value={settings.notifications.reminderHours.toString()}
                    onValueChange={(value) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, reminderHours: Number.parseInt(value) },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hora</SelectItem>
                      <SelectItem value="2">2 horas</SelectItem>
                      <SelectItem value="4">4 horas</SelectItem>
                      <SelectItem value="12">12 horas</SelectItem>
                      <SelectItem value="24">24 horas</SelectItem>
                      <SelectItem value="48">48 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={() => handleSave("notificaciones")}>Guardar Configuración</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Configuración de Rutas por Día</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {days.map((day) => (
                  <div key={day.key} className="space-y-2">
                    <Label>{day.label}</Label>
                    <div className="flex flex-wrap gap-2">
                      {zones.map((zone) => (
                        <Button
                          key={zone}
                          variant={
                            (settings.routes[day.key as keyof typeof settings.routes] as string[]).includes(zone)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            const currentZones = settings.routes[day.key as keyof typeof settings.routes] as string[]
                            const newZones = currentZones.includes(zone)
                              ? currentZones.filter((z) => z !== zone)
                              : [...currentZones, zone]

                            setSettings({
                              ...settings,
                              routes: { ...settings.routes, [day.key]: newZones },
                            })
                          }}
                        >
                          Zona {zone}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={() => handleSave("rutas")}>Guardar Configuración</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Horarios de Atención</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="open-time">Hora de Apertura</Label>
                  <Input
                    id="open-time"
                    type="time"
                    value={settings.business.openTime}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        business: { ...settings.business, openTime: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="close-time">Hora de Cierre</Label>
                  <Input
                    id="close-time"
                    type="time"
                    value={settings.business.closeTime}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        business: { ...settings.business, closeTime: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="lunch-break">Horario de Almuerzo</Label>
                  <p className="text-sm text-muted-foreground">Bloquear citas durante el almuerzo</p>
                </div>
                <Switch
                  id="lunch-break"
                  checked={settings.business.lunchBreak}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      business: { ...settings.business, lunchBreak: checked },
                    })
                  }
                />
              </div>

              {settings.business.lunchBreak && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lunch-start">Inicio de Almuerzo</Label>
                    <Input
                      id="lunch-start"
                      type="time"
                      value={settings.business.lunchStart}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          business: { ...settings.business, lunchStart: e.target.value },
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lunch-end">Fin de Almuerzo</Label>
                    <Input
                      id="lunch-end"
                      type="time"
                      value={settings.business.lunchEnd}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          business: { ...settings.business, lunchEnd: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="max-appointments">Máximo de citas por hora</Label>
                <Input
                  id="max-appointments"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.business.maxAppointmentsPerHour}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      business: { ...settings.business, maxAppointmentsPerHour: Number.parseInt(e.target.value) },
                    })
                  }
                />
              </div>

              <Button onClick={() => handleSave("horarios")}>Guardar Configuración</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Configuración de Servicios</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grooming-duration">Duración de Grooming (minutos)</Label>
                  <Input
                    id="grooming-duration"
                    type="number"
                    min="30"
                    max="300"
                    value={settings.services.groomingDuration}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        services: { ...settings.services, groomingDuration: Number.parseInt(e.target.value) },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultation-duration">Duración de Consulta (minutos)</Label>
                  <Input
                    id="consultation-duration"
                    type="number"
                    min="15"
                    max="120"
                    value={settings.services.consultationDuration}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        services: { ...settings.services, consultationDuration: Number.parseInt(e.target.value) },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vaccination-duration">Duración de Vacunación (minutos)</Label>
                  <Input
                    id="vaccination-duration"
                    type="number"
                    min="5"
                    max="60"
                    value={settings.services.vaccinationDuration}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        services: { ...settings.services, vaccinationDuration: Number.parseInt(e.target.value) },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-confirm">Confirmación Automática de Citas</Label>
                    <p className="text-sm text-muted-foreground">Confirmar automáticamente las citas agendadas</p>
                  </div>
                  <Switch
                    id="auto-confirm"
                    checked={settings.services.autoConfirmAppointments}
                    onCheckedChange={(checked) =>
                      setSettings({
                        ...settings,
                        services: { ...settings.services, autoConfirmAppointments: checked },
                      })
                    }
                  />
                </div>
              </div>

              <Button onClick={() => handleSave("servicios")}>Guardar Configuración</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Configuración de Seguridad</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Configuración de Seguridad</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Gestión de usuarios, permisos y configuración de seguridad
                </p>
                <Badge variant="secondary" className="mt-4">
                  Demo - No funcional
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
