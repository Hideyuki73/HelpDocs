export interface Documento {
  id: string
  titulo: string
  descricao: string
  conteudo?: string
  tipo: 'criado' | 'upload'
  status: 'rascunho' | 'publicado' | 'arquivado'
  equipeId: string
  versao: number
  dataCriacao: string
  dataAtualizacao?: string
  arquivoUrl?: string
  nomeArquivo?: string
  tamanhoArquivo?: number
  criadoPor?: string
  empresaId?: string
}

export type DocumentoFormData = {
  titulo: string
  descricao: string
  conteudo?: string
  tipo?: string
  arquivoUrl?: string
  nomeArquivo?: string
  tamanhoArquivo?: number
  equipeId?: string
  criadoPor?: string
  status: 'rascunho' | 'publicado' | 'arquivado'
  arquivo?: File
}
