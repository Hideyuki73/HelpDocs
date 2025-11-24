'use client'

import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Grid,
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
import { FaPlus, FaUpload } from 'react-icons/fa'
import { useAuth } from '@/app/user/hooks/useAuth'
import { useDocumentos } from './hooks/useDocumentos'
import { useEquipes } from '@/app/equipes/hooks/useEquipes'
import { CriarDocumentoModal } from './components/CriarDocumentoModal'
import { UploadDocumentoModal } from './components/UploadDocumentoModal'
import { AtribuirDocumentoModal } from './components/AtribuirDocumentoModal'
import { DocumentoCard } from './components/DocumentoCard'
import { DashboardDocumentos } from './components/DashboardDocumentos'
import { Documento } from '@/action/documento'

export default function DocumentosPage() {
  const { user } = useAuth()
  const { documentos, stats, loading, error, criar, atualizar, deletar, limparErro } = useDocumentos()
  const { equipes: todasEquipes, loading: loadingEquipes } = useEquipes()

  const [documentoParaAtribuir, setDocumentoParaAtribuir] = useState<Documento | null>(null)

  const { isOpen: isCreateModalOpen, onOpen: onCreateModalOpen, onClose: onCreateModalClose } = useDisclosure()
  const { isOpen: isUploadModalOpen, onOpen: onUploadModalOpen, onClose: onUploadModalClose } = useDisclosure()
  const { isOpen: isAtribuirModalOpen, onOpen: onAtribuirModalOpen, onClose: onAtribuirModalClose } = useDisclosure()

  const bg = useColorModeValue('gray.50', 'gray.900')
  const isAdmin = user?.cargo === 'Administrador'
  const isGerente = user?.cargo === 'Gerente de Projetos'
  const canCreateDocument = isAdmin || isGerente
  const canViewDashboard = isAdmin || isGerente

  const handleAtribuirDocumento = (documento: Documento) => {
    setDocumentoParaAtribuir(documento)
    onAtribuirModalOpen()
  }

  const handleCloseAtribuirModal = () => {
    setDocumentoParaAtribuir(null)
    onAtribuirModalClose()
  }

  const handleDelete = (id: string) => {
    if (user && user.id) {
      console.log(
        'Deletando documento com ID:',
        id,
        'pelo usuário ID:',
        user.id,
        '(Tipo de user.uid:',
        typeof user.id,
        ')',
      )
      deletar(id, user.id as string)
    } else {
      console.error('Usuário não autenticado ou UID não disponível para deletar documento.')
    }
  }

  if (loading && documentos.length === 0) {
    return (
      <Container
        maxW="container.xl"
        py={8}
      >
        <VStack spacing={4}>
          <Spinner size="lg" />
          <Text>Carregando documentos...</Text>
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
              <Heading size="lg">Documentos</Heading>
              <Text color="gray.600">{canViewDashboard ? 'Gerencie os documentos da empresa' : 'Seus documentos'}</Text>
            </Box>
            {canCreateDocument && (
              <HStack spacing={4}>
                <Button
                  leftIcon={<FaPlus />}
                  colorScheme="blue"
                  onClick={onCreateModalOpen}
                >
                  Criar Documento
                </Button>
                <Button
                  leftIcon={<FaUpload />}
                  colorScheme="green"
                  onClick={onUploadModalOpen}
                >
                  Upload de Arquivo
                </Button>
              </HStack>
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
              <Tab>Meus Documentos</Tab>
              {canViewDashboard && <Tab>Dashboard</Tab>}
            </TabList>

            <TabPanels>
              {/* Tab Documentos */}
              <TabPanel px={0}>
                {documentos.length === 0 ? (
                  <Box
                    textAlign="center"
                    py={12}
                  >
                    <Text
                      fontSize="lg"
                      color="gray.500"
                      mb={4}
                    >
                      {canCreateDocument ? 'Nenhum documento criado ainda' : 'Você não tem acesso a nenhum documento'}
                    </Text>
                    {canCreateDocument && (
                      <HStack
                        spacing={4}
                        justify="center"
                      >
                        <Button
                          leftIcon={<FaPlus />}
                          colorScheme="blue"
                          onClick={onCreateModalOpen}
                        >
                          Criar Primeiro Documento
                        </Button>
                        <Button
                          leftIcon={<FaUpload />}
                          colorScheme="green"
                          onClick={onUploadModalOpen}
                        >
                          Upload de Arquivo
                        </Button>
                      </HStack>
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
                    {!!user &&
                      documentos.map((documento) => (
                        <DocumentoCard
                          key={documento.id}
                          documento={documento}
                          onDelete={handleDelete}
                          onAtribuir={handleAtribuirDocumento}
                        />
                      ))}
                  </Grid>
                )}
              </TabPanel>

              {/* Tab Dashboard */}
              {canViewDashboard && (
                <TabPanel px={0}>
                  <DashboardDocumentos
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
      <CriarDocumentoModal
        isOpen={isCreateModalOpen}
        onClose={onCreateModalClose}
        onSubmit={criar}
        equipes={todasEquipes}
      />

      <UploadDocumentoModal
        isOpen={isUploadModalOpen}
        onClose={onUploadModalClose}
        onSubmit={criar}
        equipes={todasEquipes}
      />

      <AtribuirDocumentoModal
        isOpen={isAtribuirModalOpen}
        onClose={handleCloseAtribuirModal}
        onSubmit={async (documentoId, equipeId, usuarioId) => {
          await atualizar(documentoId, { equipeId: equipeId }, usuarioId)
          handleCloseAtribuirModal()
        }}
        documento={documentoParaAtribuir}
      />
    </Box>
  )
}
