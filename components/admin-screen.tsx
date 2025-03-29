"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  LineChart,
  BarChart,
  PieChart,
  Map,
  Users,
  DollarSign,
  Truck,
  ShoppingCart,
  Plus,
  Camera,
  Mic,
  MapPin,
} from "lucide-react"
import {
  type Animal,
  type Ocorrencia,
  type Peao,
  type Tarefa,
  type Suprimento,
  getAnimais,
  getOcorrencias,
  getPeoes,
  getTarefas,
  getSuprimentos,
  addSuprimento,
} from "@/lib/store"

export function AdminScreen() {
  const { toast } = useToast()
  const [animais, setAnimais] = useState<Animal[]>([])
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([])
  const [peoes, setPeoes] = useState<Peao[]>([])
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [suprimentos, setSuprimentos] = useState<Suprimento[]>([])
  const [selectedPeao, setSelectedPeao] = useState<Peao | null>(null)
  const [showPeaoDetails, setShowPeaoDetails] = useState(false)
  const [showAddSuprimento, setShowAddSuprimento] = useState(false)

  const [suprimentoForm, setSuprimentoForm] = useState({
    nome: "",
    quantidade: 0,
    unidade: "",
    urgencia: "Normal" as "Normal" | "Importante" | "Urgente",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setAnimais(getAnimais())
    setOcorrencias(getOcorrencias())
    setPeoes(getPeoes())
    setTarefas(getTarefas())
    setSuprimentos(getSuprimentos())
  }

  const handleAddSuprimento = () => {
    try {
      if (!suprimentoForm.nome || suprimentoForm.quantidade <= 0 || !suprimentoForm.unidade) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios.",
          variant: "destructive",
        })
        return
      }

      addSuprimento(suprimentoForm)

      toast({
        title: "Suprimento adicionado",
        description: `${suprimentoForm.nome} foi adicionado à lista de compras.`,
      })

      setSuprimentoForm({
        nome: "",
        quantidade: 0,
        unidade: "",
        urgencia: "Normal",
      })

      setShowAddSuprimento(false)
      loadData()
    } catch (error) {
      toast({
        title: "Erro ao adicionar suprimento",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const viewPeaoDetails = (peao: Peao) => {
    setSelectedPeao(peao)
    setShowPeaoDetails(true)
  }

  // Estatísticas
  const vacasPrenhas = animais.filter((a) => a.tipo === "vaca" && a.status === "Prenha").length
  const totalVacas = animais.filter((a) => a.tipo === "vaca").length
  const percentualPrenhas = totalVacas > 0 ? Math.round((vacasPrenhas / totalVacas) * 100) : 0

  const ocorrenciasPendentes = ocorrencias.filter((o) => o.status === "Pendente").length

  const vendasMensais = 45600 // Valor simulado

  return (
    <div className="space-y-6">
      <Tabs defaultValue="resumo">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resumo" className="text-lg py-3">
            Resumo
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="text-lg py-3">
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="peoes" className="text-lg py-3">
            Peões
          </TabsTrigger>
          <TabsTrigger value="compras" className="text-lg py-3">
            Compras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total de Animais"
              value={animais.length.toString()}
              description={`${animais.filter((a) => a.tipo === "vaca").length} vacas, ${animais.filter((a) => a.tipo === "bezerro").length} bezerros, ${animais.filter((a) => a.tipo === "touro").length} touros`}
              icon={<Cow size={24} />}
            />
            <StatCard
              title="Vacas Prenhas"
              value={vacasPrenhas.toString()}
              description={`${percentualPrenhas}% do rebanho`}
              icon={<Baby size={24} />}
            />
            <StatCard
              title="Ocorrências"
              value={ocorrencias.length.toString()}
              description={`${ocorrenciasPendentes} pendentes`}
              icon={<AlertTriangle size={24} />}
            />
            <StatCard
              title="Vendas"
              value={`R$ ${vendasMensais.toLocaleString("pt-BR")}`}
              description="Último mês"
              icon={<DollarSign size={24} />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição do Rebanho</CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <PieChart size={240} className="text-muted-foreground" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendas Mensais</CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <BarChart size={240} className="text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ocorrências Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ocorrencias.slice(0, 3).map((ocorrencia) => (
                  <div key={ocorrencia.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{ocorrencia.tipo}</p>
                      <p className="text-sm text-muted-foreground">{ocorrencia.descricao}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">{ocorrencia.data}</span>
                        {ocorrencia.peaoNome && (
                          <span className="text-xs text-muted-foreground">por {ocorrencia.peaoNome}</span>
                        )}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-white text-xs font-medium ${ocorrencia.statusColor}`}>
                      {ocorrencia.status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center">
              <LineChart size={240} className="text-muted-foreground" />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Venda de Bezerros</span>
                    <span className="font-bold">R$ 35.000,00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Venda de Vacas</span>
                    <span className="font-bold">R$ 12.000,00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Outros</span>
                    <span className="font-bold">R$ 3.500,00</span>
                  </li>
                  <li className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">R$ 50.500,00</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Ração e Suplementos</span>
                    <span className="font-bold">R$ 12.500,00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Medicamentos</span>
                    <span className="font-bold">R$ 3.200,00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Manutenção</span>
                    <span className="font-bold">R$ 4.800,00</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Salários</span>
                    <span className="font-bold">R$ 8.500,00</span>
                  </li>
                  <li className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">R$ 29.000,00</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="peoes" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento de Peões</CardTitle>
              <CardDescription>Localização e atividades dos peões</CardDescription>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <Map size={320} className="text-muted-foreground" />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Equipe</h2>

            {peoes.map((peao) => (
              <Card key={peao.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Users size={24} className="text-primary" />
                      <div>
                        <h3 className="text-lg font-bold">{peao.nome}</h3>
                        <p className="text-sm text-muted-foreground">{peao.setor}</p>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-white text-xs font-medium ${peao.statusColor}`}>
                      {peao.status}
                    </div>
                  </div>
                  <div className="mt-4 text-sm">
                    {peao.ultimaLocalizacao && (
                      <p>
                        <strong>Última localização:</strong>
                        {peao.ultimaLocalizacao.timestamp}
                      </p>
                    )}
                    <p>
                      <strong>Ocorrências hoje:</strong> {peao.ocorrenciasHoje}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => viewPeaoDetails(peao)}>
                      Ver Detalhes
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Ocorrências
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Contatar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compras" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Compras</CardTitle>
              <CardDescription>Itens necessários para a fazenda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suprimentos.map((suprimento) => (
                  <div key={suprimento.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShoppingCart size={20} className="text-primary" />
                      <span>
                        {suprimento.nome} ({suprimento.quantidade} {suprimento.unidade})
                      </span>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-white text-xs font-medium ${suprimento.urgenciaColor}`}
                    >
                      {suprimento.urgencia}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <Button className="w-full gap-2" onClick={() => setShowAddSuprimento(true)}>
                  <Plus size={16} />
                  <span>Adicionar Item</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fornecedores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck size={20} className="text-primary" />
                    <div>
                      <h3 className="font-bold">Agropecuária Central</h3>
                      <p className="text-sm text-muted-foreground">Ração e suplementos</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Contatar
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck size={20} className="text-primary" />
                    <div>
                      <h3 className="font-bold">Veterinária Rural</h3>
                      <p className="text-sm text-muted-foreground">Medicamentos e vacinas</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Contatar
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck size={20} className="text-primary" />
                    <div>
                      <h3 className="font-bold">Materiais do Campo</h3>
                      <p className="text-sm text-muted-foreground">Cercas e equipamentos</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Contatar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes do Peão */}
      <Dialog open={showPeaoDetails} onOpenChange={setShowPeaoDetails}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Peão</DialogTitle>
          </DialogHeader>
          {selectedPeao && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users size={32} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedPeao.nome}</h3>
                  <p className="text-muted-foreground">{selectedPeao.setor}</p>
                  <div
                    className={`px-2 py-1 rounded-full text-white text-xs font-medium mt-1 inline-block ${selectedPeao.statusColor}`}
                  >
                    {selectedPeao.status}
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rota de Hoje</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <Map size={240} className="text-muted-foreground" />
                </CardContent>
              </Card>

              <div>
                <h4 className="font-bold mb-2">Ocorrências Registradas</h4>
                <div className="space-y-2">
                  {ocorrencias
                    .filter((o) => o.peaoId === selectedPeao.id)
                    .map((ocorrencia) => (
                      <div key={ocorrencia.id} className="p-2 bg-muted rounded">
                        <div className="flex justify-between">
                          <p className="font-medium">{ocorrencia.tipo}</p>
                          <span className="text-xs text-muted-foreground">{ocorrencia.data}</span>
                        </div>
                        <p className="text-sm">{ocorrencia.descricao}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {ocorrencia.audio && (
                            <div className="bg-background p-1 rounded flex items-center gap-1">
                              <Mic size={12} />
                              <span className="text-xs">Áudio</span>
                            </div>
                          )}
                          {ocorrencia.foto && (
                            <div className="bg-background p-1 rounded flex items-center gap-1">
                              <Camera size={12} />
                              <span className="text-xs">Foto</span>
                            </div>
                          )}
                          {ocorrencia.localizacao && (
                            <div className="bg-background p-1 rounded flex items-center gap-1">
                              <MapPin size={12} />
                              <span className="text-xs">Localização</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                  {ocorrencias.filter((o) => o.peaoId === selectedPeao.id).length === 0 && (
                    <p className="text-center py-2 text-muted-foreground">Nenhuma ocorrência registrada</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPeaoDetails(false)}>
                  Fechar
                </Button>
                <Button>Ver Relatório Completo</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Suprimento */}
      <Dialog open={showAddSuprimento} onOpenChange={setShowAddSuprimento}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Item à Lista de Compras</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Item</Label>
              <Input
                id="nome"
                value={suprimentoForm.nome}
                onChange={(e) => setSuprimentoForm({ ...suprimentoForm, nome: e.target.value })}
                placeholder="Ex: Sal Mineral, Ração, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input
                  id="quantidade"
                  type="number"
                  min="1"
                  value={suprimentoForm.quantidade || ""}
                  onChange={(e) =>
                    setSuprimentoForm({ ...suprimentoForm, quantidade: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidade">Unidade</Label>
                <Input
                  id="unidade"
                  value={suprimentoForm.unidade}
                  onChange={(e) => setSuprimentoForm({ ...suprimentoForm, unidade: e.target.value })}
                  placeholder="Ex: kg, sacos, litros"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urgencia">Urgência</Label>
              <Select
                value={suprimentoForm.urgencia}
                onValueChange={(value: "Normal" | "Importante" | "Urgente") =>
                  setSuprimentoForm({ ...suprimentoForm, urgencia: value })
                }
              >
                <SelectTrigger id="urgencia">
                  <SelectValue placeholder="Selecione a urgência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Importante">Importante</SelectItem>
                  <SelectItem value="Urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAddSuprimento(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddSuprimento}>Adicionar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
}

function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function Cow(props: any) {
  return <span {...props}>🐄</span>
}

function Baby(props: any) {
  return <span {...props}>👶</span>
}

function AlertTriangle(props: any) {
  return <span {...props}>⚠️</span>
}

