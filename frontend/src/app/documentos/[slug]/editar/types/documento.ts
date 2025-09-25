export interface Documento {
  id: string
  titulo: string
  descricao: string
  conteudo: string
  tipo: 'criado' | 'upload'
  status: 'rascunho' | 'publicado' | 'arquivado'
  equipeId: string
  versao: number
  dataCriacao: string
  dataAtualizacao?: string
}

export type DocumentoFormData = {
  titulo: string
  descricao: string
  conteudo: string
  status: 'rascunho' | 'publicado' | 'arquivado'
}
