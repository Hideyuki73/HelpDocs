import { api } from './api'

export async function enviarMensagemIA(message: string, contextoDocumento: string | undefined, token: string) {
  try {
    const response = await api.post(
      '/ia-helper/message',
      {
        message,
        contextoDocumento,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
    return response.data
  } catch (error) {
    console.error('Erro ao enviar mensagem para a IA:', error)
    throw error
  }
}
