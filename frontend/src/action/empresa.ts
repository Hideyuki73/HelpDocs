import { auth } from '@/config/firebase'
import { api } from './api'

export interface EmpresaParams {
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
}

export async function criarEmpresaClient(body: EmpresaParams) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()
  const response = await api.post('/empresas', body, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}
