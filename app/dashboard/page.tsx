"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Calendar, AlertTriangle, Clock, LogOut, Plus, MilkIcon as Cow } from "lucide-react"
import { ClientDashboard } from "@/components/client-dashboard"
import {
  type User,
  type License,
  type SupportTicket,
  getCurrentUser,
  logout,
  getLicenseByUserId,
  getTicketsByUserId,
  getRemainingDays,
  addTicket,
} from "@/lib/auth"

export default function ClientDashboardPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [license, setLicense] = useState<License | null>(null)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [showAddTicket, setShowAddTicket] = useState(false)
  const [remainingDays, setRemainingDays] = useState(0)

  // Form states
  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
  })

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "client") {
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else if (user.role === "dev") {
        router.push("/dev/dashboard")
      } else if (user.role === "peao") {
        router.push("/peao/dashboard")
      }
      return
    }

    setCurrentUser(user)

    if (user) {
      const userLicense = getLicenseByUserId(user.id)
      setLicense(userLicense || null)

      const userTickets = getTicketsByUserId(user.id)
      setTickets(userTickets)

      const days = getRemainingDays(user.id)
      setRemainingDays(days)
    }
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleAddTicket = () => {
    try {
      if (!currentUser) return

      if (!ticketForm.title || !ticketForm.description) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        })
        return
      }

      const newTicket = addTicket({
        userId: currentUser.id,
        title: ticketForm.title,
        description: ticketForm.description,
        priority: ticketForm.priority,
        status: "open",
      })

      setTickets([...tickets, newTicket])

      toast({
        title: "Chamado registrado",
        description: "Seu chamado foi registrado com sucesso",
      })

      setShowAddTicket(false)

      // Limpa o formulário
      setTicketForm({
        title: "",
        description: "",
        priority: "medium",
      })
    } catch (error) {
      toast({
        title: "Erro ao registrar chamado",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Painel do Cliente</h1>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status da Licença</p>
                  <p className="text-2xl font-bold">{license?.status === "active" ? "Ativa" : "Inativa"}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {license?.planType === "trial" ? "Período de teste" : "Licença paga"}
                  </p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <Cow size={24} className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dias Restantes</p>
                  <p className="text-2xl font-bold">{remainingDays}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {license && new Date(license.endDate).toLocaleDateString("pt-BR")}
                  </p>
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
                  <p className="text-2xl font-bold">{tickets.filter((t) => t.status !== "closed").length}</p>
                  <p className="text-xs text-muted-foreground mt-1">{tickets.length} chamados no total</p>
                </div>
                <div className="p-2 bg-primary/10 rounded-full">
                  <AlertTriangle size={24} className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Monitoramento da Fazenda</h2>
          <Dialog open={showAddTicket} onOpenChange={setShowAddTicket}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" />
                Novo Chamado
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Abrir Novo Chamado</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={ticketForm.title}
                    onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                    placeholder="Título do chamado"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    placeholder="Descreva o problema em detalhes"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={ticketForm.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      setTicketForm({ ...ticketForm, priority: value })
                    }
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Selecione a prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddTicket(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddTicket}>Abrir Chamado</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dashboard do Cliente */}
        <ClientDashboard />

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Meus Chamados</CardTitle>
              <CardDescription>Acompanhe o status dos seus chamados de suporte</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.length > 0 ? (
                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left">ID</th>
                          <th className="p-3 text-left">Título</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Prioridade</th>
                          <th className="p-3 text-left">Data</th>
                          <th className="p-3 text-left">Horas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((ticket) => (
                          <tr key={ticket.id} className="border-b">
                            <td className="p-3">{ticket.id}</td>
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
                                {ticket.priority === "high" ? "Alta" : ticket.priority === "medium" ? "Média" : "Baixa"}
                              </span>
                            </td>
                            <td className="p-3">{new Date(ticket.createdAt).toLocaleDateString("pt-BR")}</td>
                            <td className="p-3">{ticket.hoursSpent}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">Nenhum chamado registrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Licença</CardTitle>
              <CardDescription>Detalhes sobre sua licença atual</CardDescription>
            </CardHeader>
            <CardContent>
              {license ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Plano</p>
                      <p className="font-medium">
                        {license.planType === "trial"
                          ? "Período de Teste"
                          : license.planType === "basic"
                            ? "Básico"
                            : "Premium"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">
                        {license.status === "active"
                          ? "Ativo"
                          : license.status === "expired"
                            ? "Expirado"
                            : "Cancelado"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Início</p>
                      <p className="font-medium">{new Date(license.startDate).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Término</p>
                      <p className="font-medium">{new Date(license.endDate).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Horas de Suporte</p>
                      <p className="font-medium">{license.supportHours - license.supportHoursUsed} horas disponíveis</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status de Pagamento</p>
                      <p className="font-medium">
                        {license.paymentStatus === "paid"
                          ? "Pago"
                          : license.paymentStatus === "pending"
                            ? "Pendente"
                            : "Reembolsado"}
                      </p>
                    </div>
                  </div>

                  {remainingDays <= 30 && (
                    <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 mt-4">
                      <div className="flex items-center gap-2">
                        <Clock size={20} className="text-yellow-600" />
                        <p className="font-medium text-yellow-800">Sua licença expira em breve</p>
                      </div>
                      <p className="text-sm text-yellow-700 mt-1">
                        Sua licença expira em {remainingDays} dias. Entre em contato com o suporte para renovar.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">Nenhuma licença encontrada</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

