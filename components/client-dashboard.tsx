"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Users, Map, Clock, Activity, MilkIcon as Cow, AlertTriangle, Camera, Mic, CheckCircle } from "lucide-react"
import {
  getPeoes,
  getAnimais,
  getOcorrencias,
  getTarefas,
  getEstatisticasPeao,
  type Peao,
  type Animal,
  type Ocorrencia,
  type Tarefa,
} from "@/lib/store"
import { getCurrentUser } from "@/lib/auth"
import { getFilesByPeao } from "@/lib/storage"

export function ClientDashboard() {
  const { toast } = useToast()
  const [peoes, setPeoes] = useState<Peao[]>([])
  const [animais, setAnimais] = useState<Animal[]>([])
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([])
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [selectedPeao, setSelectedPeao] = useState<Peao | null>(null)
  const [showPeaoDetails, setShowPeaoDetails] = useState(false)
  const [showMapDialog, setShowMapDialog] = useState(false)
  const [showMediaDialog, setShowMediaDialog] = useState(false)
  const [mediaType, setMediaType] = useState<"photo" | "audio">("photo")
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [peaoStats, setPeaoStats] = useState<{
    distanciaTotal: number
    tempoAtividade: number
    ocorrenciasRegistradas: number
    tarefasConcluidas: number
  } | null>(null)
  const [peaoMedia, setPeaoMedia] = useState<any[]>([])

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      setCurrentUser(user)
      loadData(user.fazendaId)
    }
  }, [])

  const loadData = (fazendaId?: string) => {
    // Filtrar dados pela fazenda do usuário logado
    if (fazendaId) {
      setPeoes(
        getPeoes().filter((p) => {
          // Verificar se o peão está associado à fazenda do usuário
          const peaoUser = getCurrentUser()
          return peaoUser?.fazendaId === fazendaId
        }),
      )
      setAnimais(getAnimais())
      setOcorrencias(getOcorrencias())
      setTarefas(getTarefas())
    } else {
      setPeoes(getPeoes())
      setAnimais(getAnimais())
      setOcorrencias(getOcorrencias())
      setTarefas(getTarefas())
    }
  }

  const viewPeaoDetails = (peao: Peao) => {
    setSelectedPeao(peao)

    // Carregar estatísticas do peão
    const stats = getEstatisticasPeao(peao.id)
    setPeaoStats(stats)

    setShowPeaoDetails(true)
  }

  const viewPeaoMap = (peao: Peao) => {
    setSelectedPeao(peao)
    setShowMapDialog(true)
  }

  const viewPeaoMedia = (peao: Peao, type: "photo" | "audio") => {
    setSelectedPeao(peao)
    setMediaType(type)

    // Carregar mídia do peão
    const media = getFilesByPeao(peao.id).filter((file) => file.type === type)
    setPeaoMedia(media)

    setShowMediaDialog(true)
  }

  // Estatísticas
  const totalAnimais = animais.length
  const animaisProblema = animais.filter((a) => a.status === "Problema" || a.status === "Doente").length
  const ocorrenciasPendentes = ocorrencias.filter((o) => o.status === "Pendente").length
  const tarefasPendentes = tarefas.filter((t) => t.status === "pendente").length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Peões Ativos</p>
                <p className="text-2xl font-bold">{peoes.filter((p) => p.status === "Ativo").length}</p>
                <p className="text-xs text-muted-foreground mt-1">Total: {peoes.length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Animais</p>
                <p className="text-2xl font-bold">{totalAnimais}</p>
                <p className="text-xs text-muted-foreground mt-1">{animaisProblema} com problemas</p>
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
                <p className="text-sm font-medium text-muted-foreground">Ocorrências</p>
                <p className="text-2xl font-bold">{ocorrenciasPendentes}</p>
                <p className="text-xs text-muted-foreground mt-1">Pendentes</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <AlertTriangle size={24} className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tarefas</p>
                <p className="text-2xl font-bold">{tarefasPendentes}</p>
                <p className="text-xs text-muted-foreground mt-1">Pendentes</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <CheckCircle size={24} className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="peoes">
        <TabsList className="mb-4">
          <TabsTrigger value="peoes">Peões</TabsTrigger>
          <TabsTrigger value="ocorrencias">Ocorrências</TabsTrigger>
          <TabsTrigger value="animais">Animais</TabsTrigger>
          <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
        </TabsList>

        <TabsContent value="peoes">
          <Card>
            <CardHeader>
              <CardTitle>Monitoramento de Peões</CardTitle>
              <CardDescription>Acompanhe a atividade dos peões em tempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {peoes.length > 0 ? (
                  <div className="border rounded-md overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left">Nome</th>
                          <th className="p-3 text-left">Setor</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Última Atualização</th>
                          <th className="p-3 text-left">Ocorrências Hoje</th>
                          <th className="p-3 text-left">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {peoes.map((peao) => (
                          <tr key={peao.id} className="border-b">
                            <td className="p-3">{peao.nome}</td>
                            <td className="p-3">{peao.setor}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${peao.statusColor}`}>
                                {peao.status}
                              </span>
                            </td>
                            <td className="p-3">{peao.ultimaLocalizacao ? peao.ultimaLocalizacao.timestamp : "N/A"}</td>
                            <td className="p-3">{peao.ocorrenciasHoje}</td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => viewPeaoDetails(peao)}
                                  title="Ver detalhes"
                                >
                                  <Activity size={16} />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => viewPeaoMap(peao)} title="Ver mapa">
                                  <Map size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => viewPeaoMedia(peao, "photo")}
                                  title="Ver fotos"
                                >
                                  <Camera size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => viewPeaoMedia(peao, "audio")}
                                  title="Ver áudios"
                                >
                                  <Mic size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">Nenhum peão encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ocorrencias">
          <Card>
            <CardHeader>
              <CardTitle>Ocorrências Recentes</CardTitle>
              <CardDescription>Acompanhe as ocorrências registradas pelos peões</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ocorrencias.length > 0 ? (
                  <div className="border rounded-md overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left">Tipo</th>
                          <th className="p-3 text-left">Descrição</th>
                          <th className="p-3 text-left">Data</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Peão</th>
                          <th className="p-3 text-left">Mídia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ocorrencias.map((ocorrencia) => (
                          <tr key={ocorrencia.id} className="border-b">
                            <td className="p-3">{ocorrencia.tipo}</td>
                            <td className="p-3">{ocorrencia.descricao}</td>
                            <td className="p-3">{ocorrencia.data}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${ocorrencia.statusColor}`}>
                                {ocorrencia.status}
                              </span>
                            </td>
                            <td className="p-3">{ocorrencia.peaoNome || "N/A"}</td>
                            <td className="p-3">
                              <div className="flex gap-1">
                                {ocorrencia.foto && (
                                  <Button variant="ghost" size="icon" title="Ver foto">
                                    <Camera size={16} />
                                  </Button>
                                )}
                                {ocorrencia.audio && (
                                  <Button variant="ghost" size="icon" title="Ouvir áudio">
                                    <Mic size={16} />
                                  </Button>
                                )}
                                {ocorrencia.localizacao && (
                                  <Button variant="ghost" size="icon" title="Ver localização">
                                    <Map size={16} />
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
                  <p className="text-center py-4 text-muted-foreground">Nenhuma ocorrência encontrada</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="animais">
          <Card>
            <CardHeader>
              <CardTitle>Animais</CardTitle>
              <CardDescription>Acompanhe o status dos animais da fazenda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {animais.length > 0 ? (
                  <div className="border rounded-md overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left">ID</th>
                          <th className="p-3 text-left">Nome</th>
                          <th className="p-3 text-left">Tipo</th>
                          <th className="p-3 text-left">Idade</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Última Ocorrência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {animais.map((animal) => (
                          <tr key={animal.id} className="border-b">
                            <td className="p-3">{animal.id}</td>
                            <td className="p-3">{animal.nome}</td>
                            <td className="p-3">
                              {animal.tipo === "vaca"
                                ? "Vaca"
                                : animal.tipo === "touro"
                                  ? "Vaca"
                                  : animal.tipo === "touro"
                                    ? "Touro"
                                    : "Bezerro"}
                            </td>
                            <td className="p-3">{animal.idade}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${animal.statusColor}`}>
                                {animal.status}
                              </span>
                            </td>
                            <td className="p-3">{animal.ultimaOcorrencia}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">Nenhum animal encontrado</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tarefas">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas</CardTitle>
              <CardDescription>Acompanhe as tarefas atribuídas aos peões</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tarefas.length > 0 ? (
                  <div className="border rounded-md overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-3 text-left">Descrição</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Peão</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tarefas.map((tarefa) => {
                          const peao = peoes.find((p) => p.id === tarefa.peaoId)
                          return (
                            <tr key={tarefa.id} className="border-b">
                              <td className="p-3">{tarefa.descricao}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${tarefa.statusColor}`}>
                                  {tarefa.status === "pendente" ? "Pendente" : "Concluída"}
                                </span>
                              </td>
                              <td className="p-3">{peao?.nome || "Não atribuído"}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-4 text-muted-foreground">Nenhuma tarefa encontrada</p>
                )}
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

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Distância</p>
                        <p className="text-xl font-bold">{peaoStats?.distanciaTotal.toFixed(2) || "0"} km</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Map size={20} className="text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tempo Ativo</p>
                        <p className="text-xl font-bold">
                          {peaoStats ? formatTime(peaoStats.tempoAtividade) : "0h 0m"}
                        </p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Clock size={20} className="text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Ocorrências</p>
                        <p className="text-xl font-bold">{peaoStats?.ocorrenciasRegistradas || 0}</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-full">
                        <AlertTriangle size={20} className="text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tarefas Concluídas</p>
                        <p className="text-xl font-bold">{peaoStats?.tarefasConcluidas || 0}</p>
                      </div>
                      <div className="p-2 bg-primary/10 rounded-full">
                        <CheckCircle size={20} className="text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-bold mb-2">Última Localização</h4>
                {selectedPeao.ultimaLocalizacao ? (
                  <div className="p-3 bg-muted rounded">
                    <p>Latitude: {selectedPeao.ultimaLocalizacao.lat.toFixed(6)}</p>
                    <p>Longitude: {selectedPeao.ultimaLocalizacao.lng.toFixed(6)}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Atualizado em: {selectedPeao.ultimaLocalizacao.timestamp}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhuma localização registrada</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPeaoDetails(false)}>
                  Fechar
                </Button>
                <Button onClick={() => viewPeaoMap(selectedPeao)}>Ver no Mapa</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal do Mapa */}
      <Dialog open={showMapDialog} onOpenChange={setShowMapDialog}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Mapa de Rota - {selectedPeao?.nome}</DialogTitle>
          </DialogHeader>
          <div className="h-[500px] bg-muted rounded-md flex items-center justify-center">
            <div className="text-center">
              <Map size={64} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aqui seria exibido o mapa com a rota do peão.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Em um ambiente de produção, seria integrado com Google Maps ou similar.
              </p>
              {selectedPeao && selectedPeao.rota.length > 0 && (
                <div className="mt-4 text-left">
                  <p className="font-medium">Pontos da rota:</p>
                  <div className="max-h-[200px] overflow-y-auto mt-2">
                    {selectedPeao.rota.map((ponto, index) => (
                      <div key={index} className="text-xs p-1 border-b">
                        <p>
                          Lat: {ponto.lat.toFixed(6)}, Lng: {ponto.lng.toFixed(6)}
                        </p>
                        <p className="text-muted-foreground">{ponto.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Mídia */}
      <Dialog open={showMediaDialog} onOpenChange={setShowMediaDialog}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {mediaType === "photo" ? "Fotos" : "Áudios"} - {selectedPeao?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {peaoMedia.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {peaoMedia.map((media) => (
                  <Card key={media.id}>
                    <CardContent className="p-4">
                      {mediaType === "photo" ? (
                        <div>
                          <img
                            src={media.data || "/placeholder.svg"}
                            alt="Foto"
                            className="w-full h-48 object-cover rounded-md"
                          />
                          {media.metadata?.description && <p className="mt-2 text-sm">{media.metadata.description}</p>}
                        </div>
                      ) : (
                        <div>
                          <audio src={media.data} controls className="w-full" />
                          {media.metadata?.description && <p className="mt-2 text-sm">{media.metadata.description}</p>}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">{new Date(media.createdAt).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                Nenhum {mediaType === "photo" ? "foto" : "áudio"} encontrado
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Função auxiliar para formatar tempo
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

