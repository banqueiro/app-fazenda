// Sistema de armazenamento para arquivos (áudio, fotos, etc.)

// Em um ambiente de produção, esses arquivos seriam armazenados em um serviço como AWS S3,
// Google Cloud Storage ou similar. Para esta demonstração, usaremos localStorage.

// Verificar se estamos no navegador
const isBrowser = typeof window !== "undefined"

export interface StoredFile {
  id: string
  type: "audio" | "photo"
  data: string // Base64 encoded data
  fileName: string
  mimeType: string
  createdAt: string
  createdBy: string // ID do usuário que criou
  peaoId?: string
  fazendaId?: string
  ocorrenciaId?: string
  animalId?: string
  location?: { lat: number; lng: number }
  metadata?: Record<string, any>
}

// Inicializa o armazenamento
const initializeStorage = () => {
  if (!isBrowser) return

  if (!localStorage.getItem("fazenda_files")) {
    localStorage.setItem("fazenda_files", JSON.stringify([]))
  }
}

// Obter todos os arquivos
export const getAllFiles = (): StoredFile[] => {
  if (!isBrowser) return []

  initializeStorage()
  return JSON.parse(localStorage.getItem("fazenda_files") || "[]")
}

// Obter arquivos por tipo
export const getFilesByType = (type: "audio" | "photo"): StoredFile[] => {
  const files = getAllFiles()
  return files.filter((file) => file.type === type)
}

// Obter arquivos por peão
export const getFilesByPeao = (peaoId: string): StoredFile[] => {
  const files = getAllFiles()
  return files.filter((file) => file.peaoId === peaoId)
}

// Obter arquivos por fazenda
export const getFilesByFazenda = (fazendaId: string): StoredFile[] => {
  const files = getAllFiles()
  return files.filter((file) => file.fazendaId === fazendaId)
}

// Obter arquivos por ocorrência
export const getFilesByOcorrencia = (ocorrenciaId: string): StoredFile[] => {
  const files = getAllFiles()
  return files.filter((file) => file.ocorrenciaId === ocorrenciaId)
}

// Obter arquivos por animal
export const getFilesByAnimal = (animalId: string): StoredFile[] => {
  const files = getAllFiles()
  return files.filter((file) => file.animalId === animalId)
}

// Salvar um arquivo
export const saveFile = (file: Omit<StoredFile, "id" | "createdAt">): StoredFile => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const files = getAllFiles()

  const newFile: StoredFile = {
    ...file,
    id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
  }

  localStorage.setItem("fazenda_files", JSON.stringify([...files, newFile]))
  return newFile
}

// Excluir um arquivo
export const deleteFile = (fileId: string): boolean => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const files = getAllFiles()
  const filteredFiles = files.filter((file) => file.id !== fileId)

  if (filteredFiles.length === files.length) {
    return false // Nenhum arquivo foi removido
  }

  localStorage.setItem("fazenda_files", JSON.stringify(filteredFiles))
  return true
}

// Atualizar metadados de um arquivo
export const updateFileMetadata = (fileId: string, metadata: Record<string, any>): boolean => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const files = getAllFiles()
  const fileIndex = files.findIndex((file) => file.id === fileId)

  if (fileIndex === -1) {
    return false
  }

  files[fileIndex] = {
    ...files[fileIndex],
    metadata: {
      ...files[fileIndex].metadata,
      ...metadata,
    },
  }

  localStorage.setItem("fazenda_files", JSON.stringify(files))
  return true
}

// Vincular arquivo a uma ocorrência
export const linkFileToOcorrencia = (fileId: string, ocorrenciaId: string): boolean => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const files = getAllFiles()
  const fileIndex = files.findIndex((file) => file.id === fileId)

  if (fileIndex === -1) {
    return false
  }

  files[fileIndex] = {
    ...files[fileIndex],
    ocorrenciaId,
  }

  localStorage.setItem("fazenda_files", JSON.stringify(files))
  return true
}

// Vincular arquivo a um animal
export const linkFileToAnimal = (fileId: string, animalId: string): boolean => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const files = getAllFiles()
  const fileIndex = files.findIndex((file) => file.id === fileId)

  if (fileIndex === -1) {
    return false
  }

  files[fileIndex] = {
    ...files[fileIndex],
    animalId,
  }

  localStorage.setItem("fazenda_files", JSON.stringify(files))
  return true
}

// Obter um arquivo específico
export const getFileById = (fileId: string): StoredFile | null => {
  const files = getAllFiles()
  const file = files.find((file) => file.id === fileId)
  return file || null
}

