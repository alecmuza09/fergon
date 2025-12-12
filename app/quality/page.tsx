"use client"

import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Star, MessageSquare, Plus, TrendingUp, Users } from "lucide-react"

export default function QualityPage() {
  const { surveys, clients, selectedBranch } = useAppStore()

  // Filter surveys by branch
  const branchSurveys = surveys.filter((survey) => survey.branchId === selectedBranch)

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || "Cliente desconocido"
  }

  const avgNPS =
    branchSurveys.length > 0 ? Math.round(branchSurveys.reduce((acc, s) => acc + s.nps, 0) / branchSurveys.length) : 0

  const npsDistribution = {
    promoters: branchSurveys.filter((s) => s.nps >= 9).length,
    passives: branchSurveys.filter((s) => s.nps >= 7 && s.nps <= 8).length,
    detractors: branchSurveys.filter((s) => s.nps <= 6).length,
  }

  const npsScore =
    branchSurveys.length > 0
      ? Math.round(((npsDistribution.promoters - npsDistribution.detractors) / branchSurveys.length) * 100)
      : 0

  const getNPSColor = (score: number) => {
    if (score >= 9) return "text-green-600"
    if (score >= 7) return "text-yellow-600"
    return "text-green-700"
  }

  const getNPSBadge = (score: number) => {
    if (score >= 9) return { variant: "default" as const, text: "Promotor" }
    if (score >= 7) return { variant: "secondary" as const, text: "Pasivo" }
    return { variant: "destructive" as const, text: "Detractor" }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calidad (NPS)</h1>
          <p className="text-muted-foreground">Net Promoter Score y satisfacción del cliente</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Crear Encuesta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Encuesta NPS</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center p-6 bg-muted rounded-lg">
                <h3 className="text-lg font-medium mb-4">Configuración de Encuesta</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Tipo de envío</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Segmento de clientes</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar segmento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los clientes</SelectItem>
                        <SelectItem value="recent">Clientes recientes</SelectItem>
                        <SelectItem value="frequent">Clientes frecuentes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button className="w-full">Enviar Encuesta (Demo)</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* NPS Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{avgNPS}</div>
              <div className="text-sm text-muted-foreground">NPS Promedio</div>
              <div className="flex items-center justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(avgNPS / 2) ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{npsDistribution.promoters}</div>
              <div className="text-sm text-muted-foreground">Promotores</div>
              <div className="text-xs text-green-600">Puntuación 9-10</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{npsDistribution.passives}</div>
              <div className="text-sm text-muted-foreground">Pasivos</div>
              <div className="text-xs text-yellow-600">Puntuación 7-8</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-700">{npsDistribution.detractors}</div>
              <div className="text-sm text-muted-foreground">Detractores</div>
              <div className="text-xs text-green-700">Puntuación 0-6</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NPS Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Puntuación NPS</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold">{npsScore}</div>
            <div className="text-lg text-muted-foreground">
              {npsScore >= 50 ? "Excelente" : npsScore >= 0 ? "Bueno" : "Necesita Mejora"}
            </div>
            <Progress value={Math.max(0, (npsScore + 100) / 2)} className="h-4" />
            <div className="text-sm text-muted-foreground">Basado en {branchSurveys.length} respuestas</div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Comentarios Recientes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {branchSurveys
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((survey) => {
                const badge = getNPSBadge(survey.nps)
                return (
                  <Card key={survey.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-medium">{getClientName(survey.clientId)}</span>
                            <Badge variant={badge.variant}>{badge.text}</Badge>
                            <div className="flex items-center space-x-1">
                              <span className={`text-2xl font-bold ${getNPSColor(survey.nps)}`}>{survey.nps}</span>
                              <span className="text-sm text-muted-foreground">/10</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">"{survey.comment}"</p>
                          <div className="text-xs text-muted-foreground">
                            {new Date(survey.date).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Filtros de Análisis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Período</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Último mes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mes</SelectItem>
                  <SelectItem value="quarter">Último trimestre</SelectItem>
                  <SelectItem value="year">Último año</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Tipo de servicio</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los servicios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los servicios</SelectItem>
                  <SelectItem value="grooming">Grooming</SelectItem>
                  <SelectItem value="veterinary">Veterinaria</SelectItem>
                  <SelectItem value="other">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full">Aplicar Filtros</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Estadísticas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Tasa de respuesta</span>
                <span className="font-medium">75%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tiempo promedio de respuesta</span>
                <span className="font-medium">2.3 días</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Clientes encuestados</span>
                <span className="font-medium">{branchSurveys.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Mejora vs mes anterior</span>
                <span className="font-medium text-green-600">+12%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
