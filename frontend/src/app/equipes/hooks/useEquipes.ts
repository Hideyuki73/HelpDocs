import {
  listarEquipes,
  criarEquipe,
  deletarEquipe,
  atualizarEquipe,
  adicionarMembros,
  removerMembro,
  obterEstatisticasEquipes,
  obterEquipePorId,
} from '@/action/equipe'
import { getMinhaEmpresa } from '@/action/empresa'
import { getFuncionarios } from '@/action/funcionario'
import { Equipe, EquipeFormData, EquipeStats } from '../types'
import { useCallback, useEffect, useState } from 'react'

interface UseEquipesState {
  equipes: Equipe[]
  stats: EquipeStats | null
  membrosEmpresa: any[]
  loading: boolean
  loadingMembros: boolean
  error: string | null
}

export function useEquipes() {
  const [state, setState] = useState<UseEquipesState>({
    equipes: [],
    stats: null,
    membrosEmpresa: [],
    loading: true,
    loadingMembros: false,
    error: null,
  })

  // 🔹 Carregar equipes
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

  // 🔹 Buscar equipe por ID
  const buscarEquipePorId = useCallback(async (equipeId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const equipe = await obterEquipePorId(equipeId)
      setState((prev) => ({
        ...prev,
        equipes: equipe ? [equipe] : [], // Se encontrar, retorna apenas essa equipe
        loading: false,
      }))
      return equipe
    } catch (error: any) {
      console.error(`Erro ao buscar equipe ${equipeId}:`, error)
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || `Erro ao buscar equipe ${equipeId}`,
      }))
      return null
    }
  }, [])

  // 🔹 Carregar estatísticas
  const carregarEstatisticas = useCallback(async () => {
    try {
      const stats = await obterEstatisticasEquipes()
      setState((prev) => ({ ...prev, stats }))
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }, [])

  // 🔹 Carregar membros da empresa do usuário logado
  const carregarMembrosEmpresa = useCallback(async () => {
    setState((prev) => ({ ...prev, loadingMembros: true }))
    try {
      const empresa = await getMinhaEmpresa()
      if (empresa?.membros?.length > 0) {
        const funcionarios = await getFuncionarios(empresa.membros)
        setState((prev) => ({ ...prev, membrosEmpresa: funcionarios, loadingMembros: false }))
      } else {
        setState((prev) => ({ ...prev, membrosEmpresa: [], loadingMembros: false }))
      }
    } catch (error) {
      console.error('Erro ao carregar membros da empresa:', error)
      setState((prev) => ({ ...prev, membrosEmpresa: [], loadingMembros: false }))
    }
  }, [])

  // 🔹 Criar equipe
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

  // 🔹 Atualizar equipe
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

  // 🔹 Deletar equipe
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

  // 🔹 Adicionar membro (restrito aos da empresa)
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

  // 🔹 Remover membro
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

  // 🔹 Carregar dados iniciais
  useEffect(() => {
    carregarEquipes()
    carregarEstatisticas()
    carregarMembrosEmpresa()
  }, [carregarEquipes, carregarEstatisticas, carregarMembrosEmpresa])

  return {
    ...state,
    criar,
    atualizar,
    deletar,
    adicionarMembro,
    removerMembro: removerMembroDaEquipe,
    carregarEquipes,
    carregarEstatisticas,
    carregarMembrosEmpresa,
    buscarEquipePorId,
    limparErro,
  }
}
