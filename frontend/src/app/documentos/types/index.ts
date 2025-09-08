export interface Documento {
  id: string
  titulo: string
  descricao: string
  tipo: 'criado' | 'upload'
  status: 'rascunho' | 'publicado' | 'arquivado'
  equipeId: string
  criadoPor: string
  dataCriacao: string
  dataAtualizacao?: string
  versao: number
  nomeArquivo?: string
}

export interface DocumentoStats {
  total: number
  rascunhos: number
  publicados: number
  arquivados: number
  porEquipe: { [key: string]: number }
  porTipo: { [key: string]: number }
}

export interface DocumentoFormData {
  titulo: string
  descricao: string
  tipo: 'criado' | 'upload'
  equipeId: string
  arquivo?: File
}
