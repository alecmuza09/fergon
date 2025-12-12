import { create } from "zustand"

// Función auxiliar para obtener el número de semana
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export interface Branch {
  id: string
  name: string
  address?: string
  phone?: string
  website?: string
}

export interface User {
  id: string
  name: string
  role: "Admin" | "Coordinación" | "Vet" | "Groomer" | "Recepción" | "Chofer"
  branchId: string
}

export interface Client {
  id: string
  name: string
  phone: string
  whatsapp: string
  address: string
  branchId: string
  lastService?: string
  petCount: number
}

export interface Pet {
  id: string
  name: string
  species: "dog" | "cat"
  breed: string
  age: number
  weight: number
  allergies: string[]
  photo: string
  clientId: string
  vaccinations: Vaccination[]
}

export interface Service {
  id: string
  name: string
  type: "grooming" | "consulta" | "vacuna" | "extra"
  priceCents: number
  durationMin: number
}

export interface Appointment {
  id: string
  clientId: string
  petId: string
  serviceId: string
  date: string
  time: string
  status: "SCHEDULED" | "IN_PROGRESS" | "DONE" | "CANCELLED"
  branchId: string
}

export interface GroomingWorkflow {
  id: string
  petId: string
  appointmentId: string
  stage: "reception" | "pre-check" | "bath" | "dry" | "cut" | "review" | "delivery"
  startTime: string
  photos: { before?: string; after?: string }
}

export interface Vaccination {
  id: string
  petId: string
  vaccine: string
  date: string
  dueDate: string
  status: "PENDING" | "DONE" | "OVERDUE"
}

export interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  stock: number
  minStock: number
  expDate: string
  lot: string
  branchId: string
}

export interface Route {
  id: string
  zone: string
  date: string
  stops: RouteStop[]
  branchId: string
}

export interface RouteStop {
  id: string
  order: number
  clientId: string
  petId: string
  address: string
  timeWindow: string
  status: "PENDING" | "ARRIVED" | "PICKED_UP" | "DELIVERED"
}

export interface Survey {
  id: string
  clientId: string
  nps: number
  comment: string
  date: string
  branchId: string
}

export interface PayrollConcept {
  id: string
  name: string
  type: "EARNING" | "DEDUCTION"
  amount: number // en centavos
  description?: string
}

export interface PayrollRecord {
  id: string
  userId: string
  period: string // formato YYYY-WW para semanal
  periodStart: string
  periodEnd: string
  baseSalary: number // en centavos
  concepts: PayrollConcept[]
  totalEarnings: number // en centavos
  totalDeductions: number // en centavos
  netPay: number // en centavos
  dispersionPayment: number // en centavos (Pago Dispersión)
  effectivePayment: number // en centavos (Pago Efectivo)
  status: "DRAFT" | "APPROVED" | "PAID"
  branchId: string
  createdAt: string
  paidAt?: string
}

export interface Loan {
  id: string
  userId: string
  amount: number // cantidad prestada en centavos
  weeklyPayment: number // pago semanal máximo en centavos
  startDate: string // fecha de inicio del préstamo
  startPeriod: string // período de inicio (YYYY-WW)
  totalWeeks: number // número total de semanas calculado
  interestRate: number // tasa de interés (0% si misma semana, 10% si múltiples semanas)
  totalAmount: number // monto total con interés en centavos
  remainingAmount: number // monto restante por pagar en centavos
  paidWeeks: number // semanas pagadas
  status: "ACTIVE" | "PAID" | "CANCELLED"
  branchId: string
  createdAt: string
  deductions: LoanDeduction[] // deducciones aplicadas en nóminas
}

export interface LoanDeduction {
  id: string
  loanId: string
  payrollRecordId: string
  period: string // período de la nómina donde se aplicó
  amount: number // cantidad deducida en centavos
  date: string // fecha de la deducción
}

interface AppState {
  selectedBranch: string
  selectedDate: string
  branches: Branch[]
  users: User[]
  clients: Client[]
  pets: Pet[]
  services: Service[]
  appointments: Appointment[]
  groomingWorkflows: GroomingWorkflow[]
  vaccinations: Vaccination[]
  inventory: InventoryItem[]
  routes: Route[]
  surveys: Survey[]
  payrollRecords: PayrollRecord[]
  loans: Loan[]

