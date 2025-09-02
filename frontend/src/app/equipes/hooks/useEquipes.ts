import { useState, useEffect, useCallback } from 'react'
import {
  listarEquipes,
  criarEquipe,
  deletarEquipe,
  atualizarEquipe,
  adicionarMembros,
  removerMembro,
  obterEstatisticasEquipes,
} from '@/action/equipe'
import { Equipe, EquipeFormData, EquipeStats } from '../types'

interface UseEquipesState {
  equipes: Equipe[]
  stats: EquipeStats | null
  loading: boolean
  error: string | null
}

export function useEquipes() {
  const [state, setState] = useState<UseEquipesState>({
    equipes: [],
    stats: null,
    loading: true,
    error: null,
  })

  const carregarEquipes = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const equipes = await listarEquipes()
      setState((prev) => ({ ...prev, equipes, loading: false }))
    } catch (error: any) {
      console.error('Erro ao carregar equipes:', error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Erro ao carregar equipes',
      }))
    }
  }, [])

  const carregarEstatisticas = useCallback(async () => {
    try {
      const stats = await obterEstatisticasEquipes()
      setState((prev) => ({ ...prev, stats }))
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }, [])

  const criar = useCallback(async (equipeData: EquipeFormData) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const novaEquipe = await criarEquipe(equipeData)
      setState((prev) => ({
        ...prev,
        equipes: [...prev.equipes, novaEquipe],
        loading: false,
      }))
      return novaEquipe
    } catch (error: any) {
      console.error('Erro ao criar equipe:', error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Erro ao criar equipe',
      }))
      throw error
    }
  }, [])

  const atualizar = useCallback(async (equipeId: string, equipeData: Partial<EquipeFormData>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const equipeAtualizada = await atualizarEquipe(equipeId, equipeData)
      setState((prev) => ({
        ...prev,
        equipes: prev.equipes.map((equipe) => (equipe.id === equipeId ? equipeAtualizada : equipe)),
        loading: false,
      }))
      return equipeAtualizada
    } catch (error: any) {
      console.error('Erro ao atualizar equipe:', error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Erro ao atualizar equipe',
      }))
      throw error
    }
  }, [])

  const deletar = useCallback(async (equipeId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await deletarEquipe(equipeId)
      setState((prev) => ({
        ...prev,
        equipes: prev.equipes.filter((equipe) => equipe.id !== equipeId),
        loading: false,
      }))
    } catch (error: any) {
      console.error('Erro ao deletar equipe:', error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Erro ao deletar equipe',
      }))
      throw error
    }
  }, [])

  const adicionarMembro = useCallback(async (equipeId: string, membros: string[]) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const equipeAtualizada = await adicionarMembros(equipeId, membros)
      setState((prev) => ({
        ...prev,
        equipes: prev.equipes.map((equipe) => (equipe.id === equipeId ? equipeAtualizada : equipe)),
        loading: false,
      }))
      return equipeAtualizada
    } catch (error: any) {
      console.error('Erro ao adicionar membro:', error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Erro ao adicionar membro',
      }))
      throw error
    }
  }, [])

  const removerMembroDaEquipe = useCallback(async (equipeId: string, membroId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const equipeAtualizada = await removerMembro(equipeId, membroId)
      setState((prev) => ({
        ...prev,
        equipes: prev.equipes.map((equipe) => (equipe.id === equipeId ? equipeAtualizada : equipe)),
        loading: false,
      }))
      return equipeAtualizada
    } catch (error: any) {
      console.error('Erro ao remover membro:', error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Erro ao remover membro',
      }))
      throw error
    }
  }, [])

  const limparErro = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
  }, [])

  useEffect(() => {
    carregarEquipes()
    carregarEstatisticas()
  }, [carregarEquipes, carregarEstatisticas])

  return {
    ...state,
    criar,
    atualizar,
    deletar,
    adicionarMembro,
    removerMembro: removerMembroDaEquipe,
    carregarEquipes,
    carregarEstatisticas,
    limparErro,
  }
}
