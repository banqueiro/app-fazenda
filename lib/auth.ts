// Sistema de autenticação e gerenciamento de usuários

// Verificar se estamos no navegador
const isBrowser = typeof window !== "undefined"

export type UserRole = "admin" | "dev" | "client" | "peao"

export type UserStatus = "active" | "trial" | "expired" | "suspended"

export interface User {
  id: string
  email: string
  name: string
  password: string // Em produção, isso seria um hash
  role: UserRole
  status: UserStatus
  createdAt: string
  expiresAt: string | null
  lastLogin: string | null
  fazendaId?: string
  fazendaNome?: string
  peaoId?: string // ID do peão associado (para usuários peão)
}

export interface License {
  id: string
  userId: string
  planType: "trial" | "basic" | "premium"
  startDate: string
  endDate: string
  price: number
  status: "active" | "expired" | "canceled"
  paymentStatus: "pending" | "paid" | "refunded"
  paymentDate?: string
  supportHours: number
  supportHoursUsed: number
}

export interface SupportTicket {
  id: string
  userId: string
  title: string
  description: string
  status: "open" | "in-progress" | "closed"
  priority: "low" | "medium" | "high"
  createdAt: string
  closedAt?: string
  hoursSpent: number
  cost: number
}

// Dados iniciais para quando estamos no servidor
const usersIniciais: User[] = [
  {
    id: "admin1",
    email: "admin@fazendaapp.com",
    name: "Administrador",
    password: "admin123", // Em produção, isso seria um hash
    role: "admin",
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: null,
    lastLogin: null,
  },
  {
    id: "dev1",
    email: "dev@fazendaapp.com",
    name: "Desenvolvedor",
    password: "dev123", // Em produção, isso seria um hash
    role: "dev",
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: null,
    lastLogin: null,
  },
  {
    id: "client1",
    email: "joao@fazenda.com",
    name: "João da Silva",
    password: "cliente123", // Em produção, isso seria um hash
    role: "client",
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: addMonths(new Date(), 3).toISOString(),
    lastLogin: null,
    fazendaId: "FAZ001",
    fazendaNome: "Fazenda Boa Vista",
  },
  {
    id: "client2",
    email: "maria@fazenda.com",
    name: "Maria Oliveira",
    password: "cliente123", // Em produção, isso seria um hash
    role: "client",
    status: "trial",
    createdAt: new Date().toISOString(),
    expiresAt: addDays(new Date(), 15).toISOString(),
    lastLogin: null,
    fazendaId: "FAZ002",
    fazendaNome: "Fazenda Santa Maria",
  },
  {
    id: "peao1",
    email: "peao@fazenda.com",
    name: "José Pereira",
    password: "peao123", // Em produção, isso seria um hash
    role: "peao",
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: null,
    lastLogin: null,
    fazendaId: "FAZ001",
    fazendaNome: "Fazenda Boa Vista",
    peaoId: "P001",
  },
  {
    id: "admin_fazenda1",
    email: "admin_fazenda@fazenda.com",
    name: "Carlos Administrador",
    password: "admin123", // Em produção, isso seria um hash
    role: "client",
    status: "active",
    createdAt: new Date().toISOString(),
    expiresAt: addMonths(new Date(), 6).toISOString(),
    lastLogin: null,
    fazendaId: "FAZ003",
    fazendaNome: "Fazenda São Carlos",
  },
]

const licensesIniciais: License[] = [
  {
    id: "LIC001",
    userId: "client1",
    planType: "basic",
    startDate: new Date().toISOString(),
    endDate: addMonths(new Date(), 3).toISOString(),
    price: 500,
    status: "active",
    paymentStatus: "paid",
    paymentDate: new Date().toISOString(),
    supportHours: 3,
    supportHoursUsed: 0,
  },
  {
    id: "LIC002",
    userId: "client2",
    planType: "trial",
    startDate: new Date().toISOString(),
    endDate: addDays(new Date(), 15).toISOString(),
    price: 0,
    status: "active",
    paymentStatus: "paid",
    supportHours: 1,
    supportHoursUsed: 0,
  },
  {
    id: "LIC003",
    userId: "admin_fazenda1",
    planType: "premium",
    startDate: new Date().toISOString(),
    endDate: addMonths(new Date(), 6).toISOString(),
    price: 900,
    status: "active",
    paymentStatus: "paid",
    paymentDate: new Date().toISOString(),
    supportHours: 6,
    supportHoursUsed: 1,
  },
]

const ticketsIniciais: SupportTicket[] = [
  {
    id: "TIC001",
    userId: "client1",
    title: "Problema ao cadastrar animal",
    description: "Não consigo adicionar um novo bezerro no sistema.",
    status: "open",
    priority: "medium",
    createdAt: new Date().toISOString(),
    hoursSpent: 0,
    cost: 0,
  },
  {
    id: "TIC002",
    userId: "admin_fazenda1",
    title: "Erro ao gerar relatório",
    description: "O relatório mensal não está sendo gerado corretamente.",
    status: "in-progress",
    priority: "high",
    createdAt: subDays(new Date(), 2).toISOString(),
    hoursSpent: 1.5,
    cost: 150,
  },
]

