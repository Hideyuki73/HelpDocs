'use client'

import {
  Box,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Heading,
  Text,
  useColorModeValue,
  HStack,
  Icon,
  VStack,
} from '@chakra-ui/react'
import { FiUsers, FiFolder, FiTrendingUp, FiTarget } from 'react-icons/fi'
import { EquipeStats } from '../types'
import { useAuth } from '@/app/user/hooks/useAuth'

interface DashboardEquipesProps {
  stats: EquipeStats | null
  loading: boolean
}

export function DashboardEquipes({ stats, loading }: DashboardEquipesProps) {
  const { user } = useAuth()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const isAdmin = user?.cargo === 'Administrador'
  const isGerente = user?.cargo === 'Gerente de Projetos'
  const canViewStats = isAdmin || isGerente

  if (!canViewStats) {
    return (
      <Box
        p={6}
        textAlign="center"
      >
        <Text color="gray.500">Dashboard disponível apenas para Administradores e Gerentes de Projetos.</Text>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box p={6}>
        <Text>Carregando estatísticas...</Text>
      </Box>
    )
  }

  if (!stats) {
    return (
      <Box
        p={6}
        textAlign="center"
      >
        <Text color="gray.500">Não foi possível carregar as estatísticas das equipes.</Text>
      </Box>
    )
  }

  const statCards = [
    {
      label: 'Total de Equipes',
      value: stats.totalEquipes,
      helpText: 'Equipes ativas na empresa',
      icon: FiUsers,
      color: 'blue',
    },
    {
      label: 'Total de Membros',
      value: stats.totalMembros,
      helpText: 'Funcionários em equipes',
      icon: FiTarget,
      color: 'green',
    },
    {
      label: 'Com Documentos',
      value: stats.equipesComDocumento,
      helpText: 'Equipes com documentos associados',
      icon: FiFolder,
      color: 'purple',
    },
    {
      label: 'Média por Equipe',
      value: stats.mediaMembrosPorEquipe,
      helpText: 'Membros por equipe em média',
      icon: FiTrendingUp,
      color: 'orange',
    },
  ]

  return (
    <Box p={6}>
      <VStack
        spacing={6}
        align="stretch"
      >
        <Box>
          <Heading
            size="lg"
            mb={2}
          >
            Dashboard de Equipes
          </Heading>
          <Text color="gray.600">Visão geral das equipes da empresa</Text>
        </Box>

        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
          gap={6}
        >
          {statCards.map((stat, index) => (
            <GridItem key={index}>
              <Card
                bg={cardBg}
                borderColor={borderColor}
                borderWidth={1}
                borderRadius="lg"
                shadow="sm"
                _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                <CardBody>
                  <Stat>
                    <HStack
                      justify="space-between"
                      align="start"
                      mb={2}
                    >
                      <Box>
                        <StatLabel
                          fontSize="sm"
                          color="gray.600"
                        >
                          {stat.label}
                        </StatLabel>
                        <StatNumber
                          fontSize="2xl"
                          fontWeight="bold"
                        >
                          {stat.value}
                        </StatNumber>
                      </Box>
                      <Icon
                        as={stat.icon}
                        boxSize={8}
                        color={`${stat.color}.500`}
                        opacity={0.8}
                      />
                    </HStack>
                    <StatHelpText
                      fontSize="xs"
                      color="gray.500"
                      mb={0}
                    >
                      {stat.helpText}
                    </StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>

        {stats.totalEquipes > 0 && (
          <Grid
            templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }}
            gap={6}
          >
            <GridItem>
              <Card
                bg={cardBg}
                borderColor={borderColor}
                borderWidth={1}
              >
                <CardBody>
                  <Heading
                    size="md"
                    mb={4}
                  >
                    Distribuição de Equipes
                  </Heading>
                  <VStack
                    spacing={3}
                    align="stretch"
                  >
                    <HStack justify="space-between">
                      <Text>Equipes com documentos:</Text>
                      <Text
                        fontWeight="bold"
                        color="green.500"
                      >
                        {stats.equipesComDocumento}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Equipes sem documentos:</Text>
                      <Text
                        fontWeight="bold"
                        color="orange.500"
                      >
                        {stats.equipeSemDocumento}
                      </Text>
                    </HStack>
                    <Box
                      pt={2}
                      borderTop="1px solid"
                      borderColor={borderColor}
                    >
                      <HStack justify="space-between">
                        <Text fontWeight="medium">Total:</Text>
                        <Text fontWeight="bold">{stats.totalEquipes}</Text>
                      </HStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>

            <GridItem>
              <Card
                bg={cardBg}
                borderColor={borderColor}
                borderWidth={1}
              >
                <CardBody>
                  <Heading
                    size="md"
                    mb={4}
                  >
                    Análise de Membros
                  </Heading>
                  <VStack
                    spacing={3}
                    align="stretch"
                  >
                    <HStack justify="space-between">
                      <Text>Total de membros:</Text>
                      <Text
                        fontWeight="bold"
                        color="blue.500"
                      >
                        {stats.totalMembros}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>Média por equipe:</Text>
                      <Text
                        fontWeight="bold"
                        color="purple.500"
                      >
                        {stats.mediaMembrosPorEquipe}
                      </Text>
                    </HStack>
                    <Box
                      pt={2}
                      borderTop="1px solid"
                      borderColor={borderColor}
                    >
                      <Text
                        fontSize="sm"
                        color="gray.600"
                      >
                        {stats.totalEquipes > 0
                          ? `Distribuição equilibrada entre ${stats.totalEquipes} equipe${
                              stats.totalEquipes > 1 ? 's' : ''
                            }`
                          : 'Nenhuma equipe criada ainda'}
                      </Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        )}
      </VStack>
    </Box>
  )
}
