"use client"

import { useState, useEffect } from "react"
import { GadoScreen } from "@/components/gado-screen"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, LogOut } from "lucide-react"
import { isAuthenticated, logout } from "@/lib/auth"
import { useRouter } from "next/navigation"

export default function GadoPage() {
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
            <h1 className="text-2xl font-bold">Gestão do Gado</h1>
          </div>

          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut size={16} className="mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <GadoScreen />
      </div>
    </main>
  )
}

