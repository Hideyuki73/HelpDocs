import { api } from './api'

export interface EmpresaParams {
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
}

export async function criarEmpresaClient(body: EmpresaParams) {
  const response = await api.post('/empresas', body)
  console.log('Empresa criada:', response.data)
  return response.data
}
