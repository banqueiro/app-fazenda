"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { login, isAuthenticated } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Verifica se o usuário já está autenticado
    if (isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = login(email, password)

      if (user) {
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo, ${user.name}!`,
        })

        // Redireciona com base no papel do usuário
        if (user.role === "admin") {
          router.push("/admin/dashboard")
        } else if (user.role === "dev") {
          router.push("/dev/dashboard")
        } else if (user.role === "client") {
          router.push("/dashboard")
        } else if (user.role === "peao") {
          router.push("/peao")
        } else {
          router.push("/")
        }
      } else {
        toast({
          title: "Erro de autenticação",
          description: "Email ou senha incorretos",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const setCredentials = (userType: string) => {
    switch (userType) {
      case "admin":
        setEmail("admin@fazendaapp.com")
        setPassword("admin123")
        break
      case "dev":
        setEmail("dev@fazendaapp.com")
        setPassword("dev123")
        break
      case "client":
        setEmail("joao@fazenda.com")
        setPassword("cliente123")
        break
      case "admin_fazenda":
        setEmail("admin_fazenda@fazenda.com")
        setPassword("admin123")
        break
      case "peao":
        setEmail("peao@fazenda.com")
        setPassword("peao123")
        break
      default:
        break
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40">
      <div className="w-full max-w-md p-4">
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <span className="text-3xl text-white">🐄</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Gestão de Fazenda</CardTitle>
            <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <a href="#" className="text-sm text-primary hover:underline">
                      Esqueceu a senha?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="w-full">
              <Tabs defaultValue="admin">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                  <TabsTrigger value="client">Cliente</TabsTrigger>
                  <TabsTrigger value="peao">Peão</TabsTrigger>
                </TabsList>
                <TabsContent value="admin" className="space-y-2 mt-2">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">Administrador do Sistema</p>
                    <p>Gerencia usuários, licenças e suporte</p>
                    <div className="flex justify-between mt-2">
                      <div>
                        <p>
                          <strong>Email:</strong> admin@fazendaapp.com
                        </p>
                        <p>
                          <strong>Senha:</strong> admin123
                        </p>
                      </div>
                      <Button size="sm" onClick={() => setCredentials("admin")}>
                        Usar
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                    <p className="font-medium">Desenvolvedor</p>
                    <p>Acesso técnico ao sistema</p>
                    <div className="flex justify-between mt-2">
                      <div>
                        <p>
                          <strong>Email:</strong> dev@fazendaapp.com
                        </p>
                        <p>
                          <strong>Senha:</strong> dev123
                        </p>
                      </div>
                      <Button size="sm" onClick={() => setCredentials("dev")}>
                        Usar
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="client" className="space-y-2 mt-2">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">Cliente Padrão</p>
                    <p>Acesso à gestão da fazenda</p>
                    <div className="flex justify-between mt-2">
                      <div>
                        <p>
                          <strong>Email:</strong> joao@fazenda.com
                        </p>
                        <p>
                          <strong>Senha:</strong> cliente123
                        </p>
                      </div>
                      <Button size="sm" onClick={() => setCredentials("client")}>
                        Usar
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                    <p className="font-medium">Administrador de Fazenda</p>
                    <p>Acesso completo à gestão da fazenda</p>
                    <div className="flex justify-between mt-2">
                      <div>
                        <p>
                          <strong>Email:</strong> admin_fazenda@fazenda.com
                        </p>
                        <p>
                          <strong>Senha:</strong> admin123
                        </p>
                      </div>
                      <Button size="sm" onClick={() => setCredentials("admin_fazenda")}>
                        Usar
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="peao" className="space-y-2 mt-2">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">Peão</p>
                    <p>Acesso às funcionalidades de campo</p>
                    <div className="flex justify-between mt-2">
                      <div>
                        <p>
                          <strong>Email:</strong> peao@fazenda.com
                        </p>
                        <p>
                          <strong>Senha:</strong> peao123
                        </p>
                      </div>
                      <Button size="sm" onClick={() => setCredentials("peao")}>
                        Usar
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

