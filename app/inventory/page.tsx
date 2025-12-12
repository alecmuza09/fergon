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
import { Switch } from "@/components/ui/switch"
import { Package, AlertTriangle, Plus, Search, TrendingDown, Calendar } from "lucide-react"

export default function InventoryPage() {
  const { inventory, selectedBranch } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [showCriticalOnly, setShowCriticalOnly] = useState(false)
  const [isNewItemOpen, setIsNewItemOpen] = useState(false)
  const [isMovementOpen, setIsMovementOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  // Filter inventory by branch
  const branchInventory = inventory.filter((item) => item.branchId === selectedBranch)

  // Apply filters
  const filteredInventory = branchInventory
    .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((item) => categoryFilter === "all" || item.category === categoryFilter)
    .filter((item) => {
      if (!showCriticalOnly) return true
      const isLowStock = item.stock < item.minStock
      const isExpiringSoon = new Date(item.expDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      return isLowStock || isExpiringSoon
    })

  const categories = [...new Set(branchInventory.map((item) => item.category))]

  const getStockStatus = (item: any) => {
    const isLowStock = item.stock < item.minStock
    const isExpiringSoon = new Date(item.expDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    if (isLowStock && isExpiringSoon) {
      return { variant: "destructive" as const, text: "Crítico", icon: <AlertTriangle className="w-4 h-4" /> }
    } else if (isLowStock) {
      return { variant: "destructive" as const, text: "Stock Bajo", icon: <TrendingDown className="w-4 h-4" /> }
    } else if (isExpiringSoon) {
      return { variant: "secondary" as const, text: "Por Vencer", icon: <Calendar className="w-4 h-4" /> }
    }
    return { variant: "outline" as const, text: "Normal", icon: null }
  }

  const criticalItems = branchInventory.filter((item) => {
    const isLowStock = item.stock < item.minStock
    const isExpiringSoon = new Date(item.expDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    return isLowStock || isExpiringSoon
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventario</h1>
          <p className="text-muted-foreground">Gestión de stock y productos</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" placeholder="SH001" />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grooming">Grooming</SelectItem>
                        <SelectItem value="Medicamentos">Medicamentos</SelectItem>
                        <SelectItem value="Biológicos">Biológicos</SelectItem>
                        <SelectItem value="Accesorios">Accesorios</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="itemName">Nombre del Producto</Label>
                  <Input id="itemName" placeholder="Shampoo Medicado" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stock">Stock Actual</Label>
                    <Input id="stock" type="number" placeholder="10" />
                  </div>
                  <div>
                    <Label htmlFor="minStock">Stock Mínimo</Label>
                    <Input id="minStock" type="number" placeholder="5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expDate">Fecha de Vencimiento</Label>
                    <Input id="expDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="lot">Lote</Label>
                    <Input id="lot" placeholder="L001" />
                  </div>
                </div>
                <Button className="w-full">Agregar Item</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isMovementOpen} onOpenChange={setIsMovementOpen}>
            <DialogTrigger asChild>
              <Button>Entrada/Salida</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Movimiento de Inventario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="item">Producto</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {branchInventory.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} (Stock: {item.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="movementType">Tipo de Movimiento</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entrada">Entrada</SelectItem>
                      <SelectItem value="salida">Salida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantity">Cantidad</Label>
                  <Input id="quantity" type="number" placeholder="5" />
                </div>
                <div>
                  <Label htmlFor="reason">Motivo</Label>
                  <Input id="reason" placeholder="Compra, venta, ajuste, etc." />
                </div>
                <Button className="w-full">Registrar Movimiento</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Critical Items Alert */}
      {criticalItems.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <span>Items Críticos</span>
              <Badge variant="destructive">{criticalItems.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {criticalItems.slice(0, 6).map((item) => {
                const status = getStockStatus(item)
                return (
                  <div key={item.id} className="p-3 bg-destructive/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">Stock: {item.stock}</div>
                      </div>
                      <Badge variant={status.variant} className="flex items-center space-x-1">
                        {status.icon}
                        <span>{status.text}</span>
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Switch id="critical-only" checked={showCriticalOnly} onCheckedChange={setShowCriticalOnly} />
              <Label htmlFor="critical-only" className="text-sm">
                Solo críticos
              </Label>
            </div>
            <Badge variant="secondary">{filteredInventory.length} items</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Inventario</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => {
                const status = getStockStatus(item)
                const daysToExpiry = Math.ceil(
                  (new Date(item.expDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                )

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className={`font-bold ${item.stock < item.minStock ? "text-destructive" : ""}`}>
                          {item.stock}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center text-muted-foreground">{item.minStock}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(item.expDate).toLocaleDateString("es-ES")}</div>
                        <div className={`text-xs ${daysToExpiry < 30 ? "text-destructive" : "text-muted-foreground"}`}>
                          {daysToExpiry > 0 ? `${daysToExpiry} días` : "Vencido"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.lot}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="flex items-center space-x-1 w-fit">
                        {status.icon}
                        <span>{status.text}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item.id)
                            setIsMovementOpen(true)
                          }}
                        >
                          Movimiento
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{branchInventory.length}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {branchInventory.filter((item) => item.stock < item.minStock).length}
              </div>
              <div className="text-sm text-muted-foreground">Stock Bajo</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {
                  branchInventory.filter(
                    (item) => new Date(item.expDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  ).length
                }
              </div>
              <div className="text-sm text-muted-foreground">Por Vencer</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categorías</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
