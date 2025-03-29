// Biblioteca simples para armazenamento de dados usando localStorage
// Isso permite que o aplicativo funcione sem um backend real

export type Animal = {
  id: string
  tipo: "vaca" | "touro" | "bezerro"
  nome: string
  idade: string
  status: string
  statusColor: string
  ultimaOcorrencia: string
  dataCadastro: string
  foto?: string
  observacoes?: string
}

export type Ocorrencia = {
  id: string
  tipo: string
  descricao: string
  data: string
  status: "Pendente" | "Em andamento" | "Resolvido"
  statusColor: string
  localizacao?: { lat: number; lng: number }
  audio?: string
  foto?: string
  peaoId?: string
  peaoNome?: string
}

export type Peao = {
  id: string
  nome: string
  setor: string
  status: "Ativo" | "Em pausa" | "Inativo"
  statusColor: string
  ultimaLocalizacao?: { lat: number; lng: number; timestamp: string }
  rota: Array<{ lat: number; lng: number; timestamp: string }>
  ocorrenciasHoje: number
  distanciaPercorrida?: number // em km
  tempoAtividade?: number // em segundos
  fotosRegistradas?: number
  audiosRegistrados?: number
  tarefasConcluidas?: number
  tarefasPendentes?: number
}

export type Tarefa = {
  id: string
  descricao: string
  status: "pendente" | "concluida"
  statusColor: string
  peaoId?: string
}

export type Suprimento = {
  id: string
  nome: string
  quantidade: number
  unidade: string
  urgencia: "Urgente" | "Importante" | "Normal"
  urgenciaColor: string
}

// Verificar se estamos no navegador
const isBrowser = typeof window !== "undefined"

// Dados iniciais para quando estamos no servidor
const animaisIniciais: Animal[] = [
  {
    id: "V001",
    tipo: "vaca",
    nome: "Mimosa",
    idade: "5 anos",
    status: "Prenha",
    statusColor: "bg-green-500",
    ultimaOcorrencia: "Inseminação (15/03/2025)",
    dataCadastro: "10/01/2023",
    observacoes: "Boa produtora, segunda gestação",
  },
  {
    id: "V002",
    tipo: "vaca",
    nome: "Malhada",
    idade: "7 anos",
    status: "Não prenha",
    statusColor: "bg-yellow-500",
    ultimaOcorrencia: "Tentativa de cruzamento (10/02/2025)",
    dataCadastro: "05/03/2022",
    observacoes: "Dificuldade para engravidar",
  },
  {
    id: "V003",
    tipo: "vaca",
    nome: "Pintada",
    idade: "8 anos",
    status: "Problema",
    statusColor: "bg-red-500",
    ultimaOcorrencia: "Não engravida há 2 anos",
    dataCadastro: "15/06/2021",
    observacoes: "Considerar para venda",
  },
  {
    id: "B001",
    tipo: "bezerro",
    nome: "Pintadinho",
    idade: "3 meses",
    status: "Saudável",
    statusColor: "bg-green-500",
    ultimaOcorrencia: "Vacinação (01/03/2025)",
    dataCadastro: "15/12/2024",
    observacoes: "Filho da Mimosa",
  },
  {
    id: "B002",
    tipo: "bezerro",
    nome: "Estrela",
    idade: "5 meses",
    status: "Doente",
    statusColor: "bg-red-500",
    ultimaOcorrencia: "Diarreia (25/03/2025)",
    dataCadastro: "10/10/2024",
    observacoes: "Sob tratamento veterinário",
  },
  {
    id: "T001",
    tipo: "touro",
    nome: "Sultão",
    idade: "6 anos",
    status: "Ativo",
    statusColor: "bg-green-500",
    ultimaOcorrencia: "Exame (10/01/2025)",
    dataCadastro: "20/05/2022",
    observacoes: "Reprodutor principal",
  },
]

