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
} from '@chakra-ui/react'
import { FaSearch, FaFilter, FaSortAmountDown, FaSortAmountUp, FaUsers } from 'react-icons/fa'
import { useState } from 'react'

export interface EquipesFiltersState {
  searchTerm: string
  sortBy: 'nome' | 'dataCriacao' | 'membros'
  sortOrder: 'asc' | 'desc'
  statusFilter: 'all' | 'ativa' | 'inativa'
}

interface EquipesFiltersProps {
  filters: EquipesFiltersState
  onFiltersChange: (filters: EquipesFiltersState) => void
  totalEquipes: number
  filteredCount: number
}

export function EquipesFilters({
  filters,
  onFiltersChange,
  totalEquipes,
  filteredCount,
}: EquipesFiltersProps) {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value })
  }

  const handleSortChange = (sortBy: EquipesFiltersState['sortBy']) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    onFiltersChange({ ...filters, sortBy, sortOrder: newSortOrder })
  }

  const handleStatusFilterChange = (statusFilter: EquipesFiltersState['statusFilter']) => {
    onFiltersChange({ ...filters, statusFilter })
  }

  const clearFilters = () => {
    onFiltersChange({
      searchTerm: '',
      sortBy: 'nome',
      sortOrder: 'asc',
      statusFilter: 'all',
    })
  }

  const hasActiveFilters = filters.searchTerm || filters.statusFilter !== 'all'

  return (
    <VStack spacing={4} align="stretch">
      <Flex align="center">
        <HStack spacing={2}>
          <Icon as={FaUsers} color="blue.500" />
          <Text fontWeight="medium">
            Equipes ({filteredCount} de {totalEquipes})
          </Text>
          {hasActiveFilters && (
            <Badge colorScheme="blue" variant="subtle">
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

      <HStack
        spacing={4}
        p={4}
        bg={bg}
        borderRadius="lg"
        border="1px"
        borderColor={borderColor}
        flexWrap="wrap"
      >
        {/* Busca */}
        <InputGroup maxW="300px" minW="200px">
          <InputLeftElement>
            <Icon as={FaSearch} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Buscar equipes..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            size="sm"
          />
        </InputGroup>

        {/* Filtro por Status */}
        <Select
          value={filters.statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value as EquipesFiltersState['statusFilter'])}
          size="sm"
          maxW="150px"
        >
          <option value="all">Todos os status</option>
          <option value="ativa">Ativas</option>
          <option value="inativa">Inativas</option>
        </Select>

        {/* Ordenação */}
        <ButtonGroup size="sm" isAttached variant="outline">
          <Button
            leftIcon={<Icon as={FaSortAmountDown} />}
            onClick={() => handleSortChange('nome')}
            colorScheme={filters.sortBy === 'nome' ? 'blue' : 'gray'}
            variant={filters.sortBy === 'nome' ? 'solid' : 'outline'}
          >
            Nome
            {filters.sortBy === 'nome' && (
              <Icon
                as={filters.sortOrder === 'asc' ? FaSortAmountUp : FaSortAmountDown}
                ml={1}
                boxSize={3}
              />
            )}
          </Button>
          <Button
            onClick={() => handleSortChange('dataCriacao')}
            colorScheme={filters.sortBy === 'dataCriacao' ? 'blue' : 'gray'}
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
            onClick={() => handleSortChange('membros')}
            colorScheme={filters.sortBy === 'membros' ? 'blue' : 'gray'}
            variant={filters.sortBy === 'membros' ? 'solid' : 'outline'}
          >
            Membros
            {filters.sortBy === 'membros' && (
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
  )
}