  // Actions
  setSelectedBranch: (branchId: string) => void
  setSelectedDate: (date: string) => void
  updateGroomingStage: (workflowId: string, stage: GroomingWorkflow["stage"]) => void
  updateRouteStopStatus: (routeId: string, stopId: string, status: RouteStop["status"]) => void
  addClient: (client: Omit<Client, "id">) => void
  updateClient: (id: string, client: Partial<Client>) => void
  addPet: (pet: Omit<Pet, "id">) => void
  updatePet: (id: string, pet: Partial<Pet>) => void
  addLoan: (loan: Omit<Loan, "id" | "totalWeeks" | "interestRate" | "totalAmount" | "remainingAmount" | "paidWeeks" | "status" | "startPeriod" | "deductions">) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  selectedBranch: "b1",
  selectedDate: new Date().toISOString().split("T")[0],

  branches: [
    {
      id: "b1",
      name: "Sucursal San Colinas",
      address: "Esquina con, Local 1 Boulevard Puerta del Sol, Alan Poe 534, Colinas de San Jerónimo 1o. Sector, 64630 Monterrey, N.L.",
      phone: "81 1510 1222",
      website: "https://fergon.com.mx",
    },
  ],

  users: [
    { id: "u1", name: "Dr. María González", role: "Admin", branchId: "b1" },
    { id: "u2", name: "Ana Rodríguez", role: "Coordinación", branchId: "b1" },
    { id: "u3", name: "Dr. Carlos Mendez", role: "Vet", branchId: "b1" },
    { id: "u4", name: "Sofia López", role: "Groomer", branchId: "b1" },
    { id: "u5", name: "Luis Herrera", role: "Recepción", branchId: "b1" },
    { id: "u6", name: "Miguel Torres", role: "Chofer", branchId: "b1" },
    { id: "u7", name: "ALONSO MALDONADO SILVIA GUADALUPE", role: "Groomer", branchId: "b1" },
    { id: "u8", name: "CARRANZA CASTRO ROBERTO", role: "Chofer", branchId: "b1" },
    { id: "u9", name: "MARTINES SOLIS IRAM EMMANUEL", role: "Vet", branchId: "b1" },
    { id: "u10", name: "PEÑA IBARRA HUMBERTO GERARDO", role: "Recepción", branchId: "b1" },
    { id: "u11", name: "LEIJA HERNANDEZ RAUL", role: "Groomer", branchId: "b1" },
    { id: "u12", name: "GONZALEZ GONZALEZ JOSE LUIS", role: "Chofer", branchId: "b1" },
    { id: "u13", name: "RODRIGUEZ MARTINEZ CARLOS ALBERTO", role: "Vet", branchId: "b1" },
    { id: "u14", name: "LOPEZ PEREZ MARIA ELENA", role: "Recepción", branchId: "b1" },
    { id: "u15", name: "MARTINEZ SANCHEZ JUAN CARLOS", role: "Groomer", branchId: "b1" },
    { id: "u16", name: "HERNANDEZ GARCIA ANA PATRICIA", role: "Coordinación", branchId: "b1" },
    { id: "u17", name: "GARCIA RAMIREZ LUIS FERNANDO", role: "Chofer", branchId: "b1" },
    { id: "u18", name: "RAMIREZ TORRES JORGE ALBERTO", role: "Vet", branchId: "b1" },
    { id: "u19", name: "TORRES FLORES DIEGO ARMANDO", role: "Recepción", branchId: "b1" },
  ],

