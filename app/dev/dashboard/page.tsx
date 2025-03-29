"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Code, Users, Calendar, AlertTriangle, ArrowRight, LogOut } from "lucide-react"
import {
  type User,
  type License,
  type SupportTicket,
  getUsers,
  getLicenses,
  getTickets,
  updateUser,
  updateLicense,
  getCurrentUser,
  logout,
} from "@/lib/auth"

type UserStatus = "active" | "trial" | "expired" | "suspended"

export default function DevDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [licenses, setLicenses] = useState<License[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [showLicenseDetails, setShowLicenseDetails] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "dev" && user.role !== "admin") {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar esta página",
        variant: "destructive",
      })
      router.push("/dashboard")
      return
    }

    setCurrentUser(user)
    loadData()
  }, [router, toast])

  const loadData = () => {
    setUsers(getUsers().filter((user) => user.role === "client"))
    setLicenses(getLicenses())
    setTickets(getTickets())
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowUserDetails(true)
  }

  const handleViewLicense = (license: License) => {
    setSelectedLicense(license)
    setShowLicenseDetails(true)
  }

  const handleUpdateUserStatus = (status: UserStatus) => {
    if (!selectedUser) return

    const updatedUser = {
      ...selectedUser,
      status,
    }

    updateUser(updatedUser)
    setSelectedUser(updatedUser)
    loadData()

    toast({
      title: "Status atualizado",
      description: `O status do usuário foi alterado para ${status}`,
    })
  }

  const handleUpdateLicenseStatus = (status: "active" | "expired" | "canceled") => {
    if (!selectedLicense) return

    const updatedLicense = {
      ...selectedLicense,
      status,
    }

    updateLicense(updatedLicense)
    setSelectedLicense(updatedLicense)
    loadData()

    // Se a licença for cancelada ou expirada, atualiza o status do usuário
    if (status !== "active") {
      const user = users.find((u) => u.id === selectedLicense.userId)
      if (user) {
        const updatedUser = {
          ...user,
          status: "expired" as UserStatus,
        }
        updateUser(updatedUser)
      }
    } else {
      // Se a licença for ativada, atualiza o status do usuário
      const user = users.find((u) => u.id === selectedLicense.userId)
      if (user) {
        const updatedUser = {
          ...user,
          status: "active" as UserStatus,
        }
        updateUser(updatedUser)
      }
    }

    toast({
      title: "Status atualizado",
      description: `O status da licença foi alterado para ${status}`,
    })
  }

  const handleUpdatePaymentStatus = (paymentStatus: "pending" | "paid" | "refunded") => {
    if (!selectedLicense) return

    const updatedLicense = {
      ...selectedLicense,
      paymentStatus,
    }

    updateLicense(updatedLicense)
    setSelectedLicense(updatedLicense)
    loadData()

    toast({
      title: "Status de pagamento atualizado",
      description: `O status de pagamento foi alterado para ${paymentStatus}`,
    })
  }

  const handleExtendLicense = (months: number) => {
    if (!selectedLicense) return

    const endDate = new Date(selectedLicense.endDate)
    endDate.setMonth(endDate.getMonth() + months)

    const updatedLicense = {
      ...selectedLicense,
      endDate: endDate.toISOString(),
    }

    updateLicense(updatedLicense)
    setSelectedLicense(updatedLicense)
    loadData()

    toast({
      title: "Licença estendida",
      description: `A licença foi estendida por ${months} meses`,
    })
  }

  // Estatísticas
  const activeUsers = users.filter((user) => user.status === "active").length
  const trialUsers = users.filter((user) => user.status === "trial").length
  const expiredUsers = users.filter((user) => user.status === "expired").length

  const activeLicenses = licenses.filter((license) => license.status === "active").length
  const expiringLicenses = licenses.filter((license) => {
    const endDate = new Date(license.endDate)
    const now = new Date()
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return license.status === "active" && diffDays <= 30
  }).length

  const openTickets = tickets.filter((ticket) => ticket.status !== "closed").length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Painel do Desenvolvedor</h1>

          <div className="flex items-center gap-4">
            {currentUser && <span className="text-sm text-muted-foreground">Olá, {currentUser.name}</span>}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Clientes Ativos</p>
                  <p className="text-2xl font-bold">{activeUsers}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {trialUsers} em teste, {expiredUsers} expirados
                  </p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Users size={24} className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Licenças Ativas</p>
                  <p className="text-2xl font-bold">{activeLicenses}</p>
                  <p className="text-xs text-muted-foreground mt-1">{expiringLicenses} expirando em 30 dias</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Code size={24} className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Próximas Expirações</p>
                  <p className="text-2xl font-bold">{expiringLicenses}</p>
                  <p className="text-xs text-muted-foreground mt-1">Nos próximos 30 dias</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Calendar size={24} className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chamados Abertos</p>
                  <p className="text-2xl font-bold">{openTickets}</p>
                  <p className="text-xs text-muted-foreground mt-1">Aguardando atendimento</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <AlertTriangle size={24} className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="licenses">Licenças</TabsTrigger>
            <TabsTrigger value="expiring">Expirando</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>Gerencie os usuários e suas permissões</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length > 0 ? (
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-3 text-left">Nome</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Fazenda</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Criado em</th>
                            <th className="p-3 text-left">Expira em</th>
                            <th className="p-3 text-left">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((user) => (
                            <tr key={user.id} className="border-b">
                              <td className="p-3">{user.name}</td>
                              <td className="p-3">{user.email}</td>
                              <td className="p-3">{user.fazendaNome}</td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    user.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : user.status === "trial"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {user.status === "active" ? "Ativo" : user.status === "trial" ? "Teste" : "Expirado"}
                                </span>
                              </td>
                              <td className="p-3">{new Date(user.createdAt).toLocaleDateString("pt-BR")}</td>
                              <td className="p-3">
                                {user.expiresAt ? new Date(user.expiresAt).toLocaleDateString("pt-BR") : "N/A"}
                              </td>
                              <td className="p-3">
                                <Button variant="ghost" size="sm" onClick={() => handleViewUser(user)}>
                                  <ArrowRight size={16} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">Nenhum usuário encontrado</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="licenses">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Licenças</CardTitle>
                <CardDescription>Gerencie as licenças e suas configurações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {licenses.length > 0 ? (
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-3 text-left">ID</th>
                            <th className="p-3 text-left">Cliente</th>
                            <th className="p-3 text-left">Plano</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Pagamento</th>
                            <th className="p-3 text-left">Início</th>
                            <th className="p-3 text-left">Término</th>
                            <th className="p-3 text-left">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {licenses.map((license) => {
                            const user = users.find((u) => u.id === license.userId)
                            return (
                              <tr key={license.id} className="border-b">
                                <td className="p-3">{license.id}</td>
                                <td className="p-3">{user?.name || "N/A"}</td>
                                <td className="p-3">
                                  {license.planType === "trial"
                                    ? "Teste"
                                    : license.planType === "basic"
                                      ? "Básico"
                                      : "Premium"}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      license.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : license.status === "expired"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {license.status === "active"
                                      ? "Ativo"
                                      : license.status === "expired"
                                        ? "Expirado"
                                        : "Cancelado"}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      license.paymentStatus === "paid"
                                        ? "bg-green-100 text-green-800"
                                        : license.paymentStatus === "pending"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {license.paymentStatus === "paid"
                                      ? "Pago"
                                      : license.paymentStatus === "pending"
                                        ? "Pendente"
                                        : "Reembolsado"}
                                  </span>
                                </td>
                                <td className="p-3">{new Date(license.startDate).toLocaleDateString("pt-BR")}</td>
                                <td className="p-3">{new Date(license.endDate).toLocaleDateString("pt-BR")}</td>
                                <td className="p-3">
                                  <Button variant="ghost" size="sm" onClick={() => handleViewLicense(license)}>
                                    <ArrowRight size={16} />
                                  </Button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">Nenhuma licença encontrada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expiring">
            <Card>
              <CardHeader>
                <CardTitle>Licenças Expirando</CardTitle>
                <CardDescription>Licenças que expiram nos próximos 30 dias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {licenses.filter((license) => {
                    const endDate = new Date(license.endDate)
                    const now = new Date()
                    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    return license.status === "active" && diffDays <= 30
                  }).length > 0 ? (
                    <div className="border rounded-md">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-3 text-left">Cliente</th>
                            <th className="p-3 text-left">Plano</th>
                            <th className="p-3 text-left">Expira em</th>
                            <th className="p-3 text-left">Dias restantes</th>
                            <th className="p-3 text-left">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {licenses
                            .filter((license) => {
                              const endDate = new Date(license.endDate)
                              const now = new Date()
                              const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                              return license.status === "active" && diffDays <= 30
                            })
                            .map((license) => {
                              const user = users.find((u) => u.id === license.userId)
                              const endDate = new Date(license.endDate)
                              const now = new Date()
                              const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                              return (
                                <tr key={license.id} className="border-b">
                                  <td className="p-3">{user?.name || "N/A"}</td>
                                  <td className="p-3">
                                    {license.planType === "trial"
                                      ? "Teste"
                                      : license.planType === "basic"
                                        ? "Básico"
                                        : "Premium"}
                                  </td>
                                  <td className="p-3">{new Date(license.endDate).toLocaleDateString("pt-BR")}</td>
                                  <td className="p-3">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        diffDays <= 7
                                          ? "bg-red-100 text-red-800"
                                          : diffDays <= 15
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      {diffDays} dias
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    <Button variant="ghost" size="sm" onClick={() => handleViewLicense(license)}>
                                      <ArrowRight size={16} />
                                    </Button>
                                  </td>
                                </tr>
                              )
                            })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">
                      Nenhuma licença expirando nos próximos 30 dias
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Detalhes do Usuário */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{selectedUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Fazenda</p>
                  <p className="font-medium">{selectedUser.fazendaNome}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID da Fazenda</p>
                  <p className="font-medium">{selectedUser.fazendaId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Criado em</p>
                  <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expira em</p>
                  <p className="font-medium">
                    {selectedUser.expiresAt ? new Date(selectedUser.expiresAt).toLocaleDateString("pt-BR") : "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.status === "active"
                        ? "bg-green-100 text-green-800"
                        : selectedUser.status === "trial"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedUser.status === "active"
                      ? "Ativo"
                      : selectedUser.status === "trial"
                        ? "Teste"
                        : "Expirado"}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Alterar Status</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedUser.status === "active" ? "default" : "outline"}
                    onClick={() => handleUpdateUserStatus("active")}
                  >
                    Ativar
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedUser.status === "trial" ? "default" : "outline"}
                    onClick={() => handleUpdateUserStatus("trial")}
                  >
                    Teste
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedUser.status === "expired" ? "default" : "outline"}
                    onClick={() => handleUpdateUserStatus("expired")}
                  >
                    Expirar
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedUser.status === "suspended" ? "default" : "outline"}
                    onClick={() => handleUpdateUserStatus("suspended")}
                  >
                    Suspender
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUserDetails(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes da Licença */}
      <Dialog open={showLicenseDetails} onOpenChange={setShowLicenseDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Licença</DialogTitle>
          </DialogHeader>
          {selectedLicense && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">ID da Licença</p>
                  <p className="font-medium">{selectedLicense.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{users.find((u) => u.id === selectedLicense.userId)?.name || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plano</p>
                  <p className="font-medium">
                    {selectedLicense.planType === "trial"
                      ? "Teste"
                      : selectedLicense.planType === "basic"
                        ? "Básico"
                        : "Premium"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-medium">R$ {selectedLicense.price.toLocaleString("pt-BR")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data de Início</p>
                  <p className="font-medium">{new Date(selectedLicense.startDate).toLocaleDateString("pt-BR")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Término</p>
                  <p className="font-medium">{new Date(selectedLicense.endDate).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedLicense.status === "active"
                          ? "bg-green-100 text-green-800"
                          : selectedLicense.status === "expired"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedLicense.status === "active"
                        ? "Ativo"
                        : selectedLicense.status === "expired"
                          ? "Expirado"
                          : "Cancelado"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status de Pagamento</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedLicense.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : selectedLicense.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedLicense.paymentStatus === "paid"
                        ? "Pago"
                        : selectedLicense.paymentStatus === "pending"
                          ? "Pendente"
                          : "Reembolsado"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Alterar Status da Licença</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedLicense.status === "active" ? "default" : "outline"}
                    onClick={() => handleUpdateLicenseStatus("active")}
                  >
                    Ativar
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedLicense.status === "expired" ? "default" : "outline"}
                    onClick={() => handleUpdateLicenseStatus("expired")}
                  >
                    Expirar
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedLicense.status === "canceled" ? "default" : "outline"}
                    onClick={() => handleUpdateLicenseStatus("canceled")}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Alterar Status de Pagamento</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedLicense.paymentStatus === "paid" ? "default" : "outline"}
                    onClick={() => handleUpdatePaymentStatus("paid")}
                  >
                    Pago
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedLicense.paymentStatus === "pending" ? "default" : "outline"}
                    onClick={() => handleUpdatePaymentStatus("pending")}
                  >
                    Pendente
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedLicense.paymentStatus === "refunded" ? "default" : "outline"}
                    onClick={() => handleUpdatePaymentStatus("refunded")}
                  >
                    Reembolsado
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="font-medium mb-2">Estender Licença</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleExtendLicense(1)}>
                    +1 Mês
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExtendLicense(3)}>
                    +3 Meses
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExtendLicense(6)}>
                    +6 Meses
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleExtendLicense(12)}>
                    +1 Ano
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowLicenseDetails(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

