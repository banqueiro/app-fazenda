"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Mic, Camera, MapPin, AlertTriangle, CheckCircle, Clock, X } from "lucide-react"
import { type Ocorrencia, getOcorrencias, addOcorrencia, updateOcorrencia } from "@/lib/store"
import { getCurrentUser } from "@/lib/auth"
import { PhotoCapture } from "@/components/photo-capture"
import { AudioRecorder } from "@/components/audio-recorder"
import { linkFileToOcorrencia } from "@/lib/storage"

export function OcorrenciasScreen() {
  const { toast } = useToast()
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([])
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null)
  const [showOcorrenciaDetails, setShowOcorrenciaDetails] = useState(false)
  const [showPhotoCapture, setShowPhotoCapture] = useState(false)
  const [showAudioRecorder, setShowAudioRecorder] = useState(false)

  const [formData, setFormData] = useState({
    tipo: "",
    descricao: "",
  })

  const [capturedPhotoId, setCapturedPhotoId] = useState<string | null>(null)
  const [capturedAudioId, setCapturedAudioId] = useState<string | null>(null)

  useEffect(() => {
    loadOcorrencias()
  }, [])

  const loadOcorrencias = () => {
    setOcorrencias(getOcorrencias())
  }

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          toast({
            title: "Localização obtida",
            description: `Latitude: ${position.coords.latitude.toFixed(4)}, Longitude: ${position.coords.longitude.toFixed(4)}`,
          })
        },
        (error) => {
          toast({
            title: "Erro ao obter localização",
            description: error.message,
            variant: "destructive",
          })
        },
      )
    } else {
      toast({
        title: "Erro",
        description: "Seu dispositivo não suporta geolocalização",
        variant: "destructive",
      })
    }
  }

  const handlePhotoSaved = (fileId: string) => {
    setCapturedPhotoId(fileId)
    setShowPhotoCapture(false)

    toast({
      title: "Foto salva",
      description: "A foto foi vinculada à ocorrência",
    })
  }

  const handleAudioSaved = (fileId: string) => {
    setCapturedAudioId(fileId)
    setShowAudioRecorder(false)

    toast({
      title: "Áudio salvo",
      description: "O áudio foi vinculado à ocorrência",
    })
  }

  const handleSubmitOcorrencia = () => {
    try {
      if (!formData.tipo) {
        toast({
          title: "Tipo de ocorrência obrigatório",
          description: "Selecione o tipo de ocorrência",
          variant: "destructive",
        })
        return
      }

      // Usar descrição do formulário ou texto padrão se estiver vazio
      const descricao = formData.descricao || `Ocorrência registrada em ${new Date().toLocaleString("pt-BR")}`

      // Obter usuário atual
      const currentUser = getCurrentUser()

      const newOcorrencia = addOcorrencia({
        tipo: formData.tipo,
        descricao,
        localizacao: location || undefined,
        peaoId: currentUser?.peaoId || "P001",
        peaoNome: currentUser?.name || "Usuário",
      })

      // Vincular arquivos à ocorrência
      if (capturedPhotoId) {
        linkFileToOcorrencia(capturedPhotoId, newOcorrencia.id)
      }

      if (capturedAudioId) {
        linkFileToOcorrencia(capturedAudioId, newOcorrencia.id)
      }

      toast({
        title: "Ocorrência registrada com sucesso!",
        description: `Ocorrência #${newOcorrencia.id} foi registrada.`,
      })

      // Limpar formulário
      setFormData({
        tipo: "",
        descricao: "",
      })
      setLocation(null)
      setCapturedPhotoId(null)
      setCapturedAudioId(null)

      loadOcorrencias()
    } catch (error) {
      toast({
        title: "Erro ao registrar ocorrência",
        description: "Verifique os dados e tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleMarcarResolvido = (ocorrencia: Ocorrencia) => {
    try {
      const updatedOcorrencia: Ocorrencia = {
        ...ocorrencia,
        status: "Resolvido",
        statusColor: "bg-green-500",
      }

      updateOcorrencia(updatedOcorrencia)

      toast({
        title: "Ocorrência atualizada",
        description: `Ocorrência #${ocorrencia.id} marcada como resolvida.`,
      })

      loadOcorrencias()

      if (selectedOcorrencia?.id === ocorrencia.id) {
        setSelectedOcorrencia(updatedOcorrencia)
      }
    } catch (error) {
      toast({
        title: "Erro ao atualizar ocorrência",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const viewOcorrenciaDetails = (ocorrencia: Ocorrencia) => {
    setSelectedOcorrencia(ocorrencia)
    setShowOcorrenciaDetails(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Nova Ocorrência</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Ocorrência</Label>
              <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger id="tipo">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cerca Danificada">Cerca Danificada</SelectItem>
                  <SelectItem value="Máquina Quebrada">Máquina Quebrada</SelectItem>
                  <SelectItem value="Problema com Animal">Problema com Animal</SelectItem>
                  <SelectItem value="Falta de Suprimento">Falta de Suprimento</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva o problema..."
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Button variant="outline" className="flex-1 gap-2" onClick={() => setShowAudioRecorder(true)}>
                <Mic size={16} />
                <span>Gravar Áudio</span>
              </Button>

              <Button variant="outline" className="flex-1 gap-2" onClick={() => setShowPhotoCapture(true)}>
                <Camera size={16} />
                <span>Tirar Foto</span>
              </Button>

              <Button variant="outline" className="flex-1 gap-2" onClick={handleGetLocation}>
                <MapPin size={16} />
                <span>Localização</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {capturedAudioId && (
                <div className="p-2 bg-muted rounded">
                  <p className="text-xs mb-1 font-medium">Áudio:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Áudio capturado</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setCapturedAudioId(null)}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                </div>
              )}

              {capturedPhotoId && (
                <div className="p-2 bg-muted rounded relative">
                  <p className="text-xs mb-1 font-medium">Foto:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Foto capturada</span>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setCapturedPhotoId(null)}
                    >
                      <X size={12} />
                    </Button>
                  </div>
                </div>
              )}

              {location && (
                <div className="p-2 bg-muted rounded">
                  <p className="text-xs mb-1 font-medium">Localização:</p>
                  <p className="text-xs">Lat: {location.lat.toFixed(4)}</p>
                  <p className="text-xs">Lng: {location.lng.toFixed(4)}</p>
                </div>
              )}
            </div>

            <Button className="w-full" onClick={handleSubmitOcorrencia} disabled={!formData.tipo}>
              Registrar Ocorrência
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Ocorrências Recentes</h2>

        {ocorrencias.length > 0 ? (
          ocorrencias.map((ocorrencia) => (
            <OcorrenciaCard
              key={ocorrencia.id}
              ocorrencia={ocorrencia}
              onViewDetails={() => viewOcorrenciaDetails(ocorrencia)}
              onMarcarResolvido={() => handleMarcarResolvido(ocorrencia)}
            />
          ))
        ) : (
          <p className="text-center py-4 text-muted-foreground">Nenhuma ocorrência registrada</p>
        )}
      </div>

      {/* Modal de Detalhes da Ocorrência */}
      <Dialog open={showOcorrenciaDetails} onOpenChange={setShowOcorrenciaDetails}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes da Ocorrência</DialogTitle>
          </DialogHeader>
          {selectedOcorrencia && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-destructive" />
                <h3 className="text-xl font-bold">{selectedOcorrencia.tipo}</h3>
                <div
                  className={`ml-auto px-2 py-1 rounded-full text-white text-xs font-medium ${selectedOcorrencia.statusColor}`}
                >
                  {selectedOcorrencia.status}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p className="font-medium">{selectedOcorrencia.descricao}</p>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted-foreground" />
                <span>{selectedOcorrencia.data}</span>
              </div>

              {selectedOcorrencia.peaoNome && (
                <div>
                  <p className="text-sm text-muted-foreground">Registrado por</p>
                  <p className="font-medium">{selectedOcorrencia.peaoNome}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedOcorrencia.audio && (
                  <div className="p-2 bg-muted rounded">
                    <p className="text-xs mb-1 font-medium">Áudio:</p>
                    <audio src={selectedOcorrencia.audio} controls className="w-full" />
                  </div>
                )}

                {selectedOcorrencia.foto && (
                  <div className="p-2 bg-muted rounded">
                    <p className="text-xs mb-1 font-medium">Foto:</p>
                    <img
                      src={selectedOcorrencia.foto || "/placeholder.svg"}
                      alt="Foto da ocorrência"
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              {selectedOcorrencia.localizacao && (
                <div className="p-2 bg-muted rounded">
                  <p className="text-xs mb-1 font-medium">Localização:</p>
                  <p>Latitude: {selectedOcorrencia.localizacao.lat.toFixed(6)}</p>
                  <p>Longitude: {selectedOcorrencia.localizacao.lng.toFixed(6)}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowOcorrenciaDetails(false)}>
                  Fechar
                </Button>
                {selectedOcorrencia.status !== "Resolvido" && (
                  <Button
                    onClick={() => {
                      handleMarcarResolvido(selectedOcorrencia)
                      setShowOcorrenciaDetails(false)
                    }}
                  >
                    <CheckCircle size={16} className="mr-2" />
                    Marcar como Resolvido
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Captura de Foto */}
      <Dialog open={showPhotoCapture} onOpenChange={setShowPhotoCapture}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Capturar Foto</DialogTitle>
          </DialogHeader>
          <PhotoCapture onPhotoSaved={handlePhotoSaved} />
        </DialogContent>
      </Dialog>

      {/* Modal de Gravação de Áudio */}
      <Dialog open={showAudioRecorder} onOpenChange={setShowAudioRecorder}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Gravar Áudio</DialogTitle>
          </DialogHeader>
          <AudioRecorder onAudioSaved={handleAudioSaved} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface OcorrenciaCardProps {
  ocorrencia: Ocorrencia
  onViewDetails: () => void
  onMarcarResolvido: () => void
}

function OcorrenciaCard({ ocorrencia, onViewDetails, onMarcarResolvido }: OcorrenciaCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-destructive" />
            <div>
              <h3 className="text-lg font-bold">{ocorrencia.tipo}</h3>
              <p className="text-sm text-muted-foreground">{ocorrencia.descricao}</p>
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-white text-xs font-medium ${ocorrencia.statusColor}`}>
            {ocorrencia.status}
          </div>
        </div>
        <div className="mt-4 text-sm flex items-center gap-2">
          <Clock size={14} />
          <span>{ocorrencia.data}</span>
          {ocorrencia.peaoNome && <span className="text-muted-foreground ml-2">por {ocorrencia.peaoNome}</span>}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {ocorrencia.audio && (
            <div className="bg-muted p-1 rounded flex items-center gap-1">
              <Mic size={12} />
              <span className="text-xs">Áudio</span>
            </div>
          )}
          {ocorrencia.foto && (
            <div className="bg-muted p-1 rounded flex items-center gap-1">
              <Camera size={12} />
              <span className="text-xs">Foto</span>
            </div>
          )}
          {ocorrencia.localizacao && (
            <div className="bg-muted p-1 rounded flex items-center gap-1">
              <MapPin size={12} />
              <span className="text-xs">Localização</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={onViewDetails}>
            Detalhes
          </Button>
          {ocorrencia.status !== "Resolvido" && (
            <Button size="sm" variant="outline" className="flex-1" onClick={onMarcarResolvido}>
              <CheckCircle size={14} className="mr-1" />
              <span>Marcar como Resolvido</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

