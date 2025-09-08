'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  listarDocumentos,
  criarDocumento,
  atualizarDocumento,
  deletarDocumento,
  obterEstatisticasDocumentos,
  Documento,
  DocumentoParams,
} from '@/action/documento'
import { auth } from '@/config/firebase'

interface UseDocumentosState {
  documentos: Documento[]
  loading: boolean
  error: string | null
  stats: any
}

export function useDocumentos() {
  const [state, setState] = useState<UseDocumentosState>({
    documentos: [],
    loading: false,
    error: null,
    stats: null,
  })

  // 🔹 Carregar documentos
  const carregarDocumentos = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const user = auth.currentUser
      if (!user) throw new Error('Usuário não autenticado')

      const lista = await listarDocumentos(user.uid)
      setState((prev) => ({ ...prev, documentos: lista, loading: false }))
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Erro ao carregar documentos',
      }))
    }
  }, [])

  // 🔹 Criar documento
  const criar = useCallback(async (dados: DocumentoParams) => {
    setState((prev) => ({ ...prev, loading: true }))
    try {
      const novo = await criarDocumento(dados)
      setState((prev) => ({
        ...prev,
        documentos: [...prev.documentos, novo],
        loading: false,
      }))
      return novo
    } catch (error: any) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }))
      throw error
    }
  }, [])

  // 🔹 Atualizar documento
  const atualizar = useCallback(async (id: string, dados: Partial<DocumentoParams>, usuarioId: string) => {
    setState((prev) => ({ ...prev, loading: true }))
    try {
      const atualizado = await atualizarDocumento(id, dados, usuarioId)
      setState((prev) => ({
        ...prev,
        documentos: prev.documentos.map((doc) => (doc.id === id ? atualizado : doc)),
        loading: false,
      }))
      return atualizado
    } catch (error: any) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }))
      throw error
    }
  }, [])

  // 🔹 Deletar documento
  const deletar = useCallback(async (id: string, usuarioId: string) => {
    setState((prev) => ({ ...prev, loading: true }))
    try {
      await deletarDocumento(id, usuarioId)
      setState((prev) => ({
        ...prev,
        documentos: prev.documentos.filter((doc) => doc.id !== id),
        loading: false,
      }))
    } catch (error: any) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }))
      throw error
    }
  }, [])

  // 🔹 Estatísticas
  const carregarStats = useCallback(async () => {
    try {
      const user = auth.currentUser
      if (!user) return
      const stats = await obterEstatisticasDocumentos(user.uid)
      setState((prev) => ({ ...prev, stats }))
    } catch (error) {
      console.error('Erro ao carregar stats', error)
    }
  }, [])

  useEffect(() => {
    carregarDocumentos()
    carregarStats()
  }, [carregarDocumentos, carregarStats])

  return {
    ...state,
    criar,
    atualizar,
    deletar,
    carregarDocumentos,
    carregarStats,
  }
}