const ocorrenciasIniciais: Ocorrencia[] = [
  {
    id: "OC001",
    tipo: "Cerca Danificada",
    descricao: "Touro quebrou cerca no pasto norte",
    data: "28/03/2025",
    status: "Pendente",
    statusColor: "bg-yellow-500",
    localizacao: { lat: -15.789012, lng: -47.923456 },
    peaoId: "P001",
    peaoNome: "João Silva",
  },
  {
    id: "OC002",
    tipo: "Falta de Suprimento",
    descricao: "Acabou o sal mineral",
    data: "25/03/2025",
    status: "Resolvido",
    statusColor: "bg-green-500",
    peaoId: "P002",
    peaoNome: "Pedro Oliveira",
  },
  {
    id: "OC003",
    tipo: "Máquina Quebrada",
    descricao: "Trator com problema no motor",
    data: "20/03/2025",
    status: "Em andamento",
    statusColor: "bg-blue-500",
    localizacao: { lat: -15.782345, lng: -47.912345 },
    peaoId: "P001",
    peaoNome: "João Silva",
  },
]

const peoesIniciais: Peao[] = [
  {
    id: "P001",
    nome: "João Silva",
    setor: "Setor Norte",
    status: "Ativo",
    statusColor: "bg-green-500",
    ultimaLocalizacao: { lat: -15.789012, lng: -47.923456, timestamp: "29/03/2025 10:45" },
    rota: [
      { lat: -15.789012, lng: -47.923456, timestamp: "29/03/2025 08:30" },
      { lat: -15.7889, lng: -47.9245, timestamp: "29/03/2025 09:15" },
      { lat: -15.7878, lng: -47.9256, timestamp: "29/03/2025 10:00" },
      { lat: -15.789012, lng: -47.923456, timestamp: "29/03/2025 10:45" },
    ],
    ocorrenciasHoje: 2,
  },
  {
    id: "P002",
    nome: "Pedro Oliveira",
    setor: "Setor Sul",
    status: "Em pausa",
    statusColor: "bg-yellow-500",
    ultimaLocalizacao: { lat: -15.792345, lng: -47.918765, timestamp: "29/03/2025 09:30" },
    rota: [
      { lat: -15.792345, lng: -47.918765, timestamp: "29/03/2025 08:00" },
      { lat: -15.793456, lng: -47.917654, timestamp: "29/03/2025 08:45" },
      { lat: -15.792345, lng: -47.918765, timestamp: "29/03/2025 09:30" },
    ],
    ocorrenciasHoje: 1,
  },
]

const tarefasIniciais: Tarefa[] = [
  {
    id: "T001",
    descricao: "Verificar cercas no pasto norte",
    status: "pendente",
    statusColor: "bg-green-500",
    peaoId: "P001",
  },
  {
    id: "T002",
    descricao: "Alimentar bezerros",
    status: "pendente",
    statusColor: "bg-green-500",
    peaoId: "P001",
  },
  {
    id: "T003",
    descricao: "Verificar vaca doente (ID: V045)",
    status: "pendente",
    statusColor: "bg-yellow-500",
    peaoId: "P001",
  },
  {
    id: "T004",
    descricao: "Consertar cerca quebrada no setor leste",
    status: "pendente",
    statusColor: "bg-red-500",
    peaoId: "P001",
  },
]

const suprimentosIniciais: Suprimento[] = [
  {
    id: "S001",
    nome: "Sal Mineral",
    quantidade: 5,
    unidade: "sacos",
    urgencia: "Urgente",
    urgenciaColor: "bg-red-500",
  },
  {
    id: "S002",
    nome: "Medicamentos para bezerros",
    quantidade: 1,
    unidade: "kit",
    urgencia: "Importante",
    urgenciaColor: "bg-yellow-500",
  },
  {
    id: "S003",
    nome: "Peças para cerca",
    quantidade: 20,
    unidade: "unidades",
    urgencia: "Normal",
    urgenciaColor: "bg-green-500",
  },
  {
    id: "S004",
    nome: "Combustível para trator",
    quantidade: 50,
    unidade: "litros",
    urgencia: "Importante",
    urgenciaColor: "bg-yellow-500",
  },
]

// Inicializa o armazenamento com dados de exemplo
const initializeStore = () => {
  if (!isBrowser) return

  // Verifica se já existe dados no localStorage
  if (!localStorage.getItem("fazenda_animais")) {
    localStorage.setItem("fazenda_animais", JSON.stringify(animaisIniciais))
  }

  if (!localStorage.getItem("fazenda_ocorrencias")) {
    localStorage.setItem("fazenda_ocorrencias", JSON.stringify(ocorrenciasIniciais))
  }

  if (!localStorage.getItem("fazenda_peoes")) {
    localStorage.setItem("fazenda_peoes", JSON.stringify(peoesIniciais))
  }

  if (!localStorage.getItem("fazenda_tarefas")) {
    localStorage.setItem("fazenda_tarefas", JSON.stringify(tarefasIniciais))
  }

  if (!localStorage.getItem("fazenda_suprimentos")) {
    localStorage.setItem("fazenda_suprimentos", JSON.stringify(suprimentosIniciais))
  }
}

