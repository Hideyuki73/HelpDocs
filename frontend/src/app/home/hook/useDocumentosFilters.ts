import { useState, useMemo } from 'react'
import { Documento } from '@/action/documento'
import { DocumentosFiltersState } from '../components/DocumentosFilters'

interface UseDocumentosFiltersProps {
  documentos: Documento[]
}

export function useDocumentosFilters({ documentos }: UseDocumentosFiltersProps) {
  const [filters, setFilters] = useState<DocumentosFiltersState>({
    searchTerm: '',
    sortBy: 'titulo',
    sortOrder: 'asc',
    tipoFilter: 'all',
    statusFilter: [],
    equipeFilter: 'all',
    autorFilter: 'all',
    dateRange: {},
  })

  const filteredAndSortedDocumentos = useMemo(() => {
    let result = [...documentos]

    // Aplicar filtro de busca
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      result = result.filter(
        (documento) =>
          documento.titulo.toLowerCase().includes(searchLower) ||
          documento.descricao?.toLowerCase().includes(searchLower) ||
          documento.conteudo?.toLowerCase().includes(searchLower) ||
          documento.nomeArquivo?.toLowerCase().includes(searchLower),
      )
    }

    // Aplicar filtro de tipo
    if (filters.tipoFilter !== 'all') {
      result = result.filter((documento) => documento.tipo === filters.tipoFilter)
    }

    // Aplicar filtro de status
    if (filters.statusFilter.length > 0) {
      result = result.filter((documento) => {
        const status = documento.status?.toLowerCase() || 'pendente'
        return filters.statusFilter.includes(status)
      })
    }

    // Aplicar filtro de equipe
    if (filters.equipeFilter !== 'all') {
      result = result.filter((documento) => documento.equipeId === filters.equipeFilter)
    }

    // Aplicar filtro de autor
    if (filters.autorFilter !== 'all') {
      result = result.filter((documento) => documento.criadoPor === filters.autorFilter)
    }

    // Aplicar filtro de data
    if (filters.dateRange.start || filters.dateRange.end) {
      result = result.filter((documento) => {
        const docDate = new Date(documento.dataCriacao)
        const start = filters.dateRange.start
        const end = filters.dateRange.end

        if (start && docDate < start) return false
        if (end && docDate > end) return false
        return true
      })
    }

    // Aplicar ordenação
    result.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case 'titulo':
          comparison = a.titulo.localeCompare(b.titulo)
          break
        case 'dataCriacao':
          comparison = new Date(a.dataCriacao).getTime() - new Date(b.dataCriacao).getTime()
          break
        case 'dataAtualizacao':
          const aUpdate = a.dataAtualizacao ? new Date(a.dataAtualizacao).getTime() : 0
          const bUpdate = b.dataAtualizacao ? new Date(b.dataAtualizacao).getTime() : 0
          comparison = aUpdate - bUpdate
          break
        case 'tipo':
          comparison = (a.tipo || '').localeCompare(b.tipo || '')
          break
        default:
          comparison = 0
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

    return result
  }, [documentos, filters])

  const stats = useMemo(() => {
    const total = documentos.length
    const filtered = filteredAndSortedDocumentos.length

    const byTipo = documentos.reduce((acc, doc) => {
      const tipo = doc.tipo || 'unknown'
      acc[tipo] = (acc[tipo] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byStatus = documentos.reduce((acc, doc) => {
      const status = doc.status?.toLowerCase() || 'pendente'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total,
      filtered,
      criados: byTipo.criado || 0,
      uploads: byTipo.upload || 0,
      aprovados: byStatus.aprovado || 0,
      pendentes: byStatus.pendente || 0,
      rejeitados: byStatus.rejeitado || 0,
      rascunhos: byStatus.rascunho || 0,
    }
  }, [documentos, filteredAndSortedDocumentos])

  // Extrair equipes únicas dos documentos
  const equipes = useMemo(() => {
    const equipesMap = new Map()
    documentos.forEach((doc) => {
      if (doc.equipeId) {
        equipesMap.set(doc.equipeId, { id: doc.equipeId })
      }
    })
    return Array.from(equipesMap.values())
  }, [documentos])

  // Extrair autores únicos dos documentos
  const autores = useMemo(() => {
    const autoresMap = new Map()
    documentos.forEach((doc) => {
      if (doc.criadoPor) {
        autoresMap.set(doc.criadoPor, { id: doc.criadoPor })
      }
    })
    return Array.from(autoresMap.values())
  }, [documentos])

  return {
    filters,
    setFilters,
    filteredDocumentos: filteredAndSortedDocumentos,
    stats,
    equipes,
    autores,
  }
}
