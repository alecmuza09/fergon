"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { Calendar, Users, Heart, TrendingUp, Star, AlertTriangle, MapPin, Truck } from "lucide-react"
import Link from "next/link"

const serviceData = [
  { name: "Grooming", value: 45 },
  { name: "Consultas", value: 30 },
  { name: "Vacunas", value: 20 },
  { name: "Extras", value: 15 },
]

const weeklyTrend = [
  { day: "Lun", servicios: 12 },
  { day: "Mar", servicios: 19 },
  { day: "Mié", servicios: 15 },
  { day: "Jue", servicios: 22 },
  { day: "Vie", servicios: 28 },
  { day: "Sáb", servicios: 35 },
  { day: "Dom", servicios: 18 },
]

export default function Dashboard() {
  const { selectedBranch, selectedDate, branches, appointments, groomingWorkflows, routes, vaccinations, surveys } =
    useAppStore()

  const selectedBranchName = branches.find((b) => b.id === selectedBranch)?.name

  // Filter data by selected branch and date
  const todayAppointments = appointments.filter((a) => a.branchId === selectedBranch && a.date === selectedDate)

  const inProgressPets = groomingWorkflows.filter((gw) => gw.stage !== "delivery").length

  const todayRoutes = routes.filter((r) => r.branchId === selectedBranch && r.date === selectedDate)

  const routeProgress =
    todayRoutes.length > 0
      ? Math.round(
          (todayRoutes[0].stops.filter((s) => s.status === "DELIVERED").length / todayRoutes[0].stops.length) * 100,
        )
      : 0

  const overdueVaccinations = vaccinations.filter((v) => v.status === "OVERDUE").length
  const pendingVaccinations = vaccinations.filter((v) => v.status === "PENDING").length

  const avgNPS = surveys.length > 0 ? Math.round(surveys.reduce((acc, s) => acc + s.nps, 0) / surveys.length) : 0

  const mockRevenue = 125000 // Mock revenue in cents

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          {selectedBranchName} -{" "}
          {new Date(selectedDate).toLocaleDateString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAppointments.length}</div>
            <div className="flex space-x-2 mt-2">
              <Badge variant="secondary">
                {todayAppointments.filter((a) => a.status === "SCHEDULED").length} Programadas
              </Badge>
              <Badge variant="default">
                {todayAppointments.filter((a) => a.status === "IN_PROGRESS").length} En Proceso
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mascotas en Proceso</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressPets}</div>
            <p className="text-xs text-muted-foreground">En pipeline de grooming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento Rutas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routeProgress}%</div>
            <Progress value={routeProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Demo</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(mockRevenue / 100).toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN",
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground">Hoy</p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Promedio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgNPS}/10</div>
            <Badge variant={avgNPS >= 8 ? "default" : avgNPS >= 6 ? "secondary" : "destructive"}>
              {avgNPS >= 8 ? "Excelente" : avgNPS >= 6 ? "Bueno" : "Mejorar"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vacunas por Vencer</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueVaccinations}</div>
            <p className="text-xs text-muted-foreground">{pendingVaccinations} próximas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Este mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Servicios por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tendencia Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="servicios" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Map and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Mapa de Rutas - Monterrey, N.L.</span>
              </CardTitle>
              <Link href="/routes">
                <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                  Ver Detalles
                </Badge>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full rounded-lg overflow-hidden border border-border bg-muted">
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
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold">{todayRoutes.length}</div>
                <div className="text-xs text-muted-foreground">Rutas Activas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">
                  {todayRoutes.reduce((sum, route) => sum + route.stops.length, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Paradas Totales</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">
                  {todayRoutes.reduce(
                    (sum, route) => sum + route.stops.filter((s) => s.status === "DELIVERED").length,
                    0,
                  )}
                </div>
                <div className="text-xs text-muted-foreground">Completadas</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tareas del Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Revisar inventario crítico</span>
                <Badge variant="destructive">Urgente</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Confirmar citas de mañana</span>
                <Badge variant="secondary">Pendiente</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Actualizar esquemas de vacunación</span>
                <Badge variant="secondary">Pendiente</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span>Enviar recordatorios WhatsApp</span>
                <Badge variant="default">Completado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
