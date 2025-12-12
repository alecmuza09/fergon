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
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { DollarSign, Plus, Search, FileText, CheckCircle2, Clock, Eye, Calculator, AlertCircle, CreditCard } from "lucide-react"

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
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

// Función para obtener el número de semana
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export default function LoansPage() {
  const { loans, users, selectedBranch, addLoan, recordLoanPayment } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [paymentLoanId, setPaymentLoanId] = useState<string | null>(null)
  const [newLoan, setNewLoan] = useState({
    userId: "",
    amount: "",
    weeklyPayment: "",
    startDate: new Date().toISOString().split("T")[0],
    applyInterest: true,
  })
  const [paymentData, setPaymentData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    period: "",
  })

  // Filter loans by branch
  const branchLoans = loans.filter((loan) => loan.branchId === selectedBranch)

  // Apply filters
  const filteredLoans = branchLoans
    .filter((loan) => {
      const user = users.find((u) => u.id === loan.userId)
      return user?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false
    })
    .filter((loan) => statusFilter === "all" || loan.status === statusFilter)

  const getUserName = (userId: string) => {
    return users.find((u) => u.id === userId)?.name || "Desconocido"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return { variant: "default" as const, text: "Pagado", icon: <CheckCircle2 className="w-4 h-4" /> }
      case "ACTIVE":
        return { variant: "secondary" as const, text: "Activo", icon: <Clock className="w-4 h-4" /> }
      case "CANCELLED":
        return { variant: "outline" as const, text: "Cancelado", icon: <AlertCircle className="w-4 h-4" /> }
      default:
        return { variant: "outline" as const, text: status, icon: null }
    }
  }

  // Calculate loan details
  const calculateLoanDetails = (amount: number, weeklyPayment: number, applyInterest?: boolean) => {
    const totalWeeks = Math.ceil(amount / weeklyPayment)
    const isMultipleWeeks = totalWeeks > 1
    // El interés es opcional: si applyInterest es true o undefined y es múltiples semanas, aplica 10%
    const shouldApplyInterest = applyInterest !== false && isMultipleWeeks
    const interestRate = shouldApplyInterest ? 10 : 0
    const interestAmount = Math.round((amount * interestRate) / 100)
    const totalAmount = amount + interestAmount

    return {
      totalWeeks,
      interestRate,
      interestAmount,
      totalAmount,
      isMultipleWeeks,
      shouldApplyInterest,
    }
  }

  const handleAddLoan = () => {
    if (!newLoan.userId || !newLoan.amount || !newLoan.weeklyPayment || !newLoan.startDate) {
      return
    }

    const amount = Math.round(parseFloat(newLoan.amount) * 100)
    const weeklyPayment = Math.round(parseFloat(newLoan.weeklyPayment) * 100)
    const MAX_LOAN_AMOUNT = 5000000 // $50,000.00 pesos mexicanos

    if (amount <= 0 || weeklyPayment <= 0 || weeklyPayment > amount) {
      return
    }

    if (amount > MAX_LOAN_AMOUNT) {
      alert(`El monto máximo permitido es ${formatCurrency(MAX_LOAN_AMOUNT)}`)
      return
    }

    addLoan({
      userId: newLoan.userId,
      amount,
      weeklyPayment,
      startDate: newLoan.startDate,
      branchId: selectedBranch,
      createdAt: new Date().toISOString(),
      deductions: [],
      applyInterest: newLoan.applyInterest,
    })

    setNewLoan({
      userId: "",
      amount: "",
      weeklyPayment: "",
      startDate: new Date().toISOString().split("T")[0],
      applyInterest: true,
    })
    setIsNewLoanOpen(false)
  }

  const handleRecordPayment = () => {
    if (!paymentLoanId || !paymentData.amount || !paymentData.date || !paymentData.period) {
      return
    }

    const amount = Math.round(parseFloat(paymentData.amount) * 100)
    if (amount <= 0) {
      return
    }

    recordLoanPayment(paymentLoanId, amount, paymentData.date, paymentData.period)
    
    setPaymentData({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      period: "",
    })
    setIsPaymentOpen(false)
    setPaymentLoanId(null)
  }

  const openPaymentDialog = (loanId: string) => {
    const loan = branchLoans.find((l) => l.id === loanId)
    if (!loan) return

    // Calcular período actual basado en la fecha de hoy
    const today = new Date()
    const year = today.getFullYear()
    const week = getWeekNumber(today)
    const currentPeriod = `${year}-W${week.toString().padStart(2, "0")}`

    setPaymentLoanId(loanId)
    setPaymentData({
      amount: "",
      date: today.toISOString().split("T")[0],
      period: currentPeriod,
    })
    setIsPaymentOpen(true)
  }

  const loanDetails = selectedLoan ? branchLoans.find((l) => l.id === selectedLoan) : null
  const calculatedDetails =
    newLoan.amount && newLoan.weeklyPayment
      ? calculateLoanDetails(
          Math.round(parseFloat(newLoan.amount) * 100),
          Math.round(parseFloat(newLoan.weeklyPayment) * 100),
          newLoan.applyInterest,
        )
      : null
  
  const paymentLoanDetails = paymentLoanId ? branchLoans.find((l) => l.id === paymentLoanId) : null

  // Calculate totals
  const activeLoans = branchLoans.filter((l) => l.status === "ACTIVE").length
  const totalActiveAmount = branchLoans
    .filter((l) => l.status === "ACTIVE")
    .reduce((sum, loan) => sum + loan.remainingAmount, 0)
  const totalPaidAmount = branchLoans
    .filter((l) => l.status === "PAID")
    .reduce((sum, loan) => sum + loan.totalAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Préstamos a Empleados</h1>
          <p className="text-muted-foreground">Gestión de préstamos y deducciones de nómina</p>
        </div>
        <Dialog open={isNewLoanOpen} onOpenChange={setIsNewLoanOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Préstamo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuevo Préstamo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="employee">Empleado</Label>
                <Select value={newLoan.userId} onValueChange={(value) => setNewLoan({ ...newLoan, userId: value })}>
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
                  <Label htmlFor="amount">Cantidad del Préstamo ($MXN) - Máximo: $50,000.00</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    max="50000"
                    value={newLoan.amount}
                    onChange={(e) => setNewLoan({ ...newLoan, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="weeklyPayment">Pago Semanal Máximo ($MXN)</Label>
                  <Input
                    id="weeklyPayment"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newLoan.weeklyPayment}
                    onChange={(e) => setNewLoan({ ...newLoan, weeklyPayment: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="startDate">Fecha de Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newLoan.startDate}
                  onChange={(e) => setNewLoan({ ...newLoan, startDate: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="applyInterest"
                  checked={newLoan.applyInterest}
                  onCheckedChange={(checked) => setNewLoan({ ...newLoan, applyInterest: checked })}
                />
                <Label htmlFor="applyInterest" className="cursor-pointer">
                  Aplicar 10% de interés (si es múltiples semanas)
                </Label>
              </div>

              {calculatedDetails && (
                <Card className="bg-muted">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Semanas estimadas:</span>
                        <span className="font-medium">{calculatedDetails.totalWeeks} semanas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tasa de interés:</span>
                        <span className="font-medium">
                          {calculatedDetails.interestRate}% {calculatedDetails.isMultipleWeeks ? "(múltiples semanas)" : "(misma semana)"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Interés:</span>
                        <span className="font-medium">{formatCurrency(calculatedDetails.interestAmount)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-bold">
                        <span>Total a pagar:</span>
                        <span className="text-green-600">{formatCurrency(calculatedDetails.totalAmount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button className="w-full" onClick={handleAddLoan} disabled={!calculatedDetails}>
                Crear Préstamo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Préstamos Activos</p>
                <p className="text-2xl font-bold">{activeLoans}</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monto Pendiente</p>
                <p className="text-2xl font-bold">{formatCurrency(totalActiveAmount)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pagado</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPaidAmount)}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="status">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="PAID">Pagado</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loans Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Préstamos</span>
            <Badge variant="secondary">{filteredLoans.length} préstamos</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLoans.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No se encontraron préstamos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Monto Prestado</TableHead>
                  <TableHead>Pago Semanal</TableHead>
                  <TableHead>Total a Pagar</TableHead>
                  <TableHead>Restante</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLoans.map((loan) => {
                  const statusBadge = getStatusBadge(loan.status)
                  const progress = loan.totalAmount > 0 ? ((loan.totalAmount - loan.remainingAmount) / loan.totalAmount) * 100 : 0
                  return (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{getUserName(loan.userId)}</TableCell>
                      <TableCell>{formatCurrency(loan.amount)}</TableCell>
                      <TableCell>{formatCurrency(loan.weeklyPayment)}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{formatCurrency(loan.totalAmount)}</div>
                          {loan.interestRate > 0 && (
                            <div className="text-xs text-muted-foreground">+{loan.interestRate}% interés</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-bold">{formatCurrency(loan.remainingAmount)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={progress} className="h-2" />
                          <div className="text-xs text-muted-foreground">
                            {loan.paidWeeks} / {loan.totalWeeks} semanas
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadge.variant} className="flex items-center space-x-1 w-fit">
                          {statusBadge.icon}
                          <span>{statusBadge.text}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {loan.status === "ACTIVE" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openPaymentDialog(loan.id)}
                            >
                              <CreditCard className="w-4 h-4 mr-1" />
                              Pagar
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => setSelectedLoan(loan.id)}>
                            <Eye className="w-4 h-4" />
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

      {/* Loan Details Dialog */}
      <Dialog open={!!selectedLoan} onOpenChange={() => setSelectedLoan(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {loanDetails && (
            <>
              <DialogHeader>
                <DialogTitle>Detalle del Préstamo</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Empleado</Label>
                    <p className="font-medium">{getUserName(loanDetails.userId)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Fecha de Inicio</Label>
                    <p className="font-medium">{formatDate(loanDetails.startDate)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Estado</Label>
                    <div className="mt-1">
                      <Badge {...getStatusBadge(loanDetails.status)} className="flex items-center space-x-1 w-fit">
                        {getStatusBadge(loanDetails.status).icon}
                        <span>{getStatusBadge(loanDetails.status).text}</span>
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Período de Inicio</Label>
                    <p className="font-medium">{loanDetails.startPeriod}</p>
                  </div>
                </div>

                <Tabs defaultValue="summary" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="summary">Resumen</TabsTrigger>
                    <TabsTrigger value="deductions">Deducciones</TabsTrigger>
                  </TabsList>
                  <TabsContent value="summary" className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b">
                            <span className="font-medium">Monto Prestado</span>
                            <span className="font-bold">{formatCurrency(loanDetails.amount)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Pago Semanal</span>
                            <span className="font-medium">{formatCurrency(loanDetails.weeklyPayment)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total de Semanas</span>
                            <span className="font-medium">{loanDetails.totalWeeks} semanas</span>
                          </div>
                          {loanDetails.interestRate > 0 && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Tasa de Interés</span>
                                <span className="font-medium">{loanDetails.interestRate}%</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Interés</span>
                                <span className="font-medium text-muted-foreground">
                                  {formatCurrency(loanDetails.totalAmount - loanDetails.amount)}
                                </span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t font-bold text-lg">
                            <span>Total a Pagar</span>
                            <span className="text-green-600">{formatCurrency(loanDetails.totalAmount)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Monto Restante</span>
                            <span className="font-bold text-lg">{formatCurrency(loanDetails.remainingAmount)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Semanas Pagadas</span>
                            <span className="font-medium">
                              {loanDetails.paidWeeks} / {loanDetails.totalWeeks}
                            </span>
                          </div>
                          <Progress value={((loanDetails.totalAmount - loanDetails.remainingAmount) / loanDetails.totalAmount) * 100} className="h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="deductions" className="space-y-4">
                    <Card>
                      <CardContent className="pt-6">
                        {loanDetails.deductions.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">No hay deducciones registradas</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {loanDetails.deductions.map((deduction) => (
                              <div key={deduction.id} className="flex justify-between items-center pb-2 border-b">
                                <div>
                                  <span className="font-medium">Período {deduction.period}</span>
                                  <p className="text-sm text-muted-foreground">{formatDate(deduction.date)}</p>
                                </div>
                                <span className="font-medium">{formatCurrency(deduction.amount)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between items-center pt-2 border-t font-bold">
                              <span>Total Deducido</span>
                              <span>
                                {formatCurrency(loanDetails.deductions.reduce((sum, d) => sum + d.amount, 0))}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2">
                  {loanDetails.status === "ACTIVE" && (
                    <Button
                      variant="default"
                      onClick={() => {
                        setSelectedLoan(null)
                        openPaymentDialog(loanDetails.id)
                      }}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Registrar Pago
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedLoan(null)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar Pago de Préstamo</DialogTitle>
          </DialogHeader>
          {paymentLoanDetails && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Empleado</Label>
                <p className="font-medium">{getUserName(paymentLoanDetails.userId)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Monto Restante</Label>
                <p className="font-bold text-lg">{formatCurrency(paymentLoanDetails.remainingAmount)}</p>
              </div>
              <div>
                <Label htmlFor="paymentAmount">Monto del Pago ($MXN)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="paymentDate">Fecha del Pago</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentData.date}
                  onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="paymentPeriod">Período (YYYY-WW)</Label>
                <Input
                  id="paymentPeriod"
                  type="text"
                  placeholder="2025-W49"
                  value={paymentData.period}
                  onChange={(e) => setPaymentData({ ...paymentData, period: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ejemplo: 2025-W49 (año-semana)
                </p>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleRecordPayment} disabled={!paymentData.amount || !paymentData.date || !paymentData.period}>
                  Registrar Pago
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