  payrollRecords: [
    {
      id: "pr1",
      userId: "u7",
      period: "2024-W15",
      periodStart: "2024-04-08",
      periodEnd: "2024-04-14",
      baseSalary: 757700, // $7,577.00
      concepts: [
        { id: "c1", name: "IGSS", type: "DEDUCTION", amount: 30163 },
        { id: "c2", name: "ISR", type: "DEDUCTION", amount: 0 },
      ],
      totalEarnings: 757700,
      totalDeductions: 30163,
      netPay: 727537,
      dispersionPayment: 249416,
      effectivePayment: 478118,
      status: "PAID",
      branchId: "b1",
      createdAt: "2024-04-14",
      paidAt: "2024-04-15",
    },
    {
      id: "pr2",
      userId: "u8",
      period: "2024-W15",
      periodStart: "2024-04-08",
      periodEnd: "2024-04-14",
      baseSalary: 252205, // $2,522.05
      concepts: [
        { id: "c3", name: "IGSS", type: "DEDUCTION", amount: 47132 },
        { id: "c4", name: "ISR", type: "DEDUCTION", amount: 0 },
      ],
      totalEarnings: 252205,
      totalDeductions: 47132,
      netPay: 205073,
      dispersionPayment: 205061,
      effectivePayment: 0,
      status: "PAID",
      branchId: "b1",
      createdAt: "2024-04-14",
      paidAt: "2024-04-15",
    },
    {
      id: "pr3",
      userId: "u9",
      period: "2024-W15",
      periodStart: "2024-04-08",
      periodEnd: "2024-04-14",
      baseSalary: 242160, // $2,421.60
      concepts: [
        { id: "c5", name: "IGSS", type: "DEDUCTION", amount: 110336 },
        { id: "c6", name: "ISR", type: "DEDUCTION", amount: 0 },
      ],
      totalEarnings: 242160,
      totalDeductions: 110336,
      netPay: 131824,
      dispersionPayment: 131824,
      effectivePayment: 0,
      status: "PAID",
      branchId: "b1",
      createdAt: "2024-04-14",
      paidAt: "2024-04-15",
    },
    {
      id: "pr4",
      userId: "u10",
      period: "2024-W15",
      periodStart: "2024-04-08",
      periodEnd: "2024-04-14",
      baseSalary: 252205, // $2,522.05
      concepts: [
        { id: "c7", name: "IGSS", type: "DEDUCTION", amount: 47132 },
        { id: "c8", name: "ISR", type: "DEDUCTION", amount: 0 },
      ],
      totalEarnings: 252205,
      totalDeductions: 47132,
      netPay: 205073,
      dispersionPayment: 205061,
      effectivePayment: 0,
      status: "PAID",
      branchId: "b1",
      createdAt: "2024-04-14",
      paidAt: "2024-04-15",
    },
    {
      id: "pr5",
      userId: "u11",
      period: "2024-W15",
      periodStart: "2024-04-08",
      periodEnd: "2024-04-14",
      baseSalary: 252205, // $2,522.05
      concepts: [
        { id: "c9", name: "IGSS", type: "DEDUCTION", amount: 47132 },
        { id: "c10", name: "ISR", type: "DEDUCTION", amount: 0 },
      ],
      totalEarnings: 252205,
      totalDeductions: 47132,
      netPay: 205073,
      dispersionPayment: 205061,
      effectivePayment: 0,
      status: "PAID",
      branchId: "b1",
      createdAt: "2024-04-14",
      paidAt: "2024-04-15",
    },
    {
      id: "pr6",
      userId: "u12",
      period: "2024-W15",
      periodStart: "2024-04-08",
      periodEnd: "2024-04-14",
      baseSalary: 252205, // $2,522.05
      concepts: [
        { id: "c11", name: "IGSS", type: "DEDUCTION", amount: 47132 },
        { id: "c12", name: "ISR", type: "DEDUCTION", amount: 0 },
      ],
      totalEarnings: 252205,
      totalDeductions: 47132,
      netPay: 205073,
      dispersionPayment: 205061,
      effectivePayment: 0,
      status: "PAID",
      branchId: "b1",
      createdAt: "2024-04-14",
      paidAt: "2024-04-15",
    },
    {
      id: "pr7",
      userId: "u13",
      period: "2024-W15",
      periodStart: "2024-04-08",
      periodEnd: "2024-04-14",
      baseSalary: 252205, // $2,522.05
      concepts: [
        { id: "c13", name: "IGSS", type: "DEDUCTION", amount: 47132 },
        { id: "c14", name: "ISR", type: "DEDUCTION", amount: 0 },
      ],
      totalEarnings: 252205,
      totalDeductions: 47132,
      netPay: 205073,
      dispersionPayment: 205061,
      effectivePayment: 0,
      status: "PAID",
      branchId: "b1",
      createdAt: "2024-04-14",
      paidAt: "2024-04-15",
    },
    {
      id: "pr8",
      userId: "u14",
      period: "2024-W15",
      periodStart: "2024-04-08",
      periodEnd: "2024-04-14",
      baseSalary: 252205, // $2,522.05
      concepts: [
        { id: "c15", name: "IGSS", type: "DEDUCTION", amount: 47132 },
        { id: "c16", name: "ISR", type: "DEDUCTION", amount: 0 },
      ],
      totalEarnings: 252205,
      totalDeductions: 47132,
      netPay: 205073,
      dispersionPayment: 205061,
      effectivePayment: 0,
      status: "PAID",
      branchId: "b1",
      createdAt: "2024-04-14",
      paidAt: "2024-04-15",
    },
    {
      id: "pr9",
      userId: "u15",
      period: "2024-W15",
      periodStart: "2024-04-08",
      periodEnd: "2024-04-14",
      baseSalary: 252205, // $2,522.05
      concepts: [
        { id: "c17", name: "IGSS", type: "DEDUCTION", amount: 47132 },
        { id: "c18", name: "ISR", type: "DEDUCTION", amount: 0 },
      ],
      totalEarnings: 252205,
      totalDeductions: 47132,
      netPay: 205073,
      dispersionPayment: 205061,
      effectivePayment: 0,
      status: "PAID",
      branchId: "b1",
      createdAt: "2024-04-14",
      paidAt: "2024-04-15",
    },
    {
      id: "pr10",
      userId: "u16",
      period: "2024-W15",
      periodStart: "2024-04-08",
      periodEnd: "2024-04-14",
      baseSalary: 252205, // $2,522.05
      concepts: [
        { id: "c19", name: "IGSS", type: "DEDUCTION", amount: 47132 },
        { id: "c20", name: "ISR", type: "DEDUCTION", amount: 0 },
      ],
      totalEarnings: 252205,
      totalDeductions: 47132,
      netPay: 205073,
      dispersionPayment: 205061,
      effectivePayment: 0,
      status: "PAID",
      branchId: "b1",
      createdAt: "2024-04-14",
      paidAt: "2024-04-15",
    },
    {
      id: "pr11",
      userId: "u17",
      period: "2024-W15",
      periodStart: "2024-04-08",
      periodEnd: "2024-04-14",
      baseSalary: 252205, // $2,522.05
      concepts: [
        { id: "c21", name: "IGSS", type: "DEDUCTION", amount: 47132 },
        { id: "c22", name: "ISR", type: "DEDUCTION", amount: 0 },
      ],
      totalEarnings: 252205,
      totalDeductions: 47132,
      netPay: 205073,
      dispersionPayment: 205061,
      effectivePayment: 0,
      status: "PAID",
      branchId: "b1",
      createdAt: "2024-04-14",
      paidAt: "2024-04-15",
    },
    {
      id: "pr12",
      userId: "u18",
      period: "2024-W15",
      periodStart: "2024-04-08",
      periodEnd: "2024-04-14",
      baseSalary: 252205, // $2,522.05
      concepts: [
        { id: "c23", name: "IGSS", type: "DEDUCTION", amount: 47132 },
        { id: "c24", name: "ISR", type: "DEDUCTION", amount: 0 },
      ],
      totalEarnings: 252205,
      totalDeductions: 47132,
      netPay: 205073,
      dispersionPayment: 205061,
      effectivePayment: 0,
      status: "PAID",
      branchId: "b1",
      createdAt: "2024-04-14",
      paidAt: "2024-04-15",
    },
    {
      id: "pr13",
      userId: "u19",
      period: "2024-W15",
      periodStart: "2024-04-08",
      periodEnd: "2024-04-14",
      baseSalary: 252205, // $2,522.05
      concepts: [
        { id: "c25", name: "IGSS", type: "DEDUCTION", amount: 47132 },
        { id: "c26", name: "ISR", type: "DEDUCTION", amount: 0 },
      ],
      totalEarnings: 252205,
      totalDeductions: 47132,
      netPay: 205073,
      dispersionPayment: 205061,
      effectivePayment: 0,
      status: "PAID",
      branchId: "b1",
      createdAt: "2024-04-14",
      paidAt: "2024-04-15",
    },
  ],

