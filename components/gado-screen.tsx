"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Search, Plus, MilkIcon as Cow, Camera, X } from "lucide-react"
import { type Animal, getAnimaisByTipo, addAnimal, updateAnimal, getAnimalById } from "@/lib/store"

export function GadoScreen() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [vacas, setVacas] = useState<Animal[]>([])
  const [bezerros, setBezerros] = useState<Animal[]>([])
  const [touros, setTouros] = useState<Animal[]>([])
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [showAnimalForm, setShowAnimalForm] = useState(false)
  const [showReproducaoForm, setShowReproducaoForm] = useState(false)
  const [showAnimalDetails, setShowAnimalDetails] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    tipo: "vaca",
    nome: "",
    idade: "",
    status: "",
    observacoes: "",
  })

  const [reproducaoData, setReproducaoData] = useState({
    vacaId: "",
    tipo: "",
    data: "",
    observacoes: "",
  })

  // Foto capture
  const [foto, setFoto] = useState<string | null>(null)

  useEffect(() => {
    loadAnimais()
  }, [])

  const loadAnimais = () => {
    setVacas(getAnimaisByTipo("vaca"))
    setBezerros(getAnimaisByTipo("bezerro"))
    setTouros(getAnimaisByTipo("touro"))
  }

  const handleAddAnimal = () => {
    try {
      const statusColor =
        formData.status === "Saudável" || formData.status === "Ativo" || formData.status === "Prenha"
          ? "bg-green-500"
          : formData.status === "Doente" || formData.status === "Problema"
            ? "bg-red-500"
            : "bg-yellow-500"

      const newAnimal = addAnimal({
        tipo: formData.tipo as "vaca" | "touro" | "bezerro",
        nome: formData.nome,
        idade: formData.idade,
        status: formData.status,
        statusColor,
        ultimaOcorrencia: `Cadastro (${new Date().toLocaleDateString("pt-BR")})`,
        observacoes: formData.observacoes,
        foto: foto || undefined,
      })

      toast({
        title: "Animal cadastrado com sucesso!",
        description: `${newAnimal.nome} foi adicionado ao rebanho.`,
      })

      loadAnimais()
      setShowAnimalForm(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Erro ao cadastrar animal",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleRegistrarReproducao = () => {
    try {
      if (!reproducaoData.vacaId || !reproducaoData.tipo || !reproducaoData.data) {
        toast({
          title: "Dados incompletos",
          description: "Preencha todos os campos obrigatórios.",
          variant: "destructive",
        })
        return
      }

      const vaca = getAnimalById(reproducaoData.vacaId)

      if (vaca) {
        const updatedVaca: Animal = {
          ...vaca,
          status: "Prenha",
          statusColor: "bg-green-500",
          ultimaOcorrencia: `${reproducaoData.tipo === "natural" ? "Cruzamento" : "Inseminação"} (${new Date(reproducaoData.data).toLocaleDateString("pt-BR")})`,
        }

        updateAnimal(updatedVaca)

        toast({
          title: "Reprodução registrada!",
          description: `${vaca.nome} foi marcada como prenha.`,
        })

        loadAnimais()
        setShowReproducaoForm(false)
        setReproducaoData({
          vacaId: "",
          tipo: "",
          data: "",
          observacoes: "",
        })
      }
    } catch (error) {
      toast({
        title: "Erro ao registrar reprodução",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      tipo: "vaca",
      nome: "",
      idade: "",
      status: "",
      observacoes: "",
    })
    setFoto(null)
  }

  const capturePhoto = () => {
    // Simulação de captura de foto
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.capture = "environment"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = () => {
          setFoto(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }

    input.click()
  }

  const filteredVacas = vacas.filter(
    (vaca) =>
      vaca.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vaca.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredBezerros = bezerros.filter(
    (bezerro) =>
      bezerro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bezerro.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredTouros = touros.filter(
    (touro) =>
      touro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      touro.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const viewAnimalDetails = (animal: Animal) => {
    setSelectedAnimal(animal)
    setShowAnimalDetails(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar animal..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button className="gap-2" onClick={() => setShowAnimalForm(true)}>
          <Plus size={16} />
          <span>Novo Animal</span>
        </Button>
      </div>

      <Tabs defaultValue="vacas">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vacas" className="text-lg py-3">
            Vacas ({vacas.length})
          </TabsTrigger>
          <TabsTrigger value="bezerros" className="text-lg py-3">
            Bezerros ({bezerros.length})
          </TabsTrigger>
          <TabsTrigger value="touros" className="text-lg py-3">
            Touros ({touros.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vacas" className="space-y-4 mt-4">
          {filteredVacas.length > 0 ? (
            filteredVacas.map((vaca) => (
              <AnimalCard key={vaca.id} animal={vaca} onViewDetails={() => viewAnimalDetails(vaca)} />
            ))
          ) : (
            <p className="text-center py-4 text-muted-foreground">Nenhuma vaca encontrada</p>
          )}
        </TabsContent>

        <TabsContent value="bezerros" className="space-y-4 mt-4">
          {filteredBezerros.length > 0 ? (
            filteredBezerros.map((bezerro) => (
              <AnimalCard key={bezerro.id} animal={bezerro} onViewDetails={() => viewAnimalDetails(bezerro)} />
            ))
          ) : (
            <p className="text-center py-4 text-muted-foreground">Nenhum bezerro encontrado</p>
          )}
        </TabsContent>

        <TabsContent value="touros" className="space-y-4 mt-4">
          {filteredTouros.length > 0 ? (
            filteredTouros.map((touro) => (
              <AnimalCard key={touro.id} animal={touro} onViewDetails={() => viewAnimalDetails(touro)} />
            ))
          ) : (
            <p className="text-center py-4 text-muted-foreground">Nenhum touro encontrado</p>
          )}
        </TabsContent>
      </Tabs>

      <Button className="w-full gap-2" variant="outline" onClick={() => setShowReproducaoForm(true)}>
        <span>Registrar Reprodução</span>
      </Button>

      {/* Modal de Cadastro de Animal */}
      <Dialog open={showAnimalForm} onOpenChange={setShowAnimalForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Animal</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Animal</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vaca">Vaca</SelectItem>
                  <SelectItem value="bezerro">Bezerro</SelectItem>
                  <SelectItem value="touro">Touro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome do animal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idade">Idade</Label>
              <Input
                id="idade"
                value={formData.idade}
                onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                placeholder="Ex: 5 anos, 3 meses"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {formData.tipo === "vaca" && (
                    <>
                      <SelectItem value="Prenha">Prenha</SelectItem>
                      <SelectItem value="Não prenha">Não prenha</SelectItem>
                      <SelectItem value="Problema">Problema</SelectItem>
                    </>
                  )}
                  {formData.tipo === "bezerro" && (
                    <>
                      <SelectItem value="Saudável">Saudável</SelectItem>
                      <SelectItem value="Doente">Doente</SelectItem>
                    </>
                  )}
                  {formData.tipo === "touro" && (
                    <>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações sobre o animal"
              />
            </div>

            <div className="space-y-2">
              <Label>Foto</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={capturePhoto} className="gap-2">
                  <Camera size={16} />
                  <span>Tirar Foto</span>
                </Button>

                {foto && (
                  <div className="relative">
                    <img
                      src={foto || "/placeholder.svg"}
                      alt="Foto do animal"
                      className="w-16 h-16 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={() => setFoto(null)}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowAnimalForm(false)
                resetForm()
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleAddAnimal}>Cadastrar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Animal */}
      <Dialog open={showAnimalDetails} onOpenChange={setShowAnimalDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Animal</DialogTitle>
          </DialogHeader>
          {selectedAnimal && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedAnimal.foto ? (
                  <img
                    src={selectedAnimal.foto || "/placeholder.svg"}
                    alt={selectedAnimal.nome}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                    <Cow size={36} className="text-muted-foreground" />
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold">{selectedAnimal.nome}</h3>
                  <p className="text-muted-foreground">{selectedAnimal.id}</p>
                  <div
                    className={`px-2 py-1 rounded-full text-white text-xs font-medium mt-1 inline-block ${selectedAnimal.statusColor}`}
                  >
                    {selectedAnimal.status}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Idade</p>
                  <p className="font-medium">{selectedAnimal.idade}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                  <p className="font-medium">{selectedAnimal.dataCadastro}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Última Ocorrência</p>
                <p className="font-medium">{selectedAnimal.ultimaOcorrencia}</p>
              </div>

              {selectedAnimal.observacoes && (
                <div>
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="font-medium">{selectedAnimal.observacoes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAnimalDetails(false)}>
                  Fechar
                </Button>
                <Button>Editar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Reprodução */}
      <Dialog open={showReproducaoForm} onOpenChange={setShowReproducaoForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Reprodução</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="vaca">Vaca</Label>
              <Select
                value={reproducaoData.vacaId}
                onValueChange={(value) => setReproducaoData({ ...reproducaoData, vacaId: value })}
              >
                <SelectTrigger id="vaca">
                  <SelectValue placeholder="Selecione a vaca" />
                </SelectTrigger>
                <SelectContent>
                  {vacas.map((vaca) => (
                    <SelectItem key={vaca.id} value={vaca.id}>
                      {vaca.nome} ({vaca.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Reprodução</Label>
              <Select
                value={reproducaoData.tipo}
                onValueChange={(value) => setReproducaoData({ ...reproducaoData, tipo: value })}
              >
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="natural">Cruzamento Natural</SelectItem>
                  <SelectItem value="inseminacao">Inseminação Artificial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                type="date"
                id="data"
                value={reproducaoData.data}
                onChange={(e) => setReproducaoData({ ...reproducaoData, data: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={reproducaoData.observacoes}
                onChange={(e) => setReproducaoData({ ...reproducaoData, observacoes: e.target.value })}
                placeholder="Observações sobre a reprodução"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowReproducaoForm(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegistrarReproducao}>Registrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface AnimalCardProps {
  animal: Animal
  onViewDetails: () => void
}

function AnimalCard({ animal, onViewDetails }: AnimalCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {animal.foto ? (
              <img
                src={animal.foto || "/placeholder.svg"}
                alt={animal.nome}
                className="w-10 h-10 object-cover rounded-full"
              />
            ) : (
              <Cow size={36} className="text-primary" />
            )}
            <div>
              <h3 className="text-lg font-bold">
                {animal.nome} <span className="text-sm font-normal text-muted-foreground">({animal.id})</span>
              </h3>
              <p className="text-sm text-muted-foreground">Idade: {animal.idade}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-white text-xs font-medium ${animal.statusColor}`}>
            {animal.status}
          </div>
        </div>
        <div className="mt-4 text-sm">
          <p>
            <strong>Última ocorrência:</strong> {animal.ultimaOcorrencia}
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={onViewDetails}>
            Detalhes
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Saúde
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

