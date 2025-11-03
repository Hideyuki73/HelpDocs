'use client'

import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Grid,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  useDisclosure,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
} from '@chakra-ui/react'
import { useAuth } from '@/app/user/hooks/useAuth'
import { useEquipes } from './hooks/useEquipes'
import { EquipeCard } from './components/EquipeCard'
import { ModalCriarEquipe } from './components/ModalCriarEquipe'
import { ModalEditarEquipe } from './components/ModalEditarEquipe'
import { DashboardEquipes } from './components/DashboardEquipes'
import { Equipe } from './types'
import { FaPlus } from 'react-icons/fa'

export default function EquipesPage() {
  const { user } = useAuth()
  const { equipes, stats, loading, error, criar, atualizar, deletar, limparErro } = useEquipes()

  const [equipeParaEditar, setEquipeParaEditar] = useState<Equipe | null>(null)

  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure()
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure()

  const bg = useColorModeValue('gray.50', 'gray.900')
  const isAdmin = user?.cargo === 'Administrador'
  const isGerente = user?.cargo === 'Gerente de Projetos'
  const canCreateTeam = isAdmin || isGerente
  const canViewDashboard = isAdmin || isGerente

  const handleEditEquipe = (equipe: Equipe) => {
    setEquipeParaEditar(equipe)
    onEditModalOpen()
  }

  const handleViewDetails = (equipe: Equipe) => {
    // TODO: Implementar visualização detalhada da equipe
    console.log('Ver detalhes da equipe:', equipe)
  }

  const handleCloseEditModal = () => {
    setEquipeParaEditar(null)
    onEditModalClose()
  }

  if (loading && equipes.length === 0) {
    return (
      <Container
        maxW="container.xl"
        py={8}
      >
        <VStack spacing={4}>
          <Spinner size="lg" />
          <Text>Carregando equipes...</Text>
        </VStack>
      </Container>
    )
  }

  return (
    <Box
      bg={bg}
      minH="100vh"
    >
      <Container
        maxW="container.xl"
        py={8}
      >
        <VStack
          spacing={6}
          align="stretch"
        >
          {/* Header */}
          <HStack
            justify="space-between"
            align="center"
          >
            <Box>
              <Heading size="lg">Equipes</Heading>
              <Text color="gray.600">{canViewDashboard ? 'Gerencie as equipes da empresa' : 'Suas equipes'}</Text>
            </Box>
            {canCreateTeam && (
              <Button
                leftIcon={<FaPlus />}
                colorScheme="blue"
                onClick={onCreateModalOpen}
              >
                Nova Equipe
              </Button>
            )}
          </HStack>

          {/* Error Alert */}
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
              <Button
                ml="auto"
                size="sm"
                onClick={limparErro}
              >
                Fechar
              </Button>
            </Alert>
          )}

          {/* Tabs */}
          <Tabs
            variant="enclosed"
            colorScheme="blue"
          >
            <TabList>
              <Tab>Minhas Equipes</Tab>
              {canViewDashboard && <Tab>Dashboard</Tab>}
            </TabList>

            <TabPanels>
              {/* Tab Equipes */}
              <TabPanel px={0}>
                {equipes.length === 0 ? (
                  <Box
                    textAlign="center"
                    py={12}
                  >
                    <Text
                      fontSize="lg"
                      color="gray.500"
                      mb={4}
                    >
                      {canCreateTeam ? 'Nenhuma equipe criada ainda' : 'Você não faz parte de nenhuma equipe'}
                    </Text>
                    {canCreateTeam && (
                      <Button
                        leftIcon={<FaPlus />}
                        colorScheme="blue"
                        onClick={onCreateModalOpen}
                      >
                        Criar Primeira Equipe
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Grid
                    templateColumns={{
                      base: '1fr',
                      md: 'repeat(2, 1fr)',
                      lg: 'repeat(3, 1fr)',
                      xl: 'repeat(4, 1fr)',
                    }}
                    gap={6}
                  >
                    {equipes.map((equipe) => (
                      <EquipeCard
                        key={equipe.id}
                        equipe={equipe}
                        onDelete={deletar}
                        onEdit={handleEditEquipe}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </Grid>
                )}
              </TabPanel>

              {/* Tab Dashboard */}
              {canViewDashboard && (
                <TabPanel px={0}>
                  <DashboardEquipes
                    stats={stats}
                    loading={loading}
                  />
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      {/* Modals */}
      <ModalCriarEquipe
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
        onSubmit={criar}
      />

      <ModalEditarEquipe
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={atualizar}
        equipe={equipeParaEditar}
      />
    </Box>
  )
}