// Inicializa o armazenamento com dados de exemplo
const initializeAuth = () => {
  if (!isBrowser) return

  // Verifica se já existe dados no localStorage
  if (!localStorage.getItem("fazenda_users")) {
    localStorage.setItem("fazenda_users", JSON.stringify(usersIniciais))
  }

  if (!localStorage.getItem("fazenda_licenses")) {
    localStorage.setItem("fazenda_licenses", JSON.stringify(licensesIniciais))
  }

  if (!localStorage.getItem("fazenda_tickets")) {
    localStorage.setItem("fazenda_tickets", JSON.stringify(ticketsIniciais))
  }
}

// Funções auxiliares para datas
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

function subDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

// Funções para manipular os dados
export const getUsers = (): User[] => {
  if (!isBrowser) return usersIniciais

  initializeAuth()
  return JSON.parse(localStorage.getItem("fazenda_users") || "[]")
}

export const getUserById = (id: string): User | undefined => {
  const users = getUsers()
  return users.find((user) => user.id === id)
}

export const getUserByEmail = (email: string): User | undefined => {
  const users = getUsers()
  return users.find((user) => user.email === email)
}

export const addUser = (user: Omit<User, "id" | "createdAt">): User => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const users = getUsers()
  const newUser: User = {
    ...user,
    id: `user${users.length + 1}`,
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem("fazenda_users", JSON.stringify([...users, newUser]))
  return newUser
}

export const updateUser = (user: User): void => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const users = getUsers()
  const index = users.findIndex((u) => u.id === user.id)

  if (index !== -1) {
    users[index] = user
    localStorage.setItem("fazenda_users", JSON.stringify(users))
  }
}

export const deleteUser = (id: string): void => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const users = getUsers()
  const filteredUsers = users.filter((user) => user.id !== id)
  localStorage.setItem("fazenda_users", JSON.stringify(filteredUsers))
}

export const getLicenses = (): License[] => {
  if (!isBrowser) return licensesIniciais

  initializeAuth()
  return JSON.parse(localStorage.getItem("fazenda_licenses") || "[]")
}

export const getLicenseById = (id: string): License | undefined => {
  const licenses = getLicenses()
  return licenses.find((license) => license.id === id)
}

export const getLicenseByUserId = (userId: string): License | undefined => {
  const licenses = getLicenses()
  return licenses.find((license) => license.userId === userId && license.status === "active")
}

export const addLicense = (license: Omit<License, "id">): License => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const licenses = getLicenses()
  const newLicense: License = {
    ...license,
    id: `LIC${String(licenses.length + 1).padStart(3, "0")}`,
  }

  localStorage.setItem("fazenda_licenses", JSON.stringify([...licenses, newLicense]))
  return newLicense
}

export const updateLicense = (license: License): void => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const licenses = getLicenses()
  const index = licenses.findIndex((l) => l.id === license.id)

  if (index !== -1) {
    licenses[index] = license
    localStorage.setItem("fazenda_licenses", JSON.stringify(licenses))
  }
}

export const getTickets = (): SupportTicket[] => {
  if (!isBrowser) return ticketsIniciais

  initializeAuth()
  return JSON.parse(localStorage.getItem("fazenda_tickets") || "[]")
}

export const getTicketById = (id: string): SupportTicket | undefined => {
  const tickets = getTickets()
  return tickets.find((ticket) => ticket.id === id)
}

export const getTicketsByUserId = (userId: string): SupportTicket[] => {
  const tickets = getTickets()
  return tickets.filter((ticket) => ticket.userId === userId)
}

