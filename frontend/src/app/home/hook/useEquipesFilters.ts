import { useState, useMemo } from 'react'
import { Equipe } from '@/app/equipes/types'
import { EquipesFiltersState } from '../components/EquipesFilters'

interface UseEquipesFiltersProps {
  equipes: Equipe[]
}

export function useEquipesFilters({ equipes }: UseEquipesFiltersProps) {
  const [filters, setFilters] = useState<EquipesFiltersState>({
    searchTerm: '',
    sortBy: 'nome',
    sortOrder: 'asc',
    statusFilter: 'all',
  })

  const filteredAndSortedEquipes = useMemo(() => {
    let result = [...equipes]

    // Aplicar filtro de busca
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      result = result.filter(
        (equipe) => equipe.nome.toLowerCase().includes(searchLower),
        // || equipe.descricao?.toLowerCase().includes(searchLower)
      )
    }

    // // Aplicar filtro de status
    // if (filters.statusFilter !== 'all') {
    //   result = result.filter((equipe) => {
    //     const status = equipe.status?.toLowerCase() || 'ativa'
    //     return status === filters.statusFilter
    //   })
    // }

    // Aplicar ordenação
    result.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case 'nome':
          comparison = a.nome.localeCompare(b.nome)
          break
        // case 'dataCriacao':
        //   comparison = new Date(a.dataCriacao).getTime() - new Date(b.dataCriacao).getTime()
        //   break
        case 'membros':
          // Assumindo que temos informação de membros na equipe
          const aMembros = (a as any).membros?.length || 0
          const bMembros = (b as any).membros?.length || 0
          comparison = aMembros - bMembros
          break
        default:
          comparison = 0
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [equipes, filters])

  const stats = useMemo(() => {
    return {
      total: equipes.length,
      filtered: filteredAndSortedEquipes.length,
      // ativas: equipes.filter((e) => (e.status?.toLowerCase() || 'ativa') === 'ativa').length,
      // inativas: equipes.filter((e) => (e.status?.toLowerCase() || 'ativa') === 'inativa').length,
    }
  }, [equipes, filteredAndSortedEquipes])

  return {
    filters,
    setFilters,
    filteredEquipes: filteredAndSortedEquipes,
    stats,
  }
}