  clients: [
    {
      id: "c1",
      name: "Juan Pérez",
      phone: "555-0101",
      whatsapp: "555-0101",
      address: "Av. Revolución 123, Col. Centro, Monterrey, N.L.",
      branchId: "b1",
      lastService: "2024-01-15",
      petCount: 2,
    },
    {
      id: "c2",
      name: "María García",
      phone: "555-0102",
      whatsapp: "555-0102",
      address: "Av. Constitución 456, Col. Centro, Monterrey, N.L.",
      branchId: "b1",
      lastService: "2024-01-10",
      petCount: 1,
    },
    {
      id: "c3",
      name: "Carlos López",
      phone: "555-0103",
      whatsapp: "555-0103",
      address: "Av. Lázaro Cárdenas 789, Col. Valle del Mirador, Monterrey, N.L.",
      branchId: "b1",
      lastService: "2024-01-12",
      petCount: 1,
    },
    {
      id: "c4",
      name: "Ana Martínez",
      phone: "555-0104",
      whatsapp: "555-0104",
      address: "Av. San Pedro 321, Col. Valle Oriente, San Pedro Garza García, N.L.",
      branchId: "b1",
      lastService: "2024-01-08",
      petCount: 3,
    },
    {
      id: "c5",
      name: "Roberto Silva",
      phone: "555-0105",
      whatsapp: "555-0105",
      address: "Av. Universidad 1500, Col. Mitras Centro, Monterrey, N.L.",
      branchId: "b1",
      lastService: "2024-01-14",
      petCount: 1,
    },
    {
      id: "c6",
      name: "Laura Morales",
      phone: "555-0106",
      whatsapp: "555-0106",
      address: "Av. Paseo de los Leones 654, Col. Cumbres, Monterrey, N.L.",
      branchId: "b1",
      lastService: "2024-01-11",
      petCount: 2,
    },
    {
      id: "c7",
      name: "Diego Ramírez",
      phone: "555-0107",
      whatsapp: "555-0107",
      address: "Av. Alfonso Reyes 845, Col. Del Valle, Monterrey, N.L.",
      branchId: "b1",
      lastService: "2024-01-09",
      petCount: 1,
    },
    {
      id: "c8",
      name: "Patricia Vega",
      phone: "555-0108",
      whatsapp: "555-0108",
      address: "Av. Eugenio Garza Sada 321, Col. Tecnológico, Monterrey, N.L.",
      branchId: "b1",
      lastService: "2024-01-13",
      petCount: 1,
    },
  ],

