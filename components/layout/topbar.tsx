"use client"

import { useAppStore } from "@/lib/store"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin } from "lucide-react"

export function Topbar() {
  const { selectedBranch, selectedDate, branches, setSelectedBranch, setSelectedDate } = useAppStore()

  const selectedBranchName = branches.find((b) => b.id === selectedBranch)?.name || "Seleccionar sucursal"

  return (
    <div className="flex items-center justify-between p-4 bg-card border-b border-border">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-foreground">FERGON OS</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Branch Info - Solo mostrar si hay una sucursal */}
        {branches.length === 1 && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{branches[0].name}</span>
          </div>
        )}

        {/* Branch Selector - Solo mostrar si hay múltiples sucursales */}
        {branches.length > 1 && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Seleccionar sucursal" />
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
        )}

        {/* Date Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-border rounded-md bg-input text-foreground"
          />
        </div>
      </div>
    </div>
  )
}
