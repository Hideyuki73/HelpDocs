import { auth } from '@/config/firebase'
import { api } from './api'

export interface UsuarioLogado {
  id: string
  nome: string
  email: string
  cargo?: string
  empresaId?: string
}

// Função para obter informações do usuário logado
export async function getUsuarioLogado(): Promise<UsuarioLogado | null> {
  const user = auth.currentUser
  if (!user) return null

  try {
    const token = await user.getIdToken()
    const response = await api.get(`/funcionarios/${user.uid}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    return {
      id: user.uid,
      nome: response.data.nome || user.displayName || 'Usuário',
      email: response.data.email || user.email || '',
      cargo: response.data.cargo,
      empresaId: response.data.empresaId,
    }
  } catch (error) {
    console.log('Erro ao buscar dados do usuário:', error)
    // Fallback com dados básicos do Firebase Auth
    return {
      id: user.uid,
      nome: user.displayName || 'Usuário',
      email: user.email || '',
    }
  }
}

// Função para verificar se o usuário é admin
export function isAdmin(usuario: UsuarioLogado | null): boolean {
  if (!usuario || !usuario.cargo) return false

  // Lista de cargos que têm permissões de admin
  const cargosAdmin = 'Administrador'

  return cargosAdmin.includes(usuario.cargo)
}
