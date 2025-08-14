import { api } from './api'
import { AxiosRequestConfig } from 'axios'

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