  pets: [
    {
      id: "p1",
      name: "Max",
      species: "dog",
      breed: "Golden Retriever",
      age: 3,
      weight: 28,
      allergies: [],
      photo: "/golden-retriever.png",
      clientId: "c1",
      vaccinations: [],
    },
    {
      id: "p2",
      name: "Luna",
      species: "cat",
      breed: "Persa",
      age: 2,
      weight: 4,
      allergies: ["polen"],
      photo: "/fluffy-persian-cat.png",
      clientId: "c1",
      vaccinations: [],
    },
    {
      id: "p3",
      name: "Rocky",
      species: "dog",
      breed: "Bulldog Francés",
      age: 4,
      weight: 12,
      allergies: [],
      photo: "/french-bulldog.png",
      clientId: "c2",
      vaccinations: [],
    },
    {
      id: "p4",
      name: "Mimi",
      species: "cat",
      breed: "Siamés",
      age: 1,
      weight: 3,
      allergies: [],
      photo: "/siamese-cat.png",
      clientId: "c3",
      vaccinations: [],
    },
    {
      id: "p5",
      name: "Bruno",
      species: "dog",
      breed: "Pastor Alemán",
      age: 5,
      weight: 35,
      allergies: ["pollo"],
      photo: "/german-shepherd.png",
      clientId: "c4",
      vaccinations: [],
    },
    {
      id: "p6",
      name: "Coco",
      species: "dog",
      breed: "Poodle",
      age: 2,
      weight: 8,
      allergies: [],
      photo: "/fluffy-white-poodle.png",
      clientId: "c4",
      vaccinations: [],
    },
    {
      id: "p7",
      name: "Nala",
      species: "cat",
      breed: "Maine Coon",
      age: 3,
      weight: 6,
      allergies: [],
      photo: "/maine-coon-cat.png",
      clientId: "c4",
      vaccinations: [],
    },
    {
      id: "p8",
      name: "Toby",
      species: "dog",
      breed: "Beagle",
      age: 4,
      weight: 15,
      allergies: [],
      photo: "/beagle-dog.png",
      clientId: "c5",
      vaccinations: [],
    },
    {
      id: "p9",
      name: "Bella",
      species: "dog",
      breed: "Labrador",
      age: 6,
      weight: 30,
      allergies: [],
      photo: "/labrador-dog.png",
      clientId: "c6",
      vaccinations: [],
    },
    {
      id: "p10",
      name: "Simba",
      species: "cat",
      breed: "Bengalí",
      age: 2,
      weight: 5,
      allergies: [],
      photo: "/bengal-cat.png",
      clientId: "c6",
      vaccinations: [],
    },
    {
      id: "p11",
      name: "Rex",
      species: "dog",
      breed: "Rottweiler",
      age: 3,
      weight: 40,
      allergies: [],
      photo: "/rottweiler-dog.jpg",
      clientId: "c7",
      vaccinations: [],
    },
    {
      id: "p12",
      name: "Whiskers",
      species: "cat",
      breed: "Ragdoll",
      age: 1,
      weight: 4,
      allergies: [],
      photo: "/fluffy-ragdoll.png",
      clientId: "c8",
      vaccinations: [],
    },
  ],

