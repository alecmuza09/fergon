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
import { Plus, Search, Phone, MessageCircle, Edit, Eye } from "lucide-react"

export default function ClientsPage() {
  const { clients, pets, branches, selectedBranch, addClient, updateClient } = useAppStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewClientOpen, setIsNewClientOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<string | null>(null)
  const [newClient, setNewClient] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    address: "",
    branchId: selectedBranch,
  })

  // Filter clients by branch and search term
  const filteredClients = clients
    .filter((client) => client.branchId === selectedBranch)
    .filter((client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleAddClient = () => {
    addClient({
      ...newClient,
      petCount: 0,
    })
    setNewClient({
      name: "",
      phone: "",
      whatsapp: "",
      address: "",
      branchId: selectedBranch,
    })
    setIsNewClientOpen(false)
  }

  const handleEditClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId)
    if (client) {
      setNewClient({
        name: client.name,
        phone: client.phone,
        whatsapp: client.whatsapp,
        address: client.address,
        branchId: client.branchId,
      })
      setEditingClient(clientId)
      setIsNewClientOpen(true)
    }
  }

  const handleUpdateClient = () => {
    if (editingClient) {
      updateClient(editingClient, newClient)
      setEditingClient(null)
      setNewClient({
        name: "",
        phone: "",
        whatsapp: "",
        address: "",
        branchId: selectedBranch,
      })
      setIsNewClientOpen(false)
    }
  }

  const getClientPetCount = (clientId: string) => {
    return pets.filter((pet) => pet.clientId === clientId).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground">Gestión de clientes y contactos</p>
        </div>
        <Dialog open={isNewClientOpen} onOpenChange={setIsNewClientOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClient ? "Editar Cliente" : "Nuevo Cliente"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  placeholder="555-0101"
                />
              </div>
              <div>
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={newClient.whatsapp}
                  onChange={(e) => setNewClient({ ...newClient, whatsapp: e.target.value })}
                  placeholder="555-0101"
                />
              </div>
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  placeholder="Av. Principal 123, Zona 10"
                />
              </div>
              <div>
                <Label htmlFor="branch">Sucursal</Label>
                <Select
                  value={newClient.branchId}
                  onValueChange={(value) => setNewClient({ ...newClient, branchId: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={editingClient ? handleUpdateClient : handleAddClient} className="w-full">
                {editingClient ? "Actualizar Cliente" : "Crear Cliente"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="secondary">{filteredClients.length} clientes</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Mascotas</TableHead>
                <TableHead>Último Servicio</TableHead>
                <TableHead>Sucursal</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">{client.address}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="w-4 h-4 mr-1" />
                        {client.phone}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{getClientPetCount(client.id)} mascotas</Badge>
                  </TableCell>
                  <TableCell>
                    {client.lastService ? (
                      <div className="text-sm">{new Date(client.lastService).toLocaleDateString("es-ES")}</div>
                    ) : (
                      <span className="text-muted-foreground">Sin servicios</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{branches.find((b) => b.id === client.branchId)?.name}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditClient(client.id)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
