"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GPSTracker } from "@/components/gps-tracker"
import { AudioRecorder } from "@/components/audio-recorder"
import { PhotoCapture } from "@/components/photo-capture"
import Link from "next/link"
import { AlertTriangle, MilkIcon as Cow, ArrowLeft, LogOut } from "lucide-react"
import { isAuthenticated, logout } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function PeaoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!isAuthenticated()) {
      router.push("/login")
    } else {
      setLoading(false)
    }
  }, [router])

  const handleLogout = () => {
    logout()
    router.push("/login")
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
            <h1 className="text-2xl font-bold">Área do Peão</h1>
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="grid gap-6">
          <GPSTracker />

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
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Verificar cercas no pasto norte</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Alimentar bezerros</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span>Verificar vaca doente (ID: V045)</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Consertar cerca quebrada no setor leste</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

