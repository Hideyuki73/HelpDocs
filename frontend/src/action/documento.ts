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
  arquivo?: File
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

export async function carregarDocumentoAction(slug: string, userId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/documentos/${slug}?usuarioId=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function publicarDocumentoAction(documentoId: string, userId: string, formData: any) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.patch(
    `/documentos/${documentoId}?usuarioId=${userId}`,
    { ...formData, status: 'publicado' },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  return response.data
}

// Função para download de documento
export async function downloadDocumento(slug: string, usuarioId: string) {
  try {
    const user = auth.currentUser
    if (!user) throw new Error('Usuário não autenticado')
    const token = await user.getIdToken()

    const response = await api.get(`/documentos/${slug}/download`, {
      params: { usuarioId },
      headers: { Authorization: `Bearer ${token}` },
    })

    const { arquivoUrl, nomeArquivo } = response.data

    // Criar um link temporário para download
    const link = document.createElement('a')
    link.href = arquivoUrl
    link.download = nomeArquivo || 'documento'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return response.data
  } catch (error) {
    console.error('Erro ao baixar documento:', error)
    throw error
  }
}

// Função para visualizar documento
export async function visualizarDocumento(slug: string, usuarioId: string) {
  try {
    const user = auth.currentUser
    if (!user) throw new Error('Usuário não autenticado')
    const token = await user.getIdToken()

    const response = await api.get(`/documentos/${slug}/visualizar`, {
      params: { usuarioId },
      headers: { Authorization: `Bearer ${token}` },
    })

    const data = response.data

    // Se for um documento de upload, abrir em nova aba
    if (data.tipo === 'upload' && data.arquivoUrl) {
      window.open(data.arquivoUrl, '_blank')
    }

    return data
  } catch (error) {
    console.error('Erro ao visualizar documento:', error)
    throw error
  }
}

export async function substituirDocumento(documentoId: string, usuarioId: string, file: File) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const formData = new FormData()
  formData.append('arquivo', file)

  const response = await api.patch(`/documentos/${documentoId}/substituir-arquivo?usuarioId=${usuarioId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}
