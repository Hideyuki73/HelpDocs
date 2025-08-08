import { api } from './api'

export interface FuncionarioParams {
  nome: string
  senha: string
  email: string
  cargo?: string
}

export async function criarFuncionarioClient(body: FuncionarioParams) {
  const response = await api.post('/funcionarios', body)
  console.log('Funcionário criado:', response.data)
  return response.data
}
