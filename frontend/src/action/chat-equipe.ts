import { auth } from '@/config/firebase'
import { api } from './api'

export interface ChatEquipe {
  id: string
  nome: string
  equipeId: string
  empresaId: string
  criadoPor: string
  dataCriacao: Date
  ativo: boolean
}

export interface Mensagem {
  id: string
  conteudo: string
  autorId: string
  nomeAutor: string
  chatId: string
  tipoChat: 'equipe' | 'empresa'
  dataEnvio: Date
  editada: boolean
  dataEdicao?: Date
}

export interface CreateChatEquipeParams {
  nome: string
  equipeId: string
  criadoPor: string
  ativo?: boolean
}

export interface CreateMensagemParams {
  conteudo: string
  autorId: string
}

export interface UpdateMensagemParams {
  conteudo: string
}

export async function criarChatEquipe(chatData: CreateChatEquipeParams): Promise<ChatEquipe> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.post('/chats/equipe', chatData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function listarChatsEquipe(equipeId: string, usuarioId: string): Promise<ChatEquipe[]> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/chats/equipe/${equipeId}`, {
    params: { usuarioId },
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function obterChatEquipe(chatId: string, usuarioId: string): Promise<ChatEquipe> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/chats/equipe/${chatId}`, {
    params: { usuarioId },
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function enviarMensagem(chatId: string, mensagemData: CreateMensagemParams): Promise<Mensagem> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.post(`/chats/equipe/${chatId}/mensagens`, mensagemData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function listarMensagens(chatId: string, usuarioId: string, limite?: number): Promise<Mensagem[]> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/chats/equipe/${chatId}/mensagens`, {
    params: { usuarioId, limite },
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function editarMensagem(
  mensagemId: string,
  mensagemData: UpdateMensagemParams,
  usuarioId: string,
): Promise<Mensagem> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.patch(`/chats/equipe/mensagens/${mensagemId}`, mensagemData, {
    params: { usuarioId },
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}
