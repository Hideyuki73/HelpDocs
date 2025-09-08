'use client'

import { useState, useEffect } from 'react'
import { listarDocumentosDisponiveisParaEquipe } from '@/action/documento'
import { auth } from '@/config/firebase'

export function useDocumentos() {
  const [documentos, setDocumentos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const carregar = async () => {
      setLoading(true)
      try {
        const user = auth.currentUser
        if (user) {
          const lista = await listarDocumentosDisponiveisParaEquipe(user.uid)
          setDocumentos(lista)
        }
      } catch (err) {
        console.error('Erro ao carregar documentos:', err)
        setDocumentos([])
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  return { documentos, loading }
}