export const addTicket = (ticket: Omit<SupportTicket, "id" | "createdAt" | "hoursSpent" | "cost">): SupportTicket => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const tickets = getTickets()
  const newTicket: SupportTicket = {
    ...ticket,
    id: `TIC${String(tickets.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
    hoursSpent: 0,
    cost: 0,
  }

  localStorage.setItem("fazenda_tickets", JSON.stringify([...tickets, newTicket]))
  return newTicket
}

export const updateTicket = (ticket: SupportTicket): void => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const tickets = getTickets()
  const index = tickets.findIndex((t) => t.id === ticket.id)

  if (index !== -1) {
    tickets[index] = ticket
    localStorage.setItem("fazenda_tickets", JSON.stringify(tickets))
  }
}

// Funções de autenticação
export const login = (email: string, password: string): User | null => {
  if (!isBrowser) {
    return null
  }

  const user = getUserByEmail(email)

  if (user && user.password === password) {
    // Verificar se o usuário está ativo
    if (user.status === "suspended") {
      return null // Usuário suspenso não pode fazer login
    }

    // Verificar se a licença expirou para clientes
    if (user.role === "client") {
      const now = new Date().toISOString()
      if (user.expiresAt && user.expiresAt < now) {
        // Atualizar status para expirado
        const updatedUser = {
          ...user,
          status: "expired" as UserStatus,
        }
        updateUser(updatedUser)

        // Atualizar licença
        const license = getLicenseByUserId(user.id)
        if (license && license.status === "active") {
          const updatedLicense = {
            ...license,
            status: "expired",
          }
          updateLicense(updatedLicense)
        }

        // Ainda permite login, mas o sistema mostrará mensagem de expiração
      }
    }

    // Atualiza o último login
    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString(),
    }
    updateUser(updatedUser)

    // Salva o usuário na sessão
    localStorage.setItem("fazenda_current_user", JSON.stringify(updatedUser))
    return updatedUser
  }

  return null
}

export const logout = (): void => {
  if (!isBrowser) return

  localStorage.removeItem("fazenda_current_user")
}

export const getCurrentUser = (): User | null => {
  if (!isBrowser) return null

  const userJson = localStorage.getItem("fazenda_current_user")
  if (userJson) {
    return JSON.parse(userJson)
  }
  return null
}

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser()
}

export const hasValidLicense = (userId: string): boolean => {
  const license = getLicenseByUserId(userId)
  if (!license) return false

  const now = new Date().toISOString()
  return license.status === "active" && license.endDate > now
}

export const getRemainingDays = (userId: string): number => {
  const license = getLicenseByUserId(userId)
  if (!license) return 0

  const now = new Date()
  const endDate = new Date(license.endDate)
  const diffTime = endDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays > 0 ? diffDays : 0
}

// Função para criar um usuário de teste
export const createTrialUser = (
  name: string,
  email: string,
  password: string,
  fazendaNome: string,
  trialDays = 15,
): User => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const endDate = addDays(new Date(), trialDays)

  const newUser = addUser({
    email,
    name,
    password,
    role: "client",
    status: "trial",
    expiresAt: endDate.toISOString(),
    lastLogin: null,
    fazendaId: `FAZ${String(getUsers().filter((u) => u.role === "client").length + 1).padStart(3, "0")}`,
    fazendaNome,
  })

  // Criar licença de teste
  addLicense({
    userId: newUser.id,
    planType: "trial",
    startDate: new Date().toISOString(),
    endDate: endDate.toISOString(),
    price: 0,
    status: "active",
    paymentStatus: "paid",
    supportHours: 1,
    supportHoursUsed: 0,
  })

  return newUser
}

// Função para suspender um usuário
export const suspendUser = (userId: string): boolean => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const user = getUserById(userId)
  if (!user) return false

  const updatedUser = {
    ...user,
    status: "suspended" as UserStatus,
  }

  updateUser(updatedUser)

  // Também suspender a licença
  const license = getLicenseByUserId(userId)
  if (license) {
    const updatedLicense = {
      ...license,
      status: "canceled",
    }
    updateLicense(updatedLicense)
  }

  return true
}

// Função para reativar um usuário
export const reactivateUser = (userId: string, expirationMonths = 3): boolean => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const user = getUserById(userId)
  if (!user) return false

  const endDate = addMonths(new Date(), expirationMonths)

  const updatedUser = {
    ...user,
    status: "active" as UserStatus,
    expiresAt: endDate.toISOString(),
  }

  updateUser(updatedUser)

  // Reativar ou criar nova licença
  const license = getLicenses().find((l) => l.userId === userId)

  if (license) {
    const updatedLicense = {
      ...license,
      status: "active",
      endDate: endDate.toISOString(),
      startDate: new Date().toISOString(),
    }
    updateLicense(updatedLicense)
  } else {
    addLicense({
      userId,
      planType: "basic",
      startDate: new Date().toISOString(),
      endDate: endDate.toISOString(),
      price: 500 * expirationMonths,
      status: "active",
      paymentStatus: "paid",
      paymentDate: new Date().toISOString(),
      supportHours: 3 * expirationMonths,
      supportHoursUsed: 0,
    })
  }

  return true
}

// Função para estender a licença de um usuário
export const extendUserLicense = (userId: string, additionalMonths: number): boolean => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const user = getUserById(userId)
  if (!user) return false

  const license = getLicenseByUserId(userId)
  if (!license) return false

  // Calcular nova data de expiração
  const currentEndDate = new Date(license.endDate)
  const newEndDate = addMonths(currentEndDate, additionalMonths)

  // Atualizar usuário
  const updatedUser = {
    ...user,
    expiresAt: newEndDate.toISOString(),
  }
  updateUser(updatedUser)

  // Atualizar licença
  const updatedLicense = {
    ...license,
    endDate: newEndDate.toISOString(),
    price: license.price + 500 * additionalMonths, // Adicionar preço dos meses adicionais
    supportHours: license.supportHours + 3 * additionalMonths, // Adicionar horas de suporte
  }
  updateLicense(updatedLicense)

  return true
}

// Função para criar um usuário peão
export const createPeaoUser = (
  name: string,
  email: string,
  password: string,
  fazendaId: string,
  fazendaNome: string,
  peaoId: string,
): User => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const newUser = addUser({
    email,
    name,
    password,
    role: "peao",
    status: "active",
    expiresAt: null, // Peões não têm data de expiração
    lastLogin: null,
    fazendaId,
    fazendaNome,
    peaoId,
  })

  return newUser
}

