import { auth } from '@/config/firebase'
import { api } from './api'

export interface ChatEmpresa {
  id: string
  nome: string
  empresaId: string
  criadoPor: string
  dataCriacao: Date
  ativo: boolean
  publico: boolean
}

export interface Mensagem {
  id: string
  conteudo: string
  autorId: string
  chatId: string
  tipoChat: 'equipe' | 'empresa'
  dataEnvio: Date
  editada: boolean
  dataEdicao?: Date
}

export interface CreateChatEmpresaParams {
  nome: string
  empresaId: string
  criadoPor: string
  ativo?: boolean
  publico?: boolean
}

export interface CreateMensagemParams {
  conteudo: string
  autorId: string
}

export interface UpdateMensagemParams {
  conteudo: string
}

export async function criarChatEmpresa(chatData: CreateChatEmpresaParams): Promise<ChatEmpresa> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.post('/chats/empresa', chatData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function listarChatsEmpresa(usuarioId: string): Promise<ChatEmpresa[]> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get('/chats/empresa', {
    params: { usuarioId },
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function obterChatEmpresa(chatId: string, usuarioId: string): Promise<ChatEmpresa> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/chats/empresa/${chatId}`, {
    params: { usuarioId },
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function enviarMensagem(chatId: string, mensagemData: CreateMensagemParams): Promise<Mensagem> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.post(`/chats/empresa/${chatId}/mensagens`, mensagemData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function listarMensagens(chatId: string, usuarioId: string, limite?: number): Promise<Mensagem[]> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/chats/empresa/${chatId}/mensagens`, {
    params: { usuarioId, limite },
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function editarMensagem(mensagemId: string, mensagemData: UpdateMensagemParams, usuarioId: string): Promise<Mensagem> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.patch(`/chats/empresa/mensagens/${mensagemId}`, mensagemData, {
    params: { usuarioId },
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function deletarMensagem(mensagemId: string, usuarioId: string): Promise<{ message: string }> {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.delete(`/chats/empresa/mensagens/${mensagemId}`, {
    params: { usuarioId },
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}
