"use client"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, ShoppingCart, Plus, Minus, Trash2, FileText, Percent, Scissors, Droplets, Sparkles } from "lucide-react"

const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

interface CartItem {
  serviceId: string
  quantity: number
  price: number
}

export default function POSPage() {
  const { services, clients, pets } = useAppStore()
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedClient, setSelectedClient] = useState("")
  const [selectedPet, setSelectedPet] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("")
  const [discount, setDiscount] = useState(0)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  const addToCart = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return

    const existingItem = cart.find((item) => item.serviceId === serviceId)
    if (existingItem) {
      setCart(cart.map((item) => (item.serviceId === serviceId ? { ...item, quantity: item.quantity + 1 } : item)))
    } else {
      setCart([...cart, { serviceId, quantity: 1, price: service.priceCents }])
    }
  }

  const updateQuantity = (serviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(serviceId)
      return
    }
    setCart(cart.map((item) => (item.serviceId === serviceId ? { ...item, quantity } : item)))
  }

  const removeFromCart = (serviceId: string) => {
    setCart(cart.filter((item) => item.serviceId !== serviceId))
  }

  const getServiceName = (serviceId: string) => {
    return services.find((s) => s.id === serviceId)?.name || "Servicio desconocido"
  }

  // Filtrar servicios por tipo
  const groomingServices = services.filter((s) => s.type === "grooming")
  const otherServices = services.filter((s) => s.type !== "grooming")

  // Agrupar servicios de grooming por tipo de servicio y tamaño
  const bathServices = groomingServices.filter((s) => s.name.toLowerCase().includes("baño"))
  const cutServices = groomingServices.filter((s) => s.name.toLowerCase().includes("corte"))
  const styleServices = groomingServices.filter((s) => s.name.toLowerCase().includes("peinado"))

  // Agrupar por tamaño
  const groupBySize = (serviceList: typeof services) => {
    const grouped: Record<string, typeof services> = {
      pequeño: [],
      mediano: [],
      grande: [],
    }
    serviceList.forEach((service) => {
      if (service.petSize) {
        grouped[service.petSize].push(service)
      }
    })
    return grouped
  }

  const bathsBySize = groupBySize(bathServices)
  const cutsBySize = groupBySize(cutServices)
  const stylesBySize = groupBySize(styleServices)

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || ""
  }

  const getPetName = (petId: string) => {
    return pets.find((p) => p.id === petId)?.name || ""
  }

  const clientPets = selectedClient ? pets.filter((pet) => pet.clientId === selectedClient) : []

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = Math.round(subtotal * (discount / 100))
  const total = subtotal - discountAmount

  const handleCheckout = () => {
    console.log("Processing payment:", {
      client: selectedClient,
      pet: selectedPet,
      cart,
      paymentMethod,
      total: total / 100,
    })
    setIsReceiptOpen(true)
  }

  const clearCart = () => {
    setCart([])
    setSelectedClient("")
    setSelectedPet("")
    setPaymentMethod("")
    setDiscount(0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Punto de Venta</h1>
          <p className="text-muted-foreground">Sistema de facturación y cobros</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">{cart.length} items en carrito</Badge>
          <Button variant="outline" onClick={clearCart}>
            Limpiar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Catálogo de Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="baths" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="baths">
                    <Droplets className="w-4 h-4 mr-2" />
                    Baños
                  </TabsTrigger>
                  <TabsTrigger value="cuts">
                    <Scissors className="w-4 h-4 mr-2" />
                    Cortes
                  </TabsTrigger>
                  <TabsTrigger value="styles">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Peinados
                  </TabsTrigger>
                  <TabsTrigger value="other">Otros</TabsTrigger>
                </TabsList>

                <TabsContent value="baths" className="space-y-6 mt-4">
                  {["pequeño", "mediano", "grande"].map((size) => (
                    <div key={size}>
                      <h3 className="text-lg font-semibold mb-3 capitalize">{size}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {bathsBySize[size as keyof typeof bathsBySize]
                          .sort((a, b) => {
                            const order = { corto: 1, medio: 2, largo: 3 }
                            return (order[a.hairLength || "corto"] || 0) - (order[b.hairLength || "corto"] || 0)
                          })
                          .map((service) => (
                            <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
                              <CardContent className="pt-4">
                                <div className="flex flex-col">
                                  <div className="flex-1">
                                    <h3 className="font-medium text-sm">{service.name.replace("Baño - ", "")}</h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {service.hairLength}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">{service.durationMin}min</span>
                                    </div>
                                    <div className="text-base font-bold mt-2">{formatCurrency(service.priceCents)}</div>
                                  </div>
                                  <Button size="sm" onClick={() => addToCart(service.id)} className="mt-2 w-full">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Agregar
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="cuts" className="space-y-6 mt-4">
                  {["pequeño", "mediano", "grande"].map((size) => (
                    <div key={size}>
                      <h3 className="text-lg font-semibold mb-3 capitalize">{size}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {cutsBySize[size as keyof typeof cutsBySize]
                          .sort((a, b) => {
                            const order = { corto: 1, medio: 2, largo: 3 }
                            return (order[a.hairLength || "corto"] || 0) - (order[b.hairLength || "corto"] || 0)
                          })
                          .map((service) => (
                            <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
                              <CardContent className="pt-4">
                                <div className="flex flex-col">
                                  <div className="flex-1">
                                    <h3 className="font-medium text-sm">{service.name.replace("Corte - ", "")}</h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {service.hairLength}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">{service.durationMin}min</span>
                                    </div>
                                    <div className="text-base font-bold mt-2">{formatCurrency(service.priceCents)}</div>
                                  </div>
                                  <Button size="sm" onClick={() => addToCart(service.id)} className="mt-2 w-full">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Agregar
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="styles" className="space-y-6 mt-4">
                  {["pequeño", "mediano", "grande"].map((size) => (
                    <div key={size}>
                      <h3 className="text-lg font-semibold mb-3 capitalize">{size}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {stylesBySize[size as keyof typeof stylesBySize]
                          .sort((a, b) => {
                            const order = { corto: 1, medio: 2, largo: 3 }
                            return (order[a.hairLength || "corto"] || 0) - (order[b.hairLength || "corto"] || 0)
                          })
                          .map((service) => (
                            <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
                              <CardContent className="pt-4">
                                <div className="flex flex-col">
                                  <div className="flex-1">
                                    <h3 className="font-medium text-sm">{service.name.replace("Peinado - ", "")}</h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                      <Badge variant="outline" className="text-xs">
                                        {service.hairLength}
                                      </Badge>
                                      <span className="text-xs text-muted-foreground">{service.durationMin}min</span>
                                    </div>
                                    <div className="text-base font-bold mt-2">{formatCurrency(service.priceCents)}</div>
                                  </div>
                                  <Button size="sm" onClick={() => addToCart(service.id)} className="mt-2 w-full">
                                    <Plus className="w-4 h-4 mr-1" />
                                    Agregar
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="other" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {otherServices.map((service) => (
                      <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{service.name}</h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline">{service.type}</Badge>
                                <span className="text-sm text-muted-foreground">{service.durationMin}min</span>
                              </div>
                              <div className="text-lg font-bold mt-2">{formatCurrency(service.priceCents)}</div>
                            </div>
                            <Button size="sm" onClick={() => addToCart(service.id)} className="ml-4">
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Cart and Checkout */}
        <div className="space-y-6">
          {/* Customer Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="client">Cliente</Label>
                <Select
                  value={selectedClient}
                  onValueChange={(value) => {
                    setSelectedClient(value)
                    setSelectedPet("")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedClient && (
                <div>
                  <Label htmlFor="pet">Mascota</Label>
                  <Select value={selectedPet} onValueChange={setSelectedPet}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar mascota" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientPets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name} ({pet.species === "dog" ? "Perro" : "Gato"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shopping Cart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Carrito</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Carrito vacío</p>
                  <p className="text-sm text-muted-foreground">Agrega servicios para comenzar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.serviceId} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{getServiceName(item.serviceId)}</div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(item.price)} c/u</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.serviceId)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals and Payment */}
          {cart.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="discount" className="flex-1">
                      Descuento:
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="discount"
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-16 text-center"
                        min="0"
                        max="100"
                      />
                      <Percent className="w-4 h-4" />
                    </div>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Descuento ({discount}%):</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="payment">Método de Pago</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" onClick={handleCheckout} disabled={!selectedClient || !paymentMethod}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Procesar Pago
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comprobante de Venta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold">FERGON OS</h3>
                <p className="text-sm text-muted-foreground">Comprobante de Venta</p>
                <p className="text-xs text-muted-foreground">#{Date.now()}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <span>{getClientName(selectedClient)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mascota:</span>
                  <span>{getPetName(selectedPet)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fecha:</span>
                  <span>{new Date().toLocaleDateString("es-ES")}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                {cart.map((item) => (
                  <div key={item.serviceId} className="flex justify-between">
                    <span>
                      {getServiceName(item.serviceId)} x{item.quantity}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${(subtotal / 100).toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span>Descuento ({discount}%):</span>
                    <span>-${(discountAmount / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Método de pago:</span>
                  <span className="capitalize">{paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" className="flex-1 bg-transparent">
                <FileText className="w-4 h-4 mr-2" />
                Generar PDF
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Enviar por Email
              </Button>
            </div>

            <Button
              className="w-full"
              onClick={() => {
                setIsReceiptOpen(false)
                clearCart()
              }}
            >
              Nueva Venta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
