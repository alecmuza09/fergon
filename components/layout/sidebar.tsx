"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  Heart,
  Calendar,
  Scissors,
  Stethoscope,
  Truck,
  Package,
  CreditCard,
  Star,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  HandCoins,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Mascotas", href: "/pets", icon: Heart },
  { name: "Agenda", href: "/appointments", icon: Calendar },
  { name: "Grooming", href: "/grooming", icon: Scissors },
  { name: "Veterinaria", href: "/veterinary", icon: Stethoscope },
  { name: "Rutas", href: "/routes", icon: Truck },
  { name: "Inventario", href: "/inventory", icon: Package },
  { name: "Caja", href: "/pos", icon: CreditCard },
  { name: "Nóminas", href: "/payroll", icon: DollarSign },
  { name: "Préstamos", href: "/loans", icon: HandCoins },
  { name: "Calidad (NPS)", href: "/quality", icon: Star },
  { name: "Portal Cliente", href: "/client-portal", icon: UserCircle },
  { name: "Ajustes", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground">FERGON OS</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
                    collapsed && "px-2",
                  )}
                >
                  <item.icon className={cn("w-5 h-5", !collapsed && "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </div>
  )
}
