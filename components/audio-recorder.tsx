"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Mic, Square, Save, AlertCircle } from "lucide-react"
import { saveFile } from "@/lib/storage"
import { getCurrentUser } from "@/lib/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AudioRecorderProps {
  onAudioSaved?: (fileId: string) => void
  ocorrenciaId?: string
  animalId?: string
}

export function AudioRecorder({ onAudioSaved, ocorrenciaId, animalId }: AudioRecorderProps) {
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Verificar se o navegador suporta gravação de áudio
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Erro",
        description: "Seu dispositivo não suporta gravação de áudio",
        variant: "destructive",
      })
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [toast])

  const startRecording = async () => {
    audioChunksRef.current = []
    setRecordingTime(0)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const audioUrl = URL.createObjectURL(audioBlob)
        setAudioURL(audioUrl)

        if (timerRef.current) {
          clearInterval(timerRef.current)
        }

        // Obter localização atual
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              })
            },
            (error) => {
              console.error("Erro ao obter localização:", error)
            },
          )
        }
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setPermissionDenied(false)

      // Iniciar o timer para mostrar o tempo de gravação
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)

      toast({
        title: "Gravação iniciada",
        description: "Fale a sua ocorrência...",
      })
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error)

      // Verificar se o erro é de permissão negada
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setPermissionDenied(true)
        toast({
          title: "Permissão negada",
          description: "Você precisa permitir o acesso ao microfone para gravar áudio",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Erro ao iniciar gravação",
          description: "Verifique se o microfone está disponível",
          variant: "destructive",
        })
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()

      // Parar todas as faixas de áudio
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())

      setIsRecording(false)

      toast({
        title: "Gravação finalizada",
        description: "Áudio salvo com sucesso!",
      })
    }
  }

  const saveRecording = () => {
    if (audioURL) {
      try {
        const currentUser = getCurrentUser()

        if (!currentUser) {
          toast({
            title: "Erro ao salvar áudio",
            description: "Você precisa estar logado para salvar áudios",
            variant: "destructive",
          })
          return
        }

        // Converter o audioURL para base64
        fetch(audioURL)
          .then((res) => res.blob())
          .then((blob) => {
            const reader = new FileReader()
            reader.onloadend = () => {
              const base64data = reader.result as string

              // Salvar o áudio no armazenamento
              const savedFile = saveFile({
                type: "audio",
                data: base64data,
                fileName: `audio_${Date.now()}.wav`,
                mimeType: "audio/wav",
                createdBy: currentUser.id,
                peaoId: currentUser.peaoId,
                fazendaId: currentUser.fazendaId,
                ocorrenciaId: ocorrenciaId,
                animalId: animalId,
                location: location || undefined,
                metadata: {
                  description: description || undefined,
                  duration: recordingTime,
                },
              })

              toast({
                title: "Áudio enviado",
                description: "Sua gravação foi salva com sucesso!",
              })

              // Notificar o componente pai
              if (onAudioSaved) {
                onAudioSaved(savedFile.id)
              }

              // Limpar o formulário
              setAudioURL(null)
              setDescription("")
              setLocation(null)
              setRecordingTime(0)
            }
            reader.readAsDataURL(blob)
          })
      } catch (error) {
        console.error("Erro ao salvar áudio:", error)
        toast({
          title: "Erro ao salvar áudio",
          description: "Ocorreu um erro ao salvar o áudio",
          variant: "destructive",
        })
      }
    }
  }

  // Formatar o tempo de gravação
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Gravação de Áudio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {permissionDenied && (
            <div className="p-3 bg-red-50 text-red-800 rounded border border-red-200 flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5" />
              <div>
                <p className="font-medium">Permissão de microfone negada</p>
                <p className="text-sm mt-1">
                  Você precisa permitir o acesso ao microfone nas configurações do seu navegador para usar esta função.
                </p>
              </div>
            </div>
          )}

          {isRecording && (
            <div className="p-3 bg-red-50 text-red-800 rounded border border-red-200 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span className="font-medium">Gravando: {formatTime(recordingTime)}</span>
              </div>
            </div>
          )}

          {audioURL && (
            <div className="p-3 bg-muted rounded">
              <p className="text-sm font-medium mb-2">Áudio gravado:</p>
              <audio src={audioURL} controls className="w-full" />

              {location && (
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>
                    Localização: Lat {location.lat.toFixed(4)}, Lng {location.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          )}

          {audioURL && (
            <div className="space-y-2">
              <Label htmlFor="audio-description">Descrição (opcional)</Label>
              <Input
                id="audio-description"
                placeholder="Descreva o conteúdo do áudio"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-2">
            {isRecording ? (
              <Button onClick={stopRecording} variant="destructive" className="flex-1 gap-2">
                <Square size={16} />
                <span>Parar</span>
              </Button>
            ) : (
              <Button onClick={startRecording} className="flex-1 gap-2" disabled={!!audioURL || permissionDenied}>
                <Mic size={16} />
                <span>Gravar</span>
              </Button>
            )}

            {audioURL && (
              <Button onClick={saveRecording} variant="outline" className="flex-1 gap-2">
                <Save size={16} />
                <span>Salvar</span>
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            {isRecording
              ? "Gravando... Fale claramente."
              : audioURL
                ? "Ouça a gravação e salve se estiver satisfeito."
                : "Grave um áudio para registrar uma ocorrência."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