  services: [
    { id: "s1", name: "Baño Completo", type: "grooming", priceCents: 15000, durationMin: 90 },
    { id: "s2", name: "Corte y Peinado", type: "grooming", priceCents: 20000, durationMin: 120 },
    { id: "s3", name: "Consulta General", type: "consulta", priceCents: 25000, durationMin: 30 },
    { id: "s4", name: "Vacuna Múltiple", type: "vacuna", priceCents: 18000, durationMin: 15 },
    { id: "s5", name: "Desparasitación", type: "extra", priceCents: 12000, durationMin: 10 },
    { id: "s6", name: "Limpieza Dental", type: "extra", priceCents: 30000, durationMin: 45 },
  ],

  appointments: [
    {
      id: "a1",
      clientId: "c1",
      petId: "p1",
      serviceId: "s1",
      date: "2024-01-17",
      time: "09:00",
      status: "SCHEDULED",
      branchId: "b1",
    },
    {
      id: "a2",
      clientId: "c2",
      petId: "p3",
      serviceId: "s2",
      date: "2024-01-17",
      time: "10:30",
      status: "IN_PROGRESS",
      branchId: "b1",
    },
    {
      id: "a3",
      clientId: "c3",
      petId: "p4",
      serviceId: "s3",
      date: "2024-01-17",
      time: "11:00",
      status: "SCHEDULED",
      branchId: "b1",
    },
    {
      id: "a4",
      clientId: "c4",
      petId: "p5",
      serviceId: "s4",
      date: "2024-01-17",
      time: "14:00",
      status: "DONE",
      branchId: "b1",
    },
    {
      id: "a5",
      clientId: "c5",
      petId: "p8",
      serviceId: "s1",
      date: "2024-01-17",
      time: "15:30",
      status: "SCHEDULED",
      branchId: "b1",
    },
    {
      id: "a6",
      clientId: "c6",
      petId: "p9",
      serviceId: "s3",
      date: "2024-01-17",
      time: "16:00",
      status: "SCHEDULED",
      branchId: "b1",
    },
    {
      id: "a7",
      clientId: "c7",
      petId: "p11",
      serviceId: "s5",
      date: "2024-01-17",
      time: "17:00",
      status: "SCHEDULED",
      branchId: "b1",
    },
    {
      id: "a8",
      clientId: "c8",
      petId: "p12",
      serviceId: "s2",
      date: "2024-01-17",
      time: "18:00",
      status: "SCHEDULED",
      branchId: "b1",
    },
  ],

  groomingWorkflows: [
    { id: "gw1", petId: "p1", appointmentId: "a1", stage: "reception", startTime: "09:00", photos: {} },
    {
      id: "gw2",
      petId: "p3",
      appointmentId: "a2",
      stage: "bath",
      startTime: "10:30",
      photos: { before: "/dog-before-grooming.jpg" },
    },
  ],

  vaccinations: [
    { id: "v1", petId: "p1", vaccine: "Múltiple DHPP", date: "2023-01-15", dueDate: "2024-01-15", status: "OVERDUE" },
    { id: "v2", petId: "p3", vaccine: "Rabia", date: "2023-06-10", dueDate: "2024-06-10", status: "PENDING" },
    { id: "v3", petId: "p5", vaccine: "Múltiple DHPP", date: "2023-12-01", dueDate: "2024-12-01", status: "PENDING" },
    { id: "v4", petId: "p8", vaccine: "Rabia", date: "2023-08-15", dueDate: "2024-08-15", status: "PENDING" },
    { id: "v5", petId: "p9", vaccine: "Múltiple DHPP", date: "2023-11-20", dueDate: "2024-11-20", status: "PENDING" },
  ],

