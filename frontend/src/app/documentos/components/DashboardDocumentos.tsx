'use client'

import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Heading,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  GridItem,
  Grid,
  Icon,
} from '@chakra-ui/react'
import { FaFile, FaEdit, FaCheck, FaUpload } from 'react-icons/fa'
import { useAuth } from '@/app/user/hooks/useAuth'

interface DocumentoStats {
  totalDocumentos: number
  documentosCriados: number
  documentosUpload: number
  documentosPublicados: number
  documentosRascunho: number
  documentosArquivados: number
  porStatus: { [key: string]: number }
  porTipo: { [key: string]: number }
  porEquipe: { [key: string]: number }
}

interface DashboardDocumentosProps {
  stats: DocumentoStats | null
  loading: boolean
}

export function DashboardDocumentos({ stats, loading }: DashboardDocumentosProps) {
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
        <Text color="gray.500">Não foi possível carregar as estatísticas dos documentos.</Text>
      </Box>
    )
  }

  const statCards = [
    {
      label: 'Total de Documentos',
      value: stats.totalDocumentos,
      helpText: 'Documentos na plataforma',
      icon: FaFile,
      color: 'blue',
    },
    {
      label: 'Documentos Criados',
      value: stats.documentosCriados,
      helpText: 'Criados diretamente na plataforma',
      icon: FaEdit,
      color: 'green',
    },
    {
      label: 'Documentos Upload',
      value: stats.documentosUpload,
      helpText: 'Documentos enviados via upload',
      icon: FaUpload,
      color: 'purple',
    },
    {
      label: 'Documentos Publicados',
      value: stats.documentosPublicados,
      helpText: 'Documentos visíveis para usuários',
      icon: FaCheck,
      color: 'teal',
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
            Dashboard de Documentos
          </Heading>
          <Text color="gray.600">Visão geral dos documentos da empresa</Text>
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

        {stats.totalDocumentos > 0 && (
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
                    Documentos por Status
                  </Heading>
                  <VStack
                    spacing={3}
                    align="stretch"
                  >
                    {stats?.porStatus &&
                      Object.keys(stats.porStatus).map((status) => (
                        <HStack
                          key={status}
                          justify="space-between"
                        >
                          <Text>{status.charAt(0).toUpperCase() + status.slice(1)}:</Text>
                          <Text
                            fontWeight="bold"
                            color="blue.500"
                          >
                            {stats.porStatus[status]}
                          </Text>
                        </HStack>
                      ))}
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
                    Documentos por Tipo
                  </Heading>
                  <VStack
                    spacing={3}
                    align="stretch"
                  >
                    {!!stats.porTipo &&
                      Object.keys(stats.porTipo).map((tipo) => (
                        <HStack
                          key={tipo}
                          justify="space-between"
                        >
                          <Text>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}:</Text>
                          <Text
                            fontWeight="bold"
                            color="blue.500"
                          >
                            {stats.porTipo[tipo]}
                          </Text>
                        </HStack>
                      ))}
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          </Grid>
        )}

        {stats && stats.porEquipe && Object.keys(stats.porEquipe).length > 0 && (
          <Card bg={cardBg}>
            <CardBody>
              <Heading
                size="md"
                mb={4}
              >
                Documentos por Equipe
              </Heading>
              <VStack
                spacing={3}
                align="stretch"
              >
                {Object.keys(stats.porEquipe).map((equipeId) => (
                  <HStack
                    key={equipeId}
                    justify="space-between"
                  >
                    <Text fontWeight="bold">{stats.porEquipe[equipeId]}</Text>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  )
}
