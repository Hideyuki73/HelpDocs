import { Documento, DocumentoFormData } from '../types/documento'

export async function carregarDocumentoAction(slug: string, userId: string): Promise<Documento> {
  // Substitua pela lógica real de chamada à API
  const response = await fetch(`/api/documentos/${slug}?usuarioId=${userId}`)

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Acesso negado. Você não tem permissão para editar este documento.')
    }
    throw new Error('Erro ao carregar documento.')
  }
  return response.json()
}

export async function salvarDocumentoAction(
  documentoId: string,
  userId: string,
  formData: DocumentoFormData,
): Promise<Documento> {
  // Substitua pela lógica real de chamada à API
  const response = await fetch(`/api/documentos/${documentoId}?usuarioId=${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })

  if (!response.ok) {
    throw new Error('Erro ao salvar documento.')
  }
  return response.json()
}

export async function publicarDocumentoAction(
  documentoId: string,
  userId: string,
  formData: DocumentoFormData,
): Promise<Documento> {
  // Substitua pela lógica real de chamada à API
  const response = await fetch(`/api/documentos/${documentoId}?usuarioId=${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...formData, status: 'publicado' }),
  })

  if (!response.ok) {
    throw new Error('Erro ao publicar documento.')
  }
  return response.json()
}