  inventory: [
    {
      id: "i1",
      sku: "SH001",
      name: "Shampoo Medicado",
      category: "Grooming",
      stock: 5,
      minStock: 10,
      expDate: "2024-12-31",
      lot: "L001",
      branchId: "b1",
    },
    {
      id: "i2",
      sku: "VAC001",
      name: "Vacuna DHPP",
      category: "Biológicos",
      stock: 3,
      minStock: 5,
      expDate: "2024-02-15",
      lot: "V001",
      branchId: "b1",
    },
    {
      id: "i3",
      sku: "MED001",
      name: "Antibiótico Amoxicilina",
      category: "Medicamentos",
      stock: 15,
      minStock: 8,
      expDate: "2024-08-30",
      lot: "M001",
      branchId: "b1",
    },
    {
      id: "i4",
      sku: "ACC001",
      name: "Collar Isabelino",
      category: "Accesorios",
      stock: 20,
      minStock: 15,
      expDate: "2025-12-31",
      lot: "A001",
      branchId: "b1",
    },
    {
      id: "i5",
      sku: "SH002",
      name: "Shampoo Antipulgas",
      category: "Grooming",
      stock: 8,
      minStock: 12,
      expDate: "2024-10-15",
      lot: "L002",
      branchId: "b1",
    },
  ],

  routes: [
    {
      id: "r1",
      zone: "10",
      date: "2024-01-17",
      branchId: "b1",
      stops: [
        {
          id: "rs1",
          order: 1,
          clientId: "c1",
          petId: "p1",
          address: "Av. Revolución 123, Col. Centro, Monterrey, N.L.",
          timeWindow: "08:00-09:00",
          status: "PENDING",
        },
        {
          id: "rs2",
          order: 2,
          clientId: "c2",
          petId: "p3",
          address: "Av. Constitución 456, Col. Centro, Monterrey, N.L.",
          timeWindow: "09:30-10:30",
          status: "PENDING",
        },
        {
          id: "rs3",
          order: 3,
          clientId: "c4",
          petId: "p5",
          address: "Av. San Pedro 321, Col. Valle Oriente, San Pedro Garza García, N.L.",
          timeWindow: "11:00-12:00",
          status: "PENDING",
        },
      ],
    },
    {
      id: "r2",
      zone: "30",
      date: "2024-01-17",
      branchId: "b1",
      stops: [
        {
          id: "rs4",
          order: 1,
          clientId: "c3",
          petId: "p4",
          address: "Av. Lázaro Cárdenas 789, Col. Valle del Mirador, Monterrey, N.L.",
          timeWindow: "14:00-15:00",
          status: "ARRIVED",
        },
        {
          id: "rs5",
          order: 2,
          clientId: "c5",
          petId: "p8",
          address: "Av. Universidad 1500, Col. Mitras Centro, Monterrey, N.L.",
          timeWindow: "15:30-16:30",
          status: "PENDING",
        },
      ],
    },
  ],

  surveys: [
    {
      id: "nps1",
      clientId: "c1",
      nps: 9,
      comment: "Excelente servicio, muy profesionales",
      date: "2024-01-15",
      branchId: "b1",
    },
    {
      id: "nps2",
      clientId: "c2",
      nps: 8,
      comment: "Buen trabajo, mi mascota quedó hermosa",
      date: "2024-01-14",
      branchId: "b1",
    },
    {
      id: "nps3",
      clientId: "c3",
      nps: 10,
      comment: "Perfectos! Siempre cuidan muy bien a Mimi",
      date: "2024-01-13",
      branchId: "b1",
    },
    {
      id: "nps4",
      clientId: "c4",
      nps: 7,
      comment: "Bien en general, podrían mejorar los tiempos",
      date: "2024-01-12",
      branchId: "b1",
    },
  ],

