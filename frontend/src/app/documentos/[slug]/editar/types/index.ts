import { User } from 'firebase/auth'

export interface ChecklistItem {
  id: string
  descricao: string
  concluido: boolean
}

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
  checklist?: ChecklistItem[]
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
  checklist?: ChecklistItem[]
}

export interface DocumentoEditorProps {
  documento: Documento
  formData: DocumentoFormData
  saving: boolean
  showChat: boolean
  user?: User | null
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSalvar: () => void
  onPublicar: () => void
  onToggleChat: () => void
  onVoltar: () => void
}
