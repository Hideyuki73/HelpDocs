import { auth } from '@/config/firebase'
import { api } from './api'

export interface EmpresaParams {
  nome: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  membros?: string[]
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

export async function getMinhaEmpresa() {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/findByIdFuncionario/${user.uid}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

// Gerar código de convite
export async function gerarConvite(empresaId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.post(
    `/empresas/${empresaId}/gerar-convite`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  return response.data
}

// Entrar em empresa pelo código
export async function entrarEmpresaPorConvite(codigo: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.post(
    '/empresas/entrar-empresa',
    {
      funcionarioId: user.uid,
      codigo,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  return response.data
}