  loans: [
    {
      id: "l1",
      userId: "u7",
      amount: 10000000, // $10,000.00
      weeklyPayment: 1500000, // $1,500.00 por semana
      startDate: "2024-04-08",
      startPeriod: "2024-W15",
      totalWeeks: 7, // 10,000 / 1,500 = 6.67, redondeado a 7 semanas
      interestRate: 10, // 10% porque es en múltiples semanas
      totalAmount: 11000000, // $11,000.00 (10,000 + 10%)
      remainingAmount: 9500000, // $9,500.00 (ya pagó 1 semana)
      paidWeeks: 1,
      status: "ACTIVE",
      branchId: "b1",
      createdAt: "2024-04-08",
      deductions: [
        {
          id: "ld1",
          loanId: "l1",
          payrollRecordId: "pr1",
          period: "2024-W15",
          amount: 1500000,
          date: "2024-04-15",
        },
      ],
    },
    {
      id: "l2",
      userId: "u9",
      amount: 5000000, // $5,000.00
      weeklyPayment: 5000000, // $5,000.00 (pago completo en una semana)
      startDate: "2024-04-10",
      startPeriod: "2024-W15",
      totalWeeks: 1,
      interestRate: 0, // 0% porque se paga en la misma semana
      totalAmount: 5000000, // Sin interés
      remainingAmount: 0,
      paidWeeks: 1,
      status: "PAID",
      branchId: "b1",
      createdAt: "2024-04-10",
      deductions: [
        {
          id: "ld2",
          loanId: "l2",
          payrollRecordId: "pr3",
          period: "2024-W15",
          amount: 5000000,
          date: "2024-04-15",
        },
      ],
    },
    {
      id: "l3",
      userId: "u12",
      amount: 3000000, // $3,000.00
      weeklyPayment: 500000, // $500.00 por semana
      startDate: "2024-04-01",
      startPeriod: "2024-W14",
      totalWeeks: 7, // 3,000 / 500 = 6 semanas + interés = 7 semanas
      interestRate: 10, // 10% porque es en múltiples semanas
      totalAmount: 3300000, // $3,300.00 (3,000 + 10%)
      remainingAmount: 2800000, // $2,800.00 (ya pagó 1 semana)
      paidWeeks: 1,
      status: "ACTIVE",
      branchId: "b1",
      createdAt: "2024-04-01",
      deductions: [
        {
          id: "ld3",
          loanId: "l3",
          payrollRecordId: "pr6",
          period: "2024-W15",
          amount: 500000,
          date: "2024-04-15",
        },
      ],
    },
  ],

  // Actions
  setSelectedBranch: (branchId) => set({ selectedBranch: branchId }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  updateGroomingStage: (workflowId, stage) =>
    set((state) => ({
      groomingWorkflows: state.groomingWorkflows.map((workflow) =>
        workflow.id === workflowId ? { ...workflow, stage } : workflow,
      ),
    })),

  updateRouteStopStatus: (routeId, stopId, status) =>
    set((state) => ({
      routes: state.routes.map((route) =>
        route.id === routeId
          ? {
              ...route,
              stops: route.stops.map((stop) => (stop.id === stopId ? { ...stop, status } : stop)),
            }
          : route,
      ),
    })),

  addClient: (client) =>
    set((state) => ({
      clients: [...state.clients, { ...client, id: `c${Date.now()}` }],
    })),

  updateClient: (id, client) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...client } : c)),
    })),

  addPet: (pet) =>
    set((state) => ({
      pets: [...state.pets, { ...pet, id: `p${Date.now()}` }],
    })),

  updatePet: (id, pet) =>
    set((state) => ({
      pets: state.pets.map((p) => (p.id === id ? { ...p, ...pet } : p)),
    })),

  addLoan: (loan) =>
    set((state) => {
      // Calcular semanas y interés
      const totalWeeks = Math.ceil(loan.amount / loan.weeklyPayment)
      const isMultipleWeeks = totalWeeks > 1
      const interestRate = isMultipleWeeks ? 10 : 0
      const interestAmount = Math.round((loan.amount * interestRate) / 100)
      const totalAmount = loan.amount + interestAmount

      // Obtener el período de inicio
      const startDate = new Date(loan.startDate)
      const year = startDate.getFullYear()
      const week = getWeekNumber(startDate)
      const startPeriod = `${year}-W${week.toString().padStart(2, "0")}`

      return {
        loans: [
          ...state.loans,
          {
            ...loan,
            id: `l${Date.now()}`,
            totalWeeks,
            interestRate,
            totalAmount,
            remainingAmount: totalAmount,
            paidWeeks: 0,
            status: "ACTIVE" as const,
            startPeriod,
            deductions: [],
          },
        ],
      }
    }),
}))
