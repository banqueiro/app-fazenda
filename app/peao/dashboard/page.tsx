"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GPSTracker } from "@/components/gps-tracker"
import { AudioRecorder } from "@/components/audio-recorder"
import { PhotoCapture } from "@/components/photo-capture"
import Link from "next/link"
import { AlertTriangle, MilkIcon as Cow, ArrowLeft, LogOut, CheckCircle, Clock } from "lucide-react"
import { isAuthenticated, logout, getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { getTarefasByPeao, updateTarefaStatus, type Tarefa } from "@/lib/store"

export default function PeaoDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [tarefas, setTarefas] = useState<Tarefa[]>([])

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const currentUser = getCurrentUser()
    if (!isAuthenticated() || (currentUser && currentUser.role !== "peao")) {
      router.push("/login")
    } else {
      setUser(currentUser)

      // Carregar tarefas do peão
      if (currentUser.peaoId) {
        const tarefasPeao = getTarefasByPeao(currentUser.peaoId)
        setTarefas(tarefasPeao)
      }

      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleCompletarTarefa = (tarefaId: string) => {
    updateTarefaStatus(tarefaId, "concluida")

    // Atualizar a lista de tarefas
    if (user && user.peaoId) {
      const tarefasAtualizadas = getTarefasByPeao(user.peaoId)
      setTarefas(tarefasAtualizadas)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Painel do Peão</h1>
          </div>

          <div className="flex items-center gap-4">
            {user && <span className="text-sm text-muted-foreground">Olá, {user.name}</span>}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Peão</CardTitle>
                <CardDescription>Seus dados e informações da fazenda</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="font-medium">{user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">ID do Peão</p>
                      <p className="font-medium">{user?.peaoId}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fazenda</p>
                    <p className="font-medium">{user?.fazendaNome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ativo
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <GPSTracker />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AudioRecorder />
            <PhotoCapture />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Registrar Ocorrência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/ocorrencias" className="w-full">
                  <Button className="h-24 text-lg gap-3 w-full" variant="outline">
                    <Cow size={24} />
                    <span>Problema com Animal</span>
                  </Button>
                </Link>

                <Link href="/ocorrencias" className="w-full">
                  <Button className="h-24 text-lg gap-3 w-full" variant="outline">
                    <AlertTriangle size={24} />
                    <span>Problema na Fazenda</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Tarefas de Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              {tarefas.length > 0 ? (
                <ul className="space-y-2">
                  {tarefas.map((tarefa) => (
                    <li key={tarefa.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${tarefa.statusColor}`}></div>
                        <span className={tarefa.status === "concluida" ? "line-through text-muted-foreground" : ""}>
                          {tarefa.descricao}
                        </span>
                      </div>
                      {tarefa.status === "pendente" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCompletarTarefa(tarefa.id)}
                          className="gap-1"
                        >
                          <CheckCircle size={14} />
                          <span>Concluir</span>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock size={12} />
                          Concluída
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-4 text-muted-foreground">Nenhuma tarefa atribuída</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

