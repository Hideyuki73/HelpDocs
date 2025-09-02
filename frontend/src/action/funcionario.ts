import { api } from './api'
import { AxiosRequestConfig } from 'axios'
import { auth } from '@/config/firebase'

export interface FuncionarioParams {
  nome: string
  email: string
  cargo?: string
}

// Corrija a assinatura da função para aceitar 'config' do Axios
export async function criarFuncionarioClient(body: FuncionarioParams, config: AxiosRequestConfig) {
  // Repasse o 'body' e o 'config' para o api.post
  const response = await api.post('/funcionarios', body, config)
  console.log('Funcionário criado:', response.data)
  return response.data
}

// Buscar funcionário por ID
export async function getFuncionario(funcionarioId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/funcionarios/${funcionarioId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

// Buscar múltiplos funcionários por IDs
export async function getFuncionarios(funcionarioIds: string[]) {
  const funcionarios = await Promise.allSettled(funcionarioIds.map((id) => getFuncionario(id)))

  return funcionarios.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      // Se não conseguir buscar o funcionário, retorna dados básicos
      return {
        id: funcionarioIds[index],
        nome: `Usuário ${funcionarioIds[index].substring(0, 8)}`,
        email: 'Email não disponível',
      }
    }
  })
}

// Atualizar cargo do funcionário
export async function updateCargoFuncionario(funcionarioId: string, cargo: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.patch(
    `/funcionarios/${funcionarioId}/cargo`,
    { cargo },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  return response.data
}

// Expulsar funcionário (remover da empresa)
export async function expulsarFuncionario(funcionarioId: string, empresaId: string) {
  const user = auth.currentUser
  if (!user) throw new Error("Usuário não autenticado")
  const token = await user.getIdToken()

  const response = await api.patch(`/empresas/${empresaId}/remover-funcionario`, 
    { funcionarioId },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  )
  return response.data
}



// Listar todos os funcionários da empresa
export async function listarFuncionarios() {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get('/funcionarios', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

