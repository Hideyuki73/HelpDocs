import { auth } from '@/config/firebase'
import { api } from './api'

export interface VersaoDocumento {
  id: string
  documentoId: string
  numeroVersao: number
  conteudo: string
  criadoPor: string
  dataCriacao: Date
}

export interface CreateVersaoDocumentoDto {
  documentoId: string
  numeroVersao: number
  conteudo: string
  criadoPor: string
}

// Listar todas as versões de um documento
export async function listarVersoesDocumento(documentoId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/versoes-documento?documentoId=${documentoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

// Obter uma versão específica
export async function obterVersaoDocumento(versaoId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.get(`/versoes-documento/${versaoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

// Criar uma nova versão do documento
export async function criarVersaoDocumento(data: CreateVersaoDocumentoDto) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.post('/versoes-documento', data, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}

// Restaurar uma versão específica (criar nova versão baseada em uma anterior)
export async function restaurarVersaoDocumento(documentoId: string, versaoId: string, usuarioId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  // Primeiro, obter o conteúdo da versão a ser restaurada
  const versaoAnterior = await obterVersaoDocumento(versaoId)

  // Criar uma nova versão com o conteúdo da versão anterior
  const novaVersao = await criarVersaoDocumento({
    documentoId,
    numeroVersao: Date.now(), // Usar timestamp como número da versão
    conteudo: versaoAnterior.conteudo,
    criadoPor: usuarioId,
  })

  return novaVersao
}

// Comparar duas versões de um documento
export async function compararVersoes(versaoId1: string, versaoId2: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const [versao1, versao2] = await Promise.all([obterVersaoDocumento(versaoId1), obterVersaoDocumento(versaoId2)])

  return {
    versao1,
    versao2,
    diferencas: calcularDiferencas(versao1.conteudo, versao2.conteudo),
  }
}

export async function migrarVersoes() {
  const user = auth.currentUser
  if (!user) throw new Error('Usuário não autenticado')
  const token = await user.getIdToken()

  const response = await api.post('/migrate-versions')
}

// Função auxiliar para calcular diferenças entre dois textos
function calcularDiferencas(texto1: string, texto2: string) {
  const linhas1 = texto1.split('\n')
  const linhas2 = texto2.split('\n')

  const diferencas = []
  const maxLinhas = Math.max(linhas1.length, linhas2.length)

  for (let i = 0; i < maxLinhas; i++) {
    const linha1 = linhas1[i] || ''
    const linha2 = linhas2[i] || ''

    if (linha1 !== linha2) {
      diferencas.push({
        numeroLinha: i + 1,
        linhaAnterior: linha1,
        linhaNova: linha2,
        tipo: linha1 === '' ? 'adicao' : linha2 === '' ? 'remocao' : 'modificacao',
      })
    }
  }

  return diferencas
}
