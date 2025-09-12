import { auth } from '@/config/firebase'
import { api } from './api'

export interface EquipeParams {
  nome: string
  documentoId?: string
  membros?: string[]
}

export interface Equipe {
  id: string
  nome: string
  documentoId?: string
  criadorId: string
  membros: string[]
  dataCadastro: Date
  empresaId: string
}

export interface EquipeStats {
  totalEquipes: number
  totalMembros: number
  equipesComDocumento: number
  equipeSemDocumento: number
  mediaMembrosPorEquipe: number
}

export async function criarEquipe(equipeData: EquipeParams) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.post('/equipes', equipeData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function listarEquipes() {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get('/equipes', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function obterEquipe(equipeId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/equipes/${equipeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function atualizarEquipe(equipeId: string, equipeData: Partial<EquipeParams>) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.patch(`/equipes/${equipeId}`, equipeData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function deletarEquipe(equipeId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.delete(`/equipes/${equipeId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function adicionarMembros(equipeId: string, membros: string[]) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.post(
    `/equipes/${equipeId}/adicionar-membros`,
    { membros },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  return response.data
}

export async function removerMembro(equipeId: string, membroId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.delete(`/equipes/${equipeId}/remover-membro/${membroId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function obterEstatisticasEquipes() {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get('/equipes/stats', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

export async function listarEquipesPorUsuario(usuarioId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/equipes/usuario/${usuarioId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}