// Funções para manipular os dados
export const getAnimais = (): Animal[] => {
  if (!isBrowser) return animaisIniciais

  initializeStore()
  return JSON.parse(localStorage.getItem("fazenda_animais") || "[]")
}

export const getAnimalById = (id: string): Animal | undefined => {
  const animais = getAnimais()
  return animais.find((animal) => animal.id === id)
}

export const getAnimaisByTipo = (tipo: "vaca" | "touro" | "bezerro"): Animal[] => {
  const animais = getAnimais()
  return animais.filter((animal) => animal.tipo === tipo)
}

export const addAnimal = (animal: Omit<Animal, "id" | "dataCadastro">): Animal => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const animais = getAnimais()
  const newAnimal: Animal = {
    ...animal,
    id: generateId(animal.tipo),
    dataCadastro: new Date().toLocaleDateString("pt-BR"),
  }

  localStorage.setItem("fazenda_animais", JSON.stringify([...animais, newAnimal]))
  return newAnimal
}

export const updateAnimal = (animal: Animal): void => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const animais = getAnimais()
  const index = animais.findIndex((a) => a.id === animal.id)

  if (index !== -1) {
    animais[index] = animal
    localStorage.setItem("fazenda_animais", JSON.stringify(animais))
  }
}

export const getOcorrencias = (): Ocorrencia[] => {
  if (!isBrowser) return ocorrenciasIniciais

  initializeStore()
  return JSON.parse(localStorage.getItem("fazenda_ocorrencias") || "[]")
}

export const getOcorrenciaById = (id: string): Ocorrencia | undefined => {
  const ocorrencias = getOcorrencias()
  return ocorrencias.find((ocorrencia) => ocorrencia.id === id)
}

export const addOcorrencia = (ocorrencia: Omit<Ocorrencia, "id" | "data" | "status" | "statusColor">): Ocorrencia => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const ocorrencias = getOcorrencias()
  const newOcorrencia: Ocorrencia = {
    ...ocorrencia,
    id: `OC${String(ocorrencias.length + 1).padStart(3, "0")}`,
    data: new Date().toLocaleDateString("pt-BR"),
    status: "Pendente",
    statusColor: "bg-yellow-500",
  }

  localStorage.setItem("fazenda_ocorrencias", JSON.stringify([...ocorrencias, newOcorrencia]))

  // Atualiza o contador de ocorrências do peão
  if (ocorrencia.peaoId) {
    const peoes = getPeoes()
    const peaoIndex = peoes.findIndex((p) => p.id === ocorrencia.peaoId)

    if (peaoIndex !== -1) {
      peoes[peaoIndex].ocorrenciasHoje += 1
      localStorage.setItem("fazenda_peoes", JSON.stringify(peoes))
    }
  }

  return newOcorrencia
}

export const updateOcorrencia = (ocorrencia: Ocorrencia): void => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const ocorrencias = getOcorrencias()
  const index = ocorrencias.findIndex((o) => o.id === ocorrencia.id)

  if (index !== -1) {
    ocorrencias[index] = ocorrencia
    localStorage.setItem("fazenda_ocorrencias", JSON.stringify(ocorrencias))
  }
}

export const getPeoes = (): Peao[] => {
  if (!isBrowser) return peoesIniciais

  initializeStore()
  return JSON.parse(localStorage.getItem("fazenda_peoes") || "[]")
}

export const getPeaoById = (id: string): Peao | undefined => {
  const peoes = getPeoes()
  return peoes.find((peao) => peao.id === id)
}

