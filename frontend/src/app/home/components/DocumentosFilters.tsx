'use client'

import {
  HStack,
  VStack,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  ButtonGroup,
  Icon,
  Text,
  Badge,
  useColorModeValue,
  Flex,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Checkbox,
  CheckboxGroup,
  Stack,
} from '@chakra-ui/react'
import { 
  FaSearch, 
  FaFilter, 
  FaSortAmountDown, 
  FaSortAmountUp, 
  FaFileAlt,
  FaChevronDown,
  FaCalendarAlt,
  FaUser,
  FaTag
} from 'react-icons/fa'
import { useState } from 'react'

export interface DocumentosFiltersState {
  searchTerm: string
  sortBy: 'titulo' | 'dataCriacao' | 'dataAtualizacao' | 'tipo'
  sortOrder: 'asc' | 'desc'
  tipoFilter: 'all' | 'criado' | 'upload'
  statusFilter: string[]
  equipeFilter: 'all' | string
  autorFilter: 'all' | string
  dateRange: {
    start?: Date
    end?: Date
  }
}

interface DocumentosFiltersProps {
  filters: DocumentosFiltersState
  onFiltersChange: (filters: DocumentosFiltersState) => void
  totalDocumentos: number
  filteredCount: number
  equipes?: Array<{ id: string; nome: string }>
  autores?: Array<{ id: string; nome: string }>
}

