"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Navigation, Pause, Play } from "lucide-react"
import { updatePeaoLocalizacao, getPeaoById } from "@/lib/store"
import { getCurrentUser } from "@/lib/auth"

export function GPSTracker() {
  const { toast } = useToast()
  const [tracking, setTracking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [watchId, setWatchId] = useState<number | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [trackingTime, setTrackingTime] = useState(0)
  const [trackingDistance, setTrackingDistance] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null)
  const routePointsRef = useRef<Array<{ lat: number; lng: number; timestamp: string }>>([])

  useEffect(() => {
    // Verificar se o navegador suporta geolocalização
    if (!navigator.geolocation) {
      toast({
        title: "Erro",
        description: "Seu dispositivo não suporta geolocalização",
        variant: "destructive",
      })
    } else {
      // Tentar obter a localização inicial
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(newLocation)
          lastLocationRef.current = newLocation
        },
        (error) => {
          console.error("Erro ao obter localização inicial:", error)
          if (error.code === error.PERMISSION_DENIED) {
            setPermissionDenied(true)
            toast({
              title: "Permissão negada",
              description: "Você precisa permitir o acesso à sua localização para usar esta função",
              variant: "destructive",
            })
          }
        },
      )
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [toast])

  const startTracking = () => {
    if (permissionDenied) {
      toast({
        title: "Permissão negada",
        description: "Você precisa permitir o acesso à sua localização nas configurações do seu navegador",
        variant: "destructive",
      })
      return
    }

    if (paused) {
      // Retomar rastreamento pausado
      setPaused(false)

      // Reiniciar o timer
      timerRef.current = setInterval(() => {
        setTrackingTime((prev) => prev + 1)
      }, 1000)

      toast({
        title: "Rastreamento retomado",
        description: "Sua localização está sendo registrada novamente",
      })

      return
    }

    if (navigator.geolocation) {
      try {
        // Resetar dados de rastreamento
        setTrackingTime(0)
        setTrackingDistance(0)
        routePointsRef.current = []

        const id = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }

            setLocation(newLocation)

            // Calcular distância percorrida
            if (lastLocationRef.current) {
              const distance = calculateDistance(
                lastLocationRef.current.lat,
                lastLocationRef.current.lng,
                newLocation.lat,
                newLocation.lng,
              )
              setTrackingDistance((prev) => prev + distance)
            }

            // Atualizar última localização
            lastLocationRef.current = newLocation

            // Adicionar ponto à rota
            const timestamp = new Date().toISOString()
            routePointsRef.current.push({
              ...newLocation,
              timestamp,
            })

            // Enviar localização para o "servidor"
            try {
              // Obter ID do peão logado
              const currentUser = getCurrentUser()
              const peaoId = currentUser?.peaoId || "P001"
              updatePeaoLocalizacao(peaoId, newLocation, routePointsRef.current)
            } catch (error) {
              console.error("Erro ao atualizar localização:", error)
            }
          },
          (error) => {
            console.error("Erro ao rastrear localização:", error)
            if (error.code === error.PERMISSION_DENIED) {
              setPermissionDenied(true)
            }
            toast({
              title: "Erro ao rastrear localização",
              description: error.message,
              variant: "destructive",
            })
            setTracking(false)
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 5000,
          },
        )

        setWatchId(id)
        setTracking(true)

        // Iniciar o timer para contar o tempo de rastreamento
        timerRef.current = setInterval(() => {
          setTrackingTime((prev) => prev + 1)
        }, 1000)

        // Configurar um intervalo para atualizar a localização periodicamente
        // mesmo que o watchPosition não dispare (pode acontecer em alguns dispositivos)
        intervalRef.current = setInterval(() => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const newLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }

              setLocation(newLocation)

              // Calcular distância percorrida
              if (lastLocationRef.current) {
                const distance = calculateDistance(
                  lastLocationRef.current.lat,
                  lastLocationRef.current.lng,
                  newLocation.lat,
                  newLocation.lng,
                )

                // Só adiciona à distância total se for maior que 5 metros
                // para evitar pequenas flutuações de GPS
                if (distance > 0.005) {
                  setTrackingDistance((prev) => prev + distance)

                  // Atualizar última localização
                  lastLocationRef.current = newLocation

                  // Adicionar ponto à rota
                  const timestamp = new Date().toISOString()
                  routePointsRef.current.push({
                    ...newLocation,
                    timestamp,
                  })

                  // Obter ID do peão logado
                  const currentUser = getCurrentUser()
                  const peaoId = currentUser?.peaoId || "P001"
                  updatePeaoLocalizacao(peaoId, newLocation, routePointsRef.current)
                }
              } else {
                lastLocationRef.current = newLocation
              }
            },
            (error) => {
              console.error("Erro ao atualizar localização:", error)
            },
            {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 5000,
            },
          )
        }, 30000) // Atualizar a cada 30 segundos

        toast({
          title: "Rastreamento iniciado",
          description: "Sua localização está sendo registrada",
        })
      } catch (error) {
        console.error("Erro ao iniciar rastreamento:", error)
        toast({
          title: "Erro ao iniciar rastreamento",
          description: "Ocorreu um erro ao tentar rastrear sua localização",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Erro",
        description: "Seu dispositivo não suporta geolocalização",
        variant: "destructive",
      })
    }
  }

  const pauseTracking = () => {
    if (!tracking || paused) return

    setPaused(true)

    // Pausar o timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    toast({
      title: "Rastreamento pausado",
      description: "Sua localização não está sendo registrada temporariamente",
    })
  }

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setTracking(false)
    setPaused(false)

    // Salvar rota final
    if (routePointsRef.current.length > 0) {
      const currentUser = getCurrentUser()
      const peaoId = currentUser?.peaoId || "P001"

      // Obter peão atual
      const peao = getPeaoById(peaoId)
      if (peao) {
        // Atualizar estatísticas do peão
        peao.distanciaPercorrida = (peao.distanciaPercorrida || 0) + trackingDistance
        peao.tempoAtividade = (peao.tempoAtividade || 0) + trackingTime

        // Salvar rota completa
        updatePeaoLocalizacao(
          peaoId,
          lastLocationRef.current || location || { lat: 0, lng: 0 },
          routePointsRef.current,
          true,
        )
      }
    }

    toast({
      title: "Rastreamento finalizado",
      description: `Sua localização não está mais sendo registrada. Distância percorrida: ${trackingDistance.toFixed(2)} km`,
    })
  }

  // Função para calcular a distância entre dois pontos usando a fórmula de Haversine
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Raio da Terra em km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // Distância em km
    return distance
  }

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180)
  }

  // Formatar tempo de rastreamento
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Rastreamento GPS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {permissionDenied && (
            <div className="p-3 bg-red-50 text-red-800 rounded border border-red-200">
              <p className="font-medium">Permissão de localização negada</p>
              <p className="text-sm mt-1">
                Você precisa permitir o acesso à sua localização nas configurações do seu navegador para usar esta
                função.
              </p>
            </div>
          )}

          {location && !permissionDenied && (
            <div className="p-3 bg-muted rounded">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} />
                <span className="font-medium">Sua localização atual:</span>
              </div>
              <p>Latitude: {location.lat.toFixed(6)}</p>
              <p>Longitude: {location.lng.toFixed(6)}</p>
              <p className="text-xs text-muted-foreground mt-2">Atualizado em: {new Date().toLocaleTimeString()}</p>

              {tracking && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="font-medium">Estatísticas de rastreamento:</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Tempo</p>
                      <p className="font-medium">{formatTime(trackingTime)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Distância</p>
                      <p className="font-medium">{trackingDistance.toFixed(2)} km</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {!tracking ? (
              <Button onClick={startTracking} className="w-full gap-2" disabled={permissionDenied}>
                <Navigation size={16} />
                <span>Iniciar Rastreamento</span>
              </Button>
            ) : (
              <>
                {!paused ? (
                  <Button onClick={pauseTracking} variant="outline" className="flex-1 gap-2">
                    <Pause size={16} />
                    <span>Pausar</span>
                  </Button>
                ) : (
                  <Button onClick={startTracking} variant="outline" className="flex-1 gap-2">
                    <Play size={16} />
                    <span>Retomar</span>
                  </Button>
                )}
                <Button onClick={stopTracking} variant="destructive" className="flex-1 gap-2">
                  <Navigation size={16} />
                  <span>Finalizar</span>
                </Button>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center">
            {tracking
              ? paused
                ? "Rastreamento pausado. Clique em Retomar para continuar."
                : "Seu percurso está sendo registrado. Mantenha o aplicativo aberto."
              : "Inicie o rastreamento para registrar seu percurso na fazenda."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