// Função para atualizar a localização do peão
export const updatePeaoLocalizacao = (
  peaoId: string,
  localizacao: { lat: number; lng: number },
  rota?: Array<{ lat: number; lng: number; timestamp: string }>,
  finalizarRota?: boolean,
): void => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const peoes = getPeoes()
  const index = peoes.findIndex((p) => p.id === peaoId)

  if (index !== -1) {
    const timestamp = new Date().toLocaleString("pt-BR")

    // Atualizar última localização
    peoes[index].ultimaLocalizacao = { ...localizacao, timestamp }

    // Se uma rota completa foi fornecida, substituir a rota atual
    if (rota && rota.length > 0) {
      if (finalizarRota) {
        // Finalizar rota (salvar em histórico e iniciar nova)
        const historicoRotas = JSON.parse(localStorage.getItem("fazenda_rotas_historico") || "[]")
        historicoRotas.push({
          peaoId,
          data: new Date().toISOString(),
          rota: peoes[index].rota,
        })
        localStorage.setItem("fazenda_rotas_historico", JSON.stringify(historicoRotas))

        // Iniciar nova rota apenas com o ponto atual
        peoes[index].rota = [{ ...localizacao, timestamp }]
      } else {
        // Atualizar rota existente
        peoes[index].rota = rota
      }
    } else {
      // Adicionar ponto à rota existente
      peoes[index].rota.push({ ...localizacao, timestamp })
    }

    localStorage.setItem("fazenda_peoes", JSON.stringify(peoes))
  }
}

// Função para obter o histórico de rotas de um peão
export const getHistoricoRotas = (
  peaoId: string,
): Array<{
  data: string
  rota: Array<{ lat: number; lng: number; timestamp: string }>
}> => {
  if (!isBrowser) return []

  const historicoRotas = JSON.parse(localStorage.getItem("fazenda_rotas_historico") || "[]")
  return historicoRotas.filter((h: any) => h.peaoId === peaoId)
}

// Função para obter estatísticas de um peão
export const getEstatisticasPeao = (
  peaoId: string,
): {
  distanciaTotal: number
  tempoAtividade: number
  ocorrenciasRegistradas: number
  tarefasConcluidas: number
} => {
  const peao = getPeaoById(peaoId)
  const ocorrencias = getOcorrencias().filter((o) => o.peaoId === peaoId)
  const tarefas = getTarefas().filter((t) => t.peaoId === peaoId)

  return {
    distanciaTotal: peao?.distanciaPercorrida || 0,
    tempoAtividade: peao?.tempoAtividade || 0,
    ocorrenciasRegistradas: ocorrencias.length,
    tarefasConcluidas: tarefas.filter((t) => t.status === "concluida").length,
  }
}

export const getTarefas = (): Tarefa[] => {
  if (!isBrowser) return tarefasIniciais

  initializeStore()
  return JSON.parse(localStorage.getItem("fazenda_tarefas") || "[]")
}

export const getTarefasByPeao = (peaoId: string): Tarefa[] => {
  const tarefas = getTarefas()
  return tarefas.filter((tarefa) => tarefa.peaoId === peaoId)
}

export const updateTarefaStatus = (tarefaId: string, status: "pendente" | "concluida"): void => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const tarefas = getTarefas()
  const index = tarefas.findIndex((t) => t.id === tarefaId)

  if (index !== -1) {
    tarefas[index].status = status
    localStorage.setItem("fazenda_tarefas", JSON.stringify(tarefas))
  }
}

export const getSuprimentos = (): Suprimento[] => {
  if (!isBrowser) return suprimentosIniciais

  initializeStore()
  return JSON.parse(localStorage.getItem("fazenda_suprimentos") || "[]")
}

export const addSuprimento = (suprimento: Omit<Suprimento, "id" | "urgenciaColor">): Suprimento => {
  if (!isBrowser) {
    throw new Error("Esta função só pode ser executada no navegador")
  }

  const suprimentos = getSuprimentos()

  let urgenciaColor = "bg-green-500"
  if (suprimento.urgencia === "Urgente") urgenciaColor = "bg-red-500"
  if (suprimento.urgencia === "Importante") urgenciaColor = "bg-yellow-500"

  const newSuprimento: Suprimento = {
    ...suprimento,
    id: `S${String(suprimentos.length + 1).padStart(3, "0")}`,
    urgenciaColor,
  }

  localStorage.setItem("fazenda_suprimentos", JSON.stringify([...suprimentos, newSuprimento]))
  return newSuprimento
}

// Função auxiliar para gerar IDs
const generateId = (tipo: string): string => {
  const prefix = tipo === "vaca" ? "V" : tipo === "touro" ? "T" : "B"
  const animais = getAnimais()
  const tipoAnimais = animais.filter((a) => a.tipo === tipo)
  return `${prefix}${String(tipoAnimais.length + 1).padStart(3, "0")}`
}

