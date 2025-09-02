export interface Equipe {
  id: string
  nome: string
  documentoId?: string
  criadorId: string
  membros: string[]
  dataCadastro: Date
  empresaId: string
}

export interface EquipeFormData {
  nome: string
  documentoId?: string
  membros?: string[]
}

export interface EquipeStats {
  totalEquipes: number
  totalMembros: number
  equipesComDocumento: number
  equipeSemDocumento: number
  mediaMembrosPorEquipe: number
}

export interface MembroEquipe {
  id: string
  nome: string
  email: string
  cargo: string
}

export interface EquipeDetalhada extends Equipe {
  criador?: MembroEquipe
  membrosDetalhados?: MembroEquipe[]
}
