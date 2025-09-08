import { auth } from '@/config/firebase'
import { api } from './api'

export interface DocumentoParams {
  titulo: string
  descricao: string
  conteudo?: string
  tipo: string
  arquivoUrl?: string
  nomeArquivo?: string
  tamanhoArquivo?: number
  equipeId: string
  criadoPor: string
  status?: string
}

export interface Documento {
  id: string
  titulo: string
  descricao: string
  conteudo?: string
  tipo: string
  arquivoUrl?: string
  nomeArquivo?: string
  tamanhoArquivo?: number
  equipeId: string
  criadoPor: string
  dataCriacao: Date
  dataAtualizacao: Date
  versao: number
  status: string
}

export async function criarDocumento(documentoData: DocumentoParams) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.post('/documentos', documentoData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function listarDocumentos(usuarioId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/documentos?usuarioId=${usuarioId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function obterDocumento(documentoId: string, usuarioId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/documentos/${documentoId}?usuarioId=${usuarioId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function atualizarDocumento(
  documentoId: string,
  documentoData: Partial<DocumentoParams>,
  usuarioId: string,
) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.patch(`/documentos/${documentoId}?usuarioId=${usuarioId}`, documentoData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function deletarDocumento(documentoId: string, usuarioId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.delete(`/documentos/${documentoId}?usuarioId=${usuarioId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function atribuirDocumentoAEquipe(documentoId: string, equipeId: string, usuarioId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.patch(
    `/documentos/${documentoId}/atribuir-equipe?usuarioId=${usuarioId}`,
    { equipeId },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  return response.data
}

export async function listarDocumentosDisponiveisParaEquipe(usuarioId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/documentos/disponiveis-para-equipe?usuarioId=${usuarioId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function obterEstatisticasDocumentos(usuarioId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/documentos/stats?usuarioId=${usuarioId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}