export function DocumentosFilters({
  filters,
  onFiltersChange,
  totalDocumentos,
  filteredCount,
  equipes = [],
  autores = [],
}: DocumentosFiltersProps) {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value })
  }

  const handleSortChange = (sortBy: DocumentosFiltersState['sortBy']) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    onFiltersChange({ ...filters, sortBy, sortOrder: newSortOrder })
  }

  const handleTipoFilterChange = (tipoFilter: DocumentosFiltersState['tipoFilter']) => {
    onFiltersChange({ ...filters, tipoFilter })
  }

  const handleStatusFilterChange = (statusFilter: string[]) => {
    onFiltersChange({ ...filters, statusFilter })
  }

  const handleEquipeFilterChange = (equipeFilter: string) => {
    onFiltersChange({ ...filters, equipeFilter })
  }

  const handleAutorFilterChange = (autorFilter: string) => {
    onFiltersChange({ ...filters, autorFilter })
  }

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      sortBy: 'titulo',
      sortOrder: 'asc',
      tipoFilter: 'all',
      statusFilter: [],
      equipeFilter: 'all',
      autorFilter: 'all',
      dateRange: {},
    })
  }

  const hasActiveFilters = 
    filters.searchTerm || 
    filters.tipoFilter !== 'all' || 
    filters.statusFilter.length > 0 ||
    filters.equipeFilter !== 'all' ||
    filters.autorFilter !== 'all'

  const statusOptions = [
    { value: 'aprovado', label: 'Aprovado', color: 'green' },
    { value: 'pendente', label: 'Pendente', color: 'orange' },
    { value: 'rejeitado', label: 'Rejeitado', color: 'red' },
    { value: 'rascunho', label: 'Rascunho', color: 'gray' },
  ]

  return (
    <VStack spacing={4} align="stretch">
      <Flex align="center">
        <HStack spacing={2}>
          <Icon as={FaFileAlt} color="green.500" />
          <Text fontWeight="medium">
            Documentos ({filteredCount} de {totalDocumentos})
          </Text>
          {hasActiveFilters && (
            <Badge colorScheme="green" variant="subtle">
              Filtros ativos
            </Badge>
          )}
        </HStack>
        <Spacer />
        {hasActiveFilters && (
          <Button size="sm" variant="ghost" onClick={clearFilters}>
            Limpar filtros
          </Button>
        )}
      </Flex>

      <VStack
        spacing={4}
        p={4}
        bg={bg}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
      >
        {/* Primeira linha: Busca e Tipo */}
        <HStack spacing={4} w="full" flexWrap="wrap">
          {/* Busca */}
          <InputGroup maxW="400px" minW="250px" flex={1}>
            <InputLeftElement>
              <Icon as={FaSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar por título, conteúdo ou tags..."
              value={filters.searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              size="sm"
            />
          </InputGroup>

          {/* Filtro por Tipo */}
          <Select
            value={filters.tipoFilter}
            onChange={(e) => handleTipoFilterChange(e.target.value as DocumentosFiltersState['tipoFilter'])}
            size="sm"
            maxW="150px"
          >
            <option value="all">Todos os tipos</option>
            <option value="criado">Criados</option>
            <option value="upload">Uploads</option>
          </Select>

          {/* Filtro por Equipe */}
          <Select
            value={filters.equipeFilter}
            onChange={(e) => handleEquipeFilterChange(e.target.value)}
            size="sm"
            maxW="200px"
          >
            <option value="all">Todas as equipes</option>
            {equipes.map((equipe) => (
              <option key={equipe.id} value={equipe.id}>
                {equipe.nome}
              </option>
            ))}
          </Select>
        </HStack>

        {/* Segunda linha: Status e Ordenação */}
        <HStack spacing={4} w="full" flexWrap="wrap">
          {/* Filtro por Status */}
          <Menu closeOnSelect={false}>
            <MenuButton
              as={Button}
              rightIcon={<FaChevronDown />}
              size="sm"
              variant="outline"
              leftIcon={<Icon as={FaTag} />}
            >
              Status ({filters.statusFilter.length})
            </MenuButton>
            <MenuList>
              <CheckboxGroup
                value={filters.statusFilter}
                onChange={handleStatusFilterChange}
              >
                <Stack spacing={2} p={2}>
                  {statusOptions.map((status) => (
                    <Checkbox key={status.value} value={status.value}>
                      <HStack spacing={2}>
                        <Badge colorScheme={status.color} size="sm">
                          {status.label}
                        </Badge>
                      </HStack>
                    </Checkbox>
                  ))}
                </Stack>
              </CheckboxGroup>
            </MenuList>
          </Menu>

          {/* Filtro por Autor */}
          <Select
            value={filters.autorFilter}
            onChange={(e) => handleAutorFilterChange(e.target.value)}
            size="sm"
            maxW="200px"
          >
            <option value="all">Todos os autores</option>
            {autores.map((autor) => (
              <option key={autor.id} value={autor.id}>
                {autor.nome}
              </option>
            ))}
          </Select>

          <Spacer />

          {/* Ordenação */}
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button
              leftIcon={<Icon as={FaSortAmountDown} />}
              onClick={() => handleSortChange('titulo')}
              colorScheme={filters.sortBy === 'titulo' ? 'green' : 'gray'}
              variant={filters.sortBy === 'titulo' ? 'solid' : 'outline'}
            >
              Título
              {filters.sortBy === 'titulo' && (
                <Icon
                  as={filters.sortOrder === 'asc' ? FaSortAmountUp : FaSortAmountDown}
                  ml={1}
                  boxSize={3}
                />
              )}
            </Button>
            <Button
              leftIcon={<Icon as={FaCalendarAlt} />}
              onClick={() => handleSortChange('dataCriacao')}
              colorScheme={filters.sortBy === 'dataCriacao' ? 'green' : 'gray'}
              variant={filters.sortBy === 'dataCriacao' ? 'solid' : 'outline'}
            >
              Data
              {filters.sortBy === 'dataCriacao' && (
                <Icon
                  as={filters.sortOrder === 'asc' ? FaSortAmountUp : FaSortAmountDown}
                  ml={1}
                  boxSize={3}
                />
              )}
            </Button>
            <Button
              onClick={() => handleSortChange('tipo')}
              colorScheme={filters.sortBy === 'tipo' ? 'green' : 'gray'}
              variant={filters.sortBy === 'tipo' ? 'solid' : 'outline'}
            >
              Tipo
              {filters.sortBy === 'tipo' && (
                <Icon
                  as={filters.sortOrder === 'asc' ? FaSortAmountUp : FaSortAmountDown}
                  ml={1}
                  boxSize={3}
                />
              )}
            </Button>
          </ButtonGroup>
        </HStack>
      </VStack>
    </VStack>
  )
}
