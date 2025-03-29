"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { BarChart, DollarSign, Users, Calendar, Plus, LogOut, Edit, Ban, CheckCircle, Clock } from "lucide-react"
import {
  type User,
  type License,
  type SupportTicket,
  getUsers,
  getLicenses,
  getTickets,
  addUser,
  addLicense,
  getCurrentUser,
  logout,
  updateUser,
  suspendUser,
  reactivateUser,
  extendUserLicense,
  createTrialUser,
  createPeaoUser,
} from "@/lib/auth"

export default function AdminDashboard() {
  const { toast } = useToast()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [licenses, setLicenses] = useState<License[]>([])
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showAddClient, setShowAddClient] = useState(false)
  const [showAddPeao, setShowAddPeao] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [showExtendLicense, setShowExtendLicense] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    fazendaNome: "",
    planType: "basic" as "trial" | "basic" | "premium",
    duration: 3,
  })

  const [peaoFormData, setpeaoFormData] = useState({
    name: "",
    email: "",
    password: "",
    fazendaId: "",
    peaoId: "",
  })

  const [extendFormData, setExtendFormData] = useState({
    userId: "",
    months: 3,
  })

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "admin") {
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
    setUsers(getUsers().filter((user) => user.role === "client" || user.role === "peao"))
    setLicenses(getLicenses())
    setTickets(getTickets())
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleAddClient = () => {
    try {
      if (!formData.name || !formData.email || !formData.password || !formData.fazendaNome) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        })
        return
      }

      // Verificar se o email já existe
      const existingUser = getUsers().find((u) => u.email === formData.email)
      if (existingUser) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já está sendo utilizado por outro usuário",
          variant: "destructive",
        })
        return
      }

      if (formData.planType === "trial") {
        // Criar usuário de teste
        createTrialUser(
          formData.name,
          formData.email,
          formData.password,
          formData.fazendaNome,
          15, // 15 dias de teste
        )

        toast({
          title: "Cliente de teste adicionado",
          description: `${formData.name} foi cadastrado com período de teste de 15 dias`,
        })
      } else {
        // Calcula a data de expiração
        const startDate = new Date()
        const endDate = new Date()
        endDate.setMonth(endDate.getMonth() + formData.duration) // Duração em meses

        // Cria o usuário
        const newUser = addUser({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          role: "client",
          status: "active",
          expiresAt: endDate.toISOString(),
          lastLogin: null,
          fazendaId: `FAZ${String(users.filter((u) => u.role === "client").length + 1).padStart(3, "0")}`,
          fazendaNome: formData.fazendaNome,
        })

        // Cria a licença
        const price = formData.planType === "basic" ? 500 * formData.duration : 900 * formData.duration

        addLicense({
          userId: newUser.id,
          planType: formData.planType,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          price,
          status: "active",
          paymentStatus: "paid",
          paymentDate: new Date().toISOString(),
          supportHours: formData.planType === "basic" ? 3 * formData.duration : 6 * formData.duration,
          supportHoursUsed: 0,
        })

        toast({
          title: "Cliente adicionado com sucesso",
          description: `${newUser.name} foi cadastrado no sistema`,
        })
      }

      setShowAddClient(false)
      loadData()

      // Limpa o formulário
      setFormData({
        name: "",
        email: "",
        password: "",
        fazendaNome: "",
        planType: "basic",
        duration: 3,
      })
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error)
      toast({
        title: "Erro ao adicionar cliente",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    }
  }

  const handleAddPeao = () => {
    try {
      if (!peaoFormData.name || !peaoFormData.email || !peaoFormData.password || !peaoFormData.fazendaId) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        })
        return
      }

      // Verificar se o email já existe
      const existingUser = getUsers().find((u) => u.email === peaoFormData.email)
      if (existingUser) {
        toast({
          title: "Email já cadastrado",
          description: "Este email já está sendo utilizado por outro usuário",
          variant: "destructive",
        })
        return
      }

      // Encontrar a fazenda
      const fazenda = users.find((u) => u.fazendaId === peaoFormData.fazendaId)
      if (!fazenda) {
        toast({
          title: "Fazenda não encontrada",
          description: "A fazenda selecionada não existe",
          variant: "destructive",
        })
        return
      }

      // Gerar ID do peão
      const peaoId =
        peaoFormData.peaoId || `P${String(users.filter((u) => u.role === "peao").length + 1).padStart(3, "0")}`

      // Criar usuário peão
      const newUser = createPeaoUser(
        peaoFormData.name,
        peaoFormData.email,
        peaoFormData.password,
        fazenda.fazendaId!,
        fazenda.fazendaNome!,
        peaoId,
      )

      toast({
        title: "Peão adicionado com sucesso",
        description: `${newUser.name} foi cadastrado como peão da ${fazenda.fazendaNome}`,
      })

      setShowAddPeao(false)
      loadData()

      // Limpa o formulário
      setpeaoFormData({
        name: "",
        email: "",
        password: "",
        fazendaId: "",
        peaoId: "",
      })
    } catch (error) {
      console.error("Erro ao adicionar peão:", error)
      toast({
        title: "Erro ao adicionar peão",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setShowEditUser(true)
  }

  const handleSuspendUser = (userId: string) => {
    try {
      const success = suspendUser(userId)

      if (success) {
        toast({
          title: "Usuário suspenso",
          description: "O acesso do usuário foi suspenso com sucesso",
        })
        loadData()
      } else {
        toast({
          title: "Erro ao suspender usuário",
          description: "Não foi possível suspender o usuário",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao suspender usuário:", error)
      toast({
        title: "Erro ao suspender usuário",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    }
  }

  const handleReactivateUser = (userId: string) => {
    try {
      const success = reactivateUser(userId, 3) // 3 meses por padrão

      if (success) {
        toast({
          title: "Usuário reativado",
          description: "O acesso do usuário foi reativado com sucesso",
        })
        loadData()
      } else {
        toast({
          title: "Erro ao reativar usuário",
          description: "Não foi possível reativar o usuário",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao reativar usuário:", error)
      toast({
        title: "Erro ao reativar usuário",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    }
  }

  const handleExtendLicense = () => {
    try {
      if (!extendFormData.userId || extendFormData.months <= 0) {
        toast({
          title: "Dados incompletos",
          description: "Selecione um usuário e informe a quantidade de meses",
          variant: "destructive",
        })
        return
      }

      const success = extendUserLicense(extendFormData.userId, extendFormData.months)

      if (success) {
        toast({
          title: "Licença estendida",
          description: `A licença foi estendida por ${extendFormData.months} meses`,
        })
        setShowExtendLicense(false)
        loadData()
      } else {
        toast({
          title: "Erro ao estender licença",
          description: "Não foi possível estender a licença do usuário",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao estender licença:", error)
      toast({
        title: "Erro ao estender licença",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    }
  }

  // Estatísticas
  const activeUsers = users.filter((user) => user.status === "active").length
  const trialUsers = users.filter((user) => user.status === "trial").length
  const expiredUsers = users.filter((user) => user.status === "expired").length

  const totalRevenue = licenses
    .filter((license) => license.paymentStatus === "paid")
    .reduce((total, license) => total + license.price, 0)

  const pendingRevenue = licenses
    .filter((license) => license.paymentStatus === "pending")
    .reduce((total, license) => total + license.price, 0)

  const openTickets = tickets.filter((ticket) => ticket.status !== "closed").length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>

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
                  <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold">R$ {totalRevenue.toLocaleString("pt-BR")}</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <DollarSign size={24} className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Receita Pendente</p>
                  <p className="text-2xl font-bold">R$ {pendingRevenue.toLocaleString("pt-BR")}</p>
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
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <BarChart size={24} className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <Dialog open={showAddClient} onOpenChange={setShowAddClient}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nome do cliente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@cliente.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Senha para acesso"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fazendaNome">Nome da Fazenda</Label>
                  <Input
                    id="fazendaNome"
                    value={formData.fazendaNome}
                    onChange={(e) => setFormData({ ...formData, fazendaNome: e.target.value })}
                    placeholder="Nome da fazenda"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="planType">Tipo de Plano</Label>
                    <Select
                      value={formData.planType}
                      onValueChange={(value: "trial" | "basic" | "premium") =>
                        setFormData({ ...formData, planType: value })
                      }
                    >
                      <SelectTrigger id="planType">
                        <SelectValue placeholder="Selecione o plano" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">Período de Teste (15 dias)</SelectItem>
                        <SelectItem value="basic">Básico (R$ 500/trimestre)</SelectItem>
                        <SelectItem value="premium">Premium (R$ 900/trimestre)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração (meses)</Label>
                    <Select
                      value={formData.duration.toString()}
                      onValueChange={(value) => setFormData({ ...formData, duration: Number.parseInt(value) })}
                      disabled={formData.planType === "trial"}
                    >
                      <SelectTrigger id="duration">
                        <SelectValue placeholder="Selecione a duração" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 meses</SelectItem>
                        <SelectItem value="6">6 meses</SelectItem>
                        <SelectItem value="12">12 meses</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddClient(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddClient}>Adicionar Cliente</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddPeao} onOpenChange={setShowAddPeao}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus size={16} className="mr-2" />
                Novo Peão
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Peão</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="peao-name">Nome</Label>
                    <Input
                      id="peao-name"
                      value={peaoFormData.name}
                      onChange={(e) => setpeaoFormData({ ...peaoFormData, name: e.target.value })}
                      placeholder="Nome do peão"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peao-email">Email</Label>
                    <Input
                      id="peao-email"
                      type="email"
                      value={peaoFormData.email}
                      onChange={(e) => setpeaoFormData({ ...peaoFormData, email: e.target.value })}
                      placeholder="email@peao.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peao-password">Senha</Label>
                  <Input
                    id="peao-password"
                    type="password"
                    value={peaoFormData.password}
                    onChange={(e) => setpeaoFormData({ ...peaoFormData, password: e.target.value })}
                    placeholder="Senha para acesso"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fazendaId">Fazenda</Label>
                  <Select
                    value={peaoFormData.fazendaId}
                    onValueChange={(value) => setpeaoFormData({ ...peaoFormData, fazendaId: value })}
                  >
                    <SelectTrigger id="fazendaId">
                      <SelectValue placeholder="Selecione a fazenda" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u) => u.role === "client" && u.fazendaId)
                        .map((fazenda) => (
                          <SelectItem key={fazenda.fazendaId} value={fazenda.fazendaId!}>
                            {fazenda.fazendaNome} ({fazenda.fazendaId})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peaoId">ID do Peão (opcional)</Label>
                  <Input
                    id="peaoId"
                    value={peaoFormData.peaoId}
                    onChange={(e) => setpeaoFormData({ ...peaoFormData, peaoId: e.target.value })}
                    placeholder="Ex: P001 (gerado automaticamente se vazio)"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddPeao(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddPeao}>Adicionar Peão</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showExtendLicense} onOpenChange={setShowExtendLicense}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Clock size={16} className="mr-2" />
                Estender Licença
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Estender Licença de Cliente</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">Cliente</Label>
                  <Select
                    value={extendFormData.userId}
                    onValueChange={(value) => setExtendFormData({ ...extendFormData, userId: value })}
                  >
                    <SelectTrigger id="userId">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u) => u.role === "client")
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.fazendaNome})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="months">Meses a adicionar</Label>
                  <Select
                    value={extendFormData.months.toString()}
                    onValueChange={(value) => setExtendFormData({ ...extendFormData, months: Number.parseInt(value) })}
                  >
                    <SelectTrigger id="months">
                      <SelectValue placeholder="Selecione a quantidade de meses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 mês</SelectItem>
                      <SelectItem value="3">3 meses</SelectItem>
                      <SelectItem value="6">6 meses</SelectItem>
                      <SelectItem value="12">12 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowExtendLicense(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleExtendLicense}>Estender Licença</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="clients">
          <TabsList className="mb-4">
            <TabsTrigger value="clients">Clientes</TabsTrigger>
            <TabsTrigger value="peoes">Peões</TabsTrigger>
            <TabsTrigger value="licenses">Licenças</TabsTrigger>
            <TabsTrigger value="tickets">Chamados</TabsTrigger>
          </TabsList>

          <TabsContent value="clients">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Clientes</CardTitle>
                <CardDescription>Gerencie os clientes cadastrados no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.filter((u) => u.role === "client").length > 0 ? (
                    <div className="border rounded-md overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-3 text-left">Nome</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Fazenda</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Expira em</th>
                            <th className="p-3 text-left">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users
                            .filter((u) => u.role === "client")
                            .map((user) => (
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
                                          : user.status === "expired"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {user.status === "active"
                                      ? "Ativo"
                                      : user.status === "trial"
                                        ? "Teste"
                                        : user.status === "expired"
                                          ? "Expirado"
                                          : "Suspenso"}
                                  </span>
                                </td>
                                <td className="p-3">
                                  {user.expiresAt ? new Date(user.expiresAt).toLocaleDateString("pt-BR") : "N/A"}
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                                      <Edit size={16} />
                                    </Button>
                                    {user.status === "active" || user.status === "trial" ? (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleSuspendUser(user.id)}
                                        title="Suspender acesso"
                                      >
                                        <Ban size={16} className="text-red-500" />
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleReactivateUser(user.id)}
                                        title="Reativar acesso"
                                      >
                                        <CheckCircle size={16} className="text-green-500" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">Nenhum cliente cadastrado</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="peoes">
            <Card>
              <CardHeader>
                <CardTitle>Lista de Peões</CardTitle>
                <CardDescription>Gerencie os peões cadastrados no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.filter((u) => u.role === "peao").length > 0 ? (
                    <div className="border rounded-md overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-3 text-left">Nome</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Fazenda</th>
                            <th className="p-3 text-left">ID do Peão</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users
                            .filter((u) => u.role === "peao")
                            .map((user) => (
                              <tr key={user.id} className="border-b">
                                <td className="p-3">{user.name}</td>
                                <td className="p-3">{user.email}</td>
                                <td className="p-3">{user.fazendaNome}</td>
                                <td className="p-3">{user.peaoId}</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      user.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {user.status === "active" ? "Ativo" : "Suspenso"}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                                      <Edit size={16} />
                                    </Button>
                                    {user.status === "active" ? (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleSuspendUser(user.id)}
                                        title="Suspender acesso"
                                      >
                                        <Ban size={16} className="text-red-500" />
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleReactivateUser(user.id)}
                                        title="Reativar acesso"
                                      >
                                        <CheckCircle size={16} className="text-green-500" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">Nenhum peão cadastrado</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="licenses">
            <Card>
              <CardHeader>
                <CardTitle>Licenças</CardTitle>
                <CardDescription>Gerencie as licenças e pagamentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {licenses.length > 0 ? (
                    <div className="border rounded-md overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-3 text-left">Cliente</th>
                            <th className="p-3 text-left">Plano</th>
                            <th className="p-3 text-left">Valor</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Pagamento</th>
                            <th className="p-3 text-left">Expira em</th>
                            <th className="p-3 text-left">Dias restantes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {licenses.map((license) => {
                            const user = users.find((u) => u.id === license.userId)
                            const now = new Date()
                            const endDate = new Date(license.endDate)
                            const diffTime = endDate.getTime() - now.getTime()
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

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
                                <td className="p-3">R$ {license.price.toLocaleString("pt-BR")}</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      license.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {license.status === "active" ? "Ativo" : "Expirado"}
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
                                <td className="p-3">{new Date(license.endDate).toLocaleDateString("pt-BR")}</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      diffDays <= 0
                                        ? "bg-red-100 text-red-800"
                                        : diffDays <= 7
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {diffDays <= 0 ? "Expirado" : `${diffDays} dias`}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">Nenhuma licença cadastrada</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Chamados de Suporte</CardTitle>
                <CardDescription>Gerencie os chamados de suporte dos clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.length > 0 ? (
                    <div className="border rounded-md overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="p-3 text-left">Cliente</th>
                            <th className="p-3 text-left">Título</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Prioridade</th>
                            <th className="p-3 text-left">Data</th>
                            <th className="p-3 text-left">Horas</th>
                            <th className="p-3 text-left">Valor</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tickets.map((ticket) => {
                            const user = users.find((u) => u.id === ticket.userId)
                            return (
                              <tr key={ticket.id} className="border-b">
                                <td className="p-3">{user?.name || "N/A"}</td>
                                <td className="p-3">{ticket.title}</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      ticket.status === "open"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : ticket.status === "in-progress"
                                          ? "bg-blue-100 text-blue-800"
                                          : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {ticket.status === "open"
                                      ? "Aberto"
                                      : ticket.status === "in-progress"
                                        ? "Em Progresso"
                                        : "Fechado"}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      ticket.priority === "high"
                                        ? "bg-red-100 text-red-800"
                                        : ticket.priority === "medium"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {ticket.priority === "high"
                                      ? "Alta"
                                      : ticket.priority === "medium"
                                        ? "Média"
                                        : "Baixa"}
                                  </span>
                                </td>
                                <td className="p-3">{new Date(ticket.createdAt).toLocaleDateString("pt-BR")}</td>
                                <td className="p-3">{ticket.hoursSpent}</td>
                                <td className="p-3">R$ {ticket.cost.toLocaleString("pt-BR")}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">Nenhum chamado registrado</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modal de Edição de Usuário */}
      <Dialog open={showEditUser} onOpenChange={setShowEditUser}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input
                    id="edit-name"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password">Nova Senha (deixe em branco para manter a atual)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Nova senha"
                  onChange={(e) => {
                    if (e.target.value) {
                      setSelectedUser({ ...selectedUser, password: e.target.value })
                    }
                  }}
                />
              </div>

              {selectedUser.role === "client" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-fazenda">Nome da Fazenda</Label>
                  <Input
                    id="edit-fazenda"
                    value={selectedUser.fazendaNome || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, fazendaNome: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={selectedUser.status}
                  onValueChange={(value: "active" | "trial" | "expired" | "suspended") =>
                    setSelectedUser({ ...selectedUser, status: value })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="trial">Período de Teste</SelectItem>
                    <SelectItem value="expired">Expirado</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedUser.role === "client" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-expires">Data de Expiração</Label>
                  <Input
                    id="edit-expires"
                    type="date"
                    value={selectedUser.expiresAt ? new Date(selectedUser.expiresAt).toISOString().split("T")[0] : ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedUser({
                          ...selectedUser,
                          expiresAt: new Date(e.target.value).toISOString(),
                        })
                      }
                    }}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowEditUser(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    updateUser(selectedUser)
                    toast({
                      title: "Usuário atualizado",
                      description: "As informações do usuário foram atualizadas com sucesso",
                    })
                    setShowEditUser(false)
                    loadData()
                  }}
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

