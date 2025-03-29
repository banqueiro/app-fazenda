"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MilkIcon as Cow, AlertTriangle, LineChart, Map } from "lucide-react"

export function HomeScreen() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <Cow size={64} className="text-primary" />
              <h2 className="text-2xl font-bold">Gestão do Gado</h2>
              <p className="text-center text-muted-foreground">
                Registre vacas, touros e bezerros. Acompanhe reprodução e saúde.
              </p>
              <Link href="/gado" className="w-full">
                <Button size="lg" className="w-full text-lg py-6">
                  Acessar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle size={64} className="text-destructive" />
              <h2 className="text-2xl font-bold">Ocorrências</h2>
              <p className="text-center text-muted-foreground">
                Registre problemas na fazenda, cercas quebradas, falta de suprimentos.
              </p>
              <Link href="/ocorrencias" className="w-full">
                <Button size="lg" variant="destructive" className="w-full text-lg py-6">
                  Registrar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <LineChart size={64} className="text-blue-500" />
              <h2 className="text-2xl font-bold">Relatórios</h2>
              <p className="text-center text-muted-foreground">
                Veja estatísticas da fazenda, produtividade e finanças.
              </p>
              <Link href="/admin" className="w-full">
                <Button size="lg" variant="outline" className="w-full text-lg py-6">
                  Ver Relatórios
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-4">
              <Map size={64} className="text-green-500" />
              <h2 className="text-2xl font-bold">Área do Peão</h2>
              <p className="text-center text-muted-foreground">Acesse o mapa da fazenda e registre ocorrências.</p>
              <Link href="/peao" className="w-full">
                <Button size="lg" variant="outline" className="w-full text-lg py-6">
                  Acessar
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

