export interface Membro {
  id: string
  nome?: string
  email?: string
  cargo?: string
}

export interface Empresa {
  id: string
  nome: string
  telefone: string
  cnpj: string
  email: string
  endereco: string
  membros?: string[]
}

export const CARGOS_DISPONIVEIS = ['Administrador', 'Gerente de Projetos', 'Desenvolvedor'] as const

export type Cargo = typeof CARGOS_DISPONIVEIS[number]

