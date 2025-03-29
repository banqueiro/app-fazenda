"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Camera, X, Image, AlertCircle, Save } from "lucide-react"
import { saveFile } from "@/lib/storage"
import { getCurrentUser } from "@/lib/auth"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface PhotoCaptureProps {
  onPhotoSaved?: (fileId: string) => void
  ocorrenciaId?: string
  animalId?: string
}

export function PhotoCapture({ onPhotoSaved, ocorrenciaId, animalId }: PhotoCaptureProps) {
  const { toast } = useToast()
  const [photo, setPhoto] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const capturePhoto = () => {
    try {
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    } catch (error) {
      console.error("Erro ao abrir câmera:", error)
      toast({
        title: "Erro ao abrir câmera",
        description: "Não foi possível acessar a câmera do dispositivo",
        variant: "destructive",
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Verificar se é uma imagem
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione uma imagem",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setPhoto(reader.result as string)
        setPermissionDenied(false)
        toast({
          title: "Foto capturada",
          description: "A foto foi capturada com sucesso!",
        })

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
      reader.onerror = () => {
        toast({
          title: "Erro ao ler arquivo",
          description: "Não foi possível ler o arquivo selecionado",
          variant: "destructive",
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const clearPhoto = () => {
    setPhoto(null)
    setDescription("")
    setLocation(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const savePhoto = () => {
    if (photo) {
      try {
        const currentUser = getCurrentUser()

        if (!currentUser) {
          toast({
            title: "Erro ao salvar foto",
            description: "Você precisa estar logado para salvar fotos",
            variant: "destructive",
          })
          return
        }

        // Salvar a foto no armazenamento
        const savedFile = saveFile({
          type: "photo",
          data: photo,
          fileName: `photo_${Date.now()}.jpg`,
          mimeType: "image/jpeg",
          createdBy: currentUser.id,
          peaoId: currentUser.peaoId,
          fazendaId: currentUser.fazendaId,
          ocorrenciaId: ocorrenciaId,
          animalId: animalId,
          location: location || undefined,
          metadata: {
            description: description || undefined,
          },
        })

        toast({
          title: "Foto salva",
          description: "Sua foto foi salva com sucesso!",
        })

        // Notificar o componente pai
        if (onPhotoSaved) {
          onPhotoSaved(savedFile.id)
        }

        // Limpar o formulário
        clearPhoto()
      } catch (error) {
        console.error("Erro ao salvar foto:", error)
        toast({
          title: "Erro ao salvar foto",
          description: "Ocorreu um erro ao salvar a foto",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Captura de Foto</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {permissionDenied && (
            <div className="p-3 bg-red-50 text-red-800 rounded border border-red-200 flex items-start gap-2">
              <AlertCircle size={18} className="mt-0.5" />
              <div>
                <p className="font-medium">Permissão de câmera negada</p>
                <p className="text-sm mt-1">
                  Você precisa permitir o acesso à câmera nas configurações do seu navegador para usar esta função.
                </p>
              </div>
            </div>
          )}

          {photo ? (
            <div className="relative">
              <img
                src={photo || "/placeholder.svg"}
                alt="Foto capturada"
                className="w-full h-48 object-cover rounded-md"
              />
              <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={clearPhoto}>
                <X size={16} />
              </Button>

              {location && (
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs p-1 rounded">
                  <p>Lat: {location.lat.toFixed(4)}</p>
                  <p>Lng: {location.lng.toFixed(4)}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-muted h-48 rounded-md flex items-center justify-center">
              <Image size={48} className="text-muted-foreground" />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {photo && (
            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Input
                id="description"
                placeholder="Descreva o que está na foto"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={capturePhoto} className="flex-1 gap-2" disabled={permissionDenied}>
              <Camera size={16} />
              <span>{photo ? "Nova Foto" : "Tirar Foto"}</span>
            </Button>

            {photo && (
              <Button onClick={savePhoto} variant="outline" className="flex-1 gap-2">
                <Save size={16} />
                <span>Salvar Foto</span>
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            {photo
              ? "Revise a foto e salve se estiver satisfeito."
              : "Tire uma foto para registrar uma ocorrência ou problema."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

