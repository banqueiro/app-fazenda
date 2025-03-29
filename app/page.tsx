"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { HomeScreen } from "@/components/home-screen"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut } from "lucide-react"

export default function Home() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Check if we're in the browser
    if (typeof window !== "undefined") {
      // Import auth functions dynamically
      import("@/lib/auth").then((auth) => {
        if (auth.isAuthenticated()) {
          const currentUser = auth.getCurrentUser()
          setUser(currentUser)
          setIsAuthenticated(true)

          // Redirect based on user role
          if (currentUser?.role === "admin") {
            router.push("/admin/dashboard")
          } else if (currentUser?.role === "dev") {
            router.push("/dev/dashboard")
          } else if (currentUser?.role === "client") {
            router.push("/dashboard")
          } else if (currentUser?.role === "peao") {
            router.push("/peao/dashboard")
          }
        }
      })
    }
  }, [router])

  const handleLogout = async () => {
    if (isClient) {
      const auth = await import("@/lib/auth")
      auth.logout()
      setUser(null)
      setIsAuthenticated(false)
      router.push("/login")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Gestão de Fazenda</h1>

          <div className="flex items-center gap-4">
            {isClient && user && (
              <>
                <span className="text-sm text-muted-foreground">Olá, {user.name}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut size={16} className="mr-2" />
                  Sair
                </Button>
              </>
            )}
            {isClient && !isAuthenticated && (
              <Link href="/login">
                <Button>Entrar</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <HomeScreen />
      </div>
    </main>
  )
}

