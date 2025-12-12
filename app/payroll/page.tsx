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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Plus, Search, FileText, CheckCircle2, Clock, Download, Eye, Calendar } from "lucide-react"

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function PayrollPage() {
  const { payrollRecords, users, selectedBranch } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [periodFilter, setPeriodFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isNewPayrollOpen, setIsNewPayrollOpen] = useState(false)
  const [selectedPayroll, setSelectedPayroll] = useState<string | null>(null)

  // Filter payroll records by branch
  const branchPayrolls = payrollRecords.filter((record) => record.branchId === selectedBranch)

  // Get unique periods
  const periods = [...new Set(branchPayrolls.map((r) => r.period))].sort().reverse()

  // Apply filters
  const filteredPayrolls = branchPayrolls
    .filter((record) => {
      const user = users.find((u) => u.id === record.userId)
      return user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false
    })
    .filter((record) => periodFilter === "all" || record.period === periodFilter)
    .filter((record) => statusFilter === "all" || record.status === statusFilter)

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "Desconocido"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return { variant: "default" as const, text: "Pagado", icon: <CheckCircle2 className="w-4 h-4" /> }
      case "APPROVED":
        return { variant: "secondary" as const, text: "Aprobado", icon: <CheckCircle2 className="w-4 h-4" /> }
      case "DRAFT":
        return { variant: "outline" as const, text: "Borrador", icon: <Clock className="w-4 h-4" /> }
      default:
        return { variant: "outline" as const, text: status, icon: null }
    }
  }

  // Calculate totals
  const totalPayroll = filteredPayrolls.reduce((sum, record) => sum + record.netPay, 0)
  const paidCount = branchPayrolls.filter((r) => r.status === "PAID").length
  const pendingCount = branchPayrolls.filter((r) => r.status === "APPROVED" || r.status === "DRAFT").length

  const payrollDetails = selectedPayroll ? branchPayrolls.find((r) => r.id === selectedPayroll) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nóminas</h1>
          <p className="text-muted-foreground">Control de nóminas y pagos a empleados</p>
        </div>
        <Dialog open={isNewPayrollOpen} onOpenChange={setIsNewPayrollOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Nómina
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generar Nueva Nómina</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="period">Período</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-01">Enero 2024</SelectItem>
                    <SelectItem value="2024-02">Febrero 2024</SelectItem>
                    <SelectItem value="2024-03">Marzo 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employee">Empleado</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar empleado" />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter((u) => u.branchId === selectedBranch)
                      .map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} - {user.role}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="periodStart">Fecha Inicio</Label>
                  <Input id="periodStart" type="date" />
                </div>
                <div>
                  <Label htmlFor="periodEnd">Fecha Fin</Label>
                  <Input id="periodEnd" type="date" />
                </div>
              </div>
              <div>
                <Label htmlFor="baseSalary">Salario Base</Label>
                <Input id="baseSalary" type="number" placeholder="0.00" step="0.01" />
              </div>
              <Button className="w-full">Generar Nómina</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Período</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPayroll)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Nóminas Pagadas</p>
                <p className="text-2xl font-bold">{paidCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Empleados</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.branchId === selectedBranch).length}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Buscar Empleado</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="period">Período</Label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los períodos" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los períodos</SelectItem>
                    {periods.map((period) => (
                      <SelectItem key={period} value={period}>
                        {period.includes("W")
                          ? `Semana ${period.split("-W")[1]} ${period.split("-W")[0]}`
                          : new Date(period + "-01").toLocaleDateString("es-ES", { year: "numeric", month: "long" })}
                      </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="PAID">Pagado</SelectItem>
                  <SelectItem value="APPROVED">Aprobado</SelectItem>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Registros de Nómina</span>
            <Badge variant="secondary">{filteredPayrolls.length} registros</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayrolls.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron registros de nómina</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Salario Base</TableHead>
                  <TableHead>Devengos</TableHead>
                  <TableHead>Deducciones</TableHead>
                  <TableHead>Neto Total</TableHead>
                  <TableHead>Pago Dispersión</TableHead>
                  <TableHead>Pago Efectivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayrolls.map((payroll) => {
                  const statusBadge = getStatusBadge(payroll.status)
                  return (
                    <TableRow key={payroll.id}>
                      <TableCell className="font-medium">{getUserName(payroll.userId)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {payroll.period.includes("W")
                              ? `Semana ${payroll.period.split("-W")[1]} ${payroll.period.split("-W")[0]}`
                              : new Date(payroll.period + "-01").toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "short",
                                })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(payroll.baseSalary)}</TableCell>
                      <TableCell className="text-green-600">{formatCurrency(payroll.totalEarnings)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatCurrency(payroll.totalDeductions)}</TableCell>
                      <TableCell className="font-bold">{formatCurrency(payroll.netPay)}</TableCell>
                      <TableCell>{formatCurrency(payroll.dispersionPayment || 0)}</TableCell>
                      <TableCell>{formatCurrency(payroll.effectivePayment || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant} className="flex items-center space-x-1 w-fit">
                          {statusBadge.icon}
                          <span>{statusBadge.text}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPayroll(payroll.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Payroll Details Dialog */}
      <Dialog open={!!selectedPayroll} onOpenChange={() => setSelectedPayroll(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {payrollDetails && (
            <>
              <DialogHeader>
                <DialogTitle>Detalle de Nómina</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Empleado</Label>
                    <p className="font-medium">{getUserName(payrollDetails.userId)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Período</Label>
                    <p className="font-medium">
                      {formatDate(payrollDetails.periodStart)} - {formatDate(payrollDetails.periodEnd)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Estado</Label>
                    <div className="mt-1">
                      <Badge {...getStatusBadge(payrollDetails.status)} className="flex items-center space-x-1 w-fit">
                        {getStatusBadge(payrollDetails.status).icon}
                        <span>{getStatusBadge(payrollDetails.status).text}</span>
                      </Badge>
                    </div>
                  </div>
                  {payrollDetails.paidAt && (
                    <div>
                      <Label className="text-muted-foreground">Fecha de Pago</Label>
                      <p className="font-medium">{formatDate(payrollDetails.paidAt)}</p>
                    </div>
                  )}
                </div>

                <Tabs defaultValue="earnings" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="earnings">Devengos</TabsTrigger>
                    <TabsTrigger value="deductions">Deducciones</TabsTrigger>
                  </TabsList>
                  <TabsContent value="earnings" className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="font-medium">Salario Base</span>
                            <span className="font-bold">{formatCurrency(payrollDetails.baseSalary)}</span>
                          </div>
                          {payrollDetails.concepts
                            .filter((c) => c.type === "EARNING")
                            .map((concept) => (
                              <div key={concept.id} className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium">{concept.name}</span>
                                  {concept.description && (
                                    <p className="text-sm text-muted-foreground">{concept.description}</p>
                                  )}
                                </div>
                                <span className="font-medium text-green-600">{formatCurrency(concept.amount)}</span>
                              </div>
                            ))}
                          <div className="flex justify-between items-center pt-2 border-t font-bold text-lg">
                            <span>Total Devengos</span>
                            <span className="text-green-600">{formatCurrency(payrollDetails.totalEarnings)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="deductions" className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          {payrollDetails.concepts
                            .filter((c) => c.type === "DEDUCTION")
                            .map((concept) => (
                              <div key={concept.id} className="flex justify-between items-center pb-2 border-b">
                                <div>
                                  <span className="font-medium">{concept.name}</span>
                                  {concept.description && (
                                    <p className="text-sm text-muted-foreground">{concept.description}</p>
                                  )}
                                </div>
                                <span className="font-medium text-muted-foreground">
                                  {formatCurrency(concept.amount)}
                                </span>
                              </div>
                            ))}
                          <div className="flex justify-between items-center pt-2 border-t font-bold text-lg">
                            <span>Total Deducciones</span>
                            <span className="text-muted-foreground">
                              {formatCurrency(payrollDetails.totalDeductions)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Neto Total</p>
                        <p className="text-2xl font-bold">{formatCurrency(payrollDetails.netPay)}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Pago Dispersión</p>
                        <p className="text-2xl font-bold">{formatCurrency(payrollDetails.dispersionPayment || 0)}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-muted">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Pago Efectivo</p>
                        <p className="text-2xl font-bold">{formatCurrency(payrollDetails.effectivePayment || 0)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setSelectedPayroll(null)}>
                    Cerrar
                  </Button>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Recibo
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

