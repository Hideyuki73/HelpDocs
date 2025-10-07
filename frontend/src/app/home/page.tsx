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
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Badge,
  Flex,
  Spacer,
  Icon,
} from '@chakra-ui/react'
import { 
  FaPlus, 
  FaUpload, 
  FaUsers, 
  FaFileAlt, 
  FaTasks, 
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHome
} from 'react-icons/fa'
import { useAuth } from '@/app/user/hooks/useAuth'
import { useEquipes } from '@/app/equipes/hooks/useEquipes'
import { useDocumentos } from '@/app/documentos/hooks/useDocumentos'
import { EquipeCard } from '@/app/equipes/components/EquipeCard'
import { DocumentoCard } from '@/app/documentos/components/DocumentoCard'
import { ModalCriarEquipe } from '@/app/equipes/components/ModalCriarEquipe'
import { ModalEditarEquipe } from '@/app/equipes/components/ModalEditarEquipe'
import { CriarDocumentoModal } from '@/app/documentos/components/CriarDocumentoModal'
import { UploadDocumentoModal } from '@/app/documentos/components/UploadDocumentoModal'
import { AtribuirDocumentoModal } from '@/app/documentos/components/AtribuirDocumentoModal'
import { Equipe } from '@/app/equipes/types'
import { Documento } from '@/action/documento'

export default function HomePage() {
  const { user } = useAuth()
  const { 
    equipes, 
    stats: statsEquipes, 
    loading: loadingEquipes, 
    error: errorEquipes, 
    criar: criarEquipe, 
    atualizar: atualizarEquipe, 
    deletar: deletarEquipe, 
    limparErro: limparErroEquipes 
  } = useEquipes()
  
  const { 
    documentos, 
    stats: statsDocumentos, 
    loading: loadingDocumentos, 
    error: errorDocumentos, 
    criar: criarDocumento, 
    atualizar: atualizarDocumento, 
    deletar: deletarDocumento, 
    limparErro: limparErroDocumentos 
  } = useDocumentos()

  const [equipeParaEditar, setEquipeParaEditar] = useState<Equipe | null>(null)
  const [documentoParaAtribuir, setDocumentoParaAtribuir] = useState<Documento | null>(null)

  // Modals para Equipes
  const { isOpen: isCreateEquipeModalOpen, onOpen: onCreateEquipeModalOpen, onClose: onCreateEquipeModalClose } = useDisclosure()
  const { isOpen: isEditEquipeModalOpen, onOpen: onEditEquipeModalOpen, onClose: onEditEquipeModalClose } = useDisclosure()

  // Modals para Documentos
  const { isOpen: isCreateDocModalOpen, onOpen: onCreateDocModalOpen, onClose: onCreateDocModalClose } = useDisclosure()
  const { isOpen: isUploadDocModalOpen, onOpen: onUploadDocModalOpen, onClose: onUploadDocModalClose } = useDisclosure()
  const { isOpen: isAtribuirDocModalOpen, onOpen: onAtribuirDocModalOpen, onClose: onAtribuirDocModalClose } = useDisclosure()

  const bg = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const isAdmin = user?.cargo === 'Administrador'
  const isGerente = user?.cargo === 'Gerente de Projetos'
  const canCreateTeam = isAdmin || isGerente
  const canCreateDocument = isAdmin || isGerente
  const canViewDashboard = isAdmin || isGerente

  const handleEditEquipe = (equipe: Equipe) => {
    setEquipeParaEditar(equipe)
    onEditEquipeModalOpen()
  }

  const handleCloseEditEquipeModal = () => {
    setEquipeParaEditar(null)
    onEditEquipeModalClose()
  }

  const handleAtribuirDocumento = (documento: Documento) => {
    setDocumentoParaAtribuir(documento)
    onAtribuirDocModalOpen()
  }

  const handleCloseAtribuirDocModal = () => {
    setDocumentoParaAtribuir(null)
    onAtribuirDocModalClose()
  }

  const handleDeleteDocumento = (id: string) => {
    if (user && user.id) {
      deletarDocumento(id, user.id as string)
    }
  }

  const loading = loadingEquipes || loadingDocumentos
  const error = errorEquipes || errorDocumentos

  if (loading && equipes.length === 0 && documentos.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="lg" />
          <Text>Carregando dashboard...</Text>
        </VStack>
      </Container>
    )
  }

  return (
    <Box bg={bg} minH="100vh">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Icon as={FaHome} boxSize={8} color="blue.500" />
              <Box>
                <Heading size="xl">Dashboard Principal</Heading>
                <Text color="gray.600">
                  Bem-vindo(a), {user?.nome}! Aqui está um resumo das suas atividades.
                </Text>
              </Box>
            </HStack>
            <HStack spacing={4}>
              {canCreateTeam && (
                <Button
                  leftIcon={<FaUsers />}
                  colorScheme="blue"
                  onClick={onCreateEquipeModalOpen}
                  size="sm"
                >
                  Nova Equipe
                </Button>
              )}
              {canCreateDocument && (
                <>
                  <Button
                    leftIcon={<FaPlus />}
                    colorScheme="green"
                    onClick={onCreateDocModalOpen}
                    size="sm"
                  >
                    Criar Documento
                  </Button>
                  <Button
                    leftIcon={<FaUpload />}
                    colorScheme="orange"
                    onClick={onUploadDocModalOpen}
                    size="sm"
                  >
                    Upload
                  </Button>
                </>
              )}
            </HStack>
          </HStack>

          {/* Error Alerts */}
          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
              <Button
                ml="auto"
                size="sm"
                onClick={() => {
                  limparErroEquipes()
                  limparErroDocumentos()
                }}
              >
                Fechar
              </Button>
            </Alert>
          )}

          {/* Dashboard Stats */}
          {canViewDashboard && (
            <Card bg={cardBg}>
              <CardHeader>
                <Heading size="md">Resumo Geral</Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                  <Stat>
                    <StatLabel>
                      <HStack>
                        <Icon as={FaUsers} color="blue.500" />
                        <Text>Total de Equipes</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber>{statsEquipes?.totalEquipes || 0}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Ativas na empresa
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel>
                      <HStack>
                        <Icon as={FaFileAlt} color="green.500" />
                        <Text>Total de Documentos</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber>{statsDocumentos?.totalDocumentos || 0}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Disponíveis
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel>
                      <HStack>
                        <Icon as={FaTasks} color="orange.500" />
                        <Text>Documentos Pendentes</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber>{statsDocumentos?.documentosPendentes || 0}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="decrease" />
                      Aguardando revisão
                    </StatHelpText>
                  </Stat>

                  <Stat>
                    <StatLabel>
                      <HStack>
                        <Icon as={FaCheckCircle} color="purple.500" />
                        <Text>Documentos Aprovados</Text>
                      </HStack>
                    </StatLabel>
                    <StatNumber>{statsDocumentos?.documentosAprovados || 0}</StatNumber>
                    <StatHelpText>
                      <StatArrow type="increase" />
                      Este mês
                    </StatHelpText>
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>
          )}

          {/* Tabs */}
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>
                <HStack>
                  <Icon as={FaUsers} />
                  <Text>Minhas Equipes ({equipes.length})</Text>
                </HStack>
              </Tab>
              <Tab>
                <HStack>
                  <Icon as={FaFileAlt} />
                  <Text>Meus Documentos ({documentos.length})</Text>
                </HStack>
              </Tab>
              {canViewDashboard && (
                <Tab>
                  <HStack>
                    <Icon as={FaChartLine} />
                    <Text>Analytics</Text>
                  </HStack>
                </Tab>
              )}
            </TabList>

            <TabPanels>
              {/* Tab Equipes */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  <Flex align="center">
                    <Heading size="md">Suas Equipes</Heading>
                    <Spacer />
                    {canCreateTeam && (
                      <Button
                        leftIcon={<FaPlus />}
                        colorScheme="blue"
                        size="sm"
                        onClick={onCreateEquipeModalOpen}
                      >
                        Nova Equipe
                      </Button>
                    )}
                  </Flex>

                  {equipes.length === 0 ? (
                    <Card bg={cardBg}>
                      <CardBody textAlign="center" py={12}>
                        <Icon as={FaUsers} boxSize={12} color="gray.400" mb={4} />
                        <Text fontSize="lg" color="gray.500" mb={4}>
                          {canCreateTeam ? 'Nenhuma equipe criada ainda' : 'Você não faz parte de nenhuma equipe'}
                        </Text>
                        {canCreateTeam && (
                          <Button
                            leftIcon={<FaPlus />}
                            colorScheme="blue"
                            onClick={onCreateEquipeModalOpen}
                          >
                            Criar Primeira Equipe
                          </Button>
                        )}
                      </CardBody>
                    </Card>
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
                          onDelete={deletarEquipe}
                          onEdit={handleEditEquipe}
                          onViewDetails={(equipe) => console.log('Ver detalhes:', equipe)}
                        />
                      ))}
                    </Grid>
                  )}
                </VStack>
              </TabPanel>

              {/* Tab Documentos */}
              <TabPanel px={0}>
                <VStack spacing={6} align="stretch">
                  <Flex align="center">
                    <Heading size="md">Seus Documentos</Heading>
                    <Spacer />
                    {canCreateDocument && (
                      <HStack spacing={2}>
                        <Button
                          leftIcon={<FaPlus />}
                          colorScheme="green"
                          size="sm"
                          onClick={onCreateDocModalOpen}
                        >
                          Criar
                        </Button>
                        <Button
                          leftIcon={<FaUpload />}
                          colorScheme="orange"
                          size="sm"
                          onClick={onUploadDocModalOpen}
                        >
                          Upload
                        </Button>
                      </HStack>
                    )}
                  </Flex>

                  {documentos.length === 0 ? (
                    <Card bg={cardBg}>
                      <CardBody textAlign="center" py={12}>
                        <Icon as={FaFileAlt} boxSize={12} color="gray.400" mb={4} />
                        <Text fontSize="lg" color="gray.500" mb={4}>
                          {canCreateDocument ? 'Nenhum documento criado ainda' : 'Você não tem acesso a nenhum documento'}
                        </Text>
                        {canCreateDocument && (
                          <HStack spacing={4} justify="center">
                            <Button
                              leftIcon={<FaPlus />}
                              colorScheme="green"
                              onClick={onCreateDocModalOpen}
                            >
                              Criar Documento
                            </Button>
                            <Button
                              leftIcon={<FaUpload />}
                              colorScheme="orange"
                              onClick={onUploadDocModalOpen}
                            >
                              Upload de Arquivo
                            </Button>
                          </HStack>
                        )}
                      </CardBody>
                    </Card>
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
                      {documentos.map((documento) => (
                        <DocumentoCard
                          key={documento.id}
                          documento={documento}
                          onDelete={handleDeleteDocumento}
                          onEdit={atualizarDocumento}
                          onAtribuir={handleAtribuirDocumento}
                        />
                      ))}
                    </Grid>
                  )}
                </VStack>
              </TabPanel>

              {/* Tab Analytics */}
              {canViewDashboard && (
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    <Heading size="md">Analytics e Relatórios</Heading>
                    
                    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                      {/* Card de Atividade Recente */}
                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="sm">Atividade Recente</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <HStack>
                              <Icon as={FaCheckCircle} color="green.500" />
                              <Text fontSize="sm">3 documentos aprovados hoje</Text>
                              <Spacer />
                              <Badge colorScheme="green">Hoje</Badge>
                            </HStack>
                            <HStack>
                              <Icon as={FaUsers} color="blue.500" />
                              <Text fontSize="sm">2 novas equipes criadas</Text>
                              <Spacer />
                              <Badge colorScheme="blue">Esta semana</Badge>
                            </HStack>
                            <HStack>
                              <Icon as={FaClock} color="orange.500" />
                              <Text fontSize="sm">5 documentos pendentes</Text>
                              <Spacer />
                              <Badge colorScheme="orange">Pendente</Badge>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>

                      {/* Card de Status */}
                      <Card bg={cardBg}>
                        <CardHeader>
                          <Heading size="sm">Status do Sistema</Heading>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={3} align="stretch">
                            <HStack>
                              <Icon as={FaCheckCircle} color="green.500" />
                              <Text fontSize="sm">Sistema operacional</Text>
                              <Spacer />
                              <Badge colorScheme="green">Online</Badge>
                            </HStack>
                            <HStack>
                              <Icon as={FaUsers} color="blue.500" />
                              <Text fontSize="sm">{statsEquipes?.totalEquipes || 0} equipes ativas</Text>
                              <Spacer />
                              <Badge colorScheme="blue">Ativo</Badge>
                            </HStack>
                            <HStack>
                              <Icon as={FaFileAlt} color="purple.500" />
                              <Text fontSize="sm">{statsDocumentos?.totalDocumentos || 0} documentos no sistema</Text>
                              <Spacer />
                              <Badge colorScheme="purple">Total</Badge>
                            </HStack>
                          </VStack>
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      {/* Modals para Equipes */}
      <ModalCriarEquipe
        isOpen={isCreateEquipeModalOpen}
        onClose={onCreateEquipeModalClose}
        onSubmit={criarEquipe}
      />

      <ModalEditarEquipe
        isOpen={isEditEquipeModalOpen}
        onClose={handleCloseEditEquipeModal}
        onSubmit={atualizarEquipe}
        equipe={equipeParaEditar}
      />

      {/* Modals para Documentos */}
      <CriarDocumentoModal
        isOpen={isCreateDocModalOpen}
        onClose={onCreateDocModalClose}
        onSubmit={criarDocumento}
        equipes={equipes}
      />

      <UploadDocumentoModal
        isOpen={isUploadDocModalOpen}
        onClose={onUploadDocModalClose}
        onSubmit={criarDocumento}
        equipes={equipes}
      />

      <AtribuirDocumentoModal
        isOpen={isAtribuirDocModalOpen}
        onClose={handleCloseAtribuirDocModal}
        onSubmit={async (documentoId, equipeId, usuarioId) => {
          await atualizarDocumento(documentoId, { equipeId: equipeId }, usuarioId)
          handleCloseAtribuirDocModal()
        }}
        documento={documentoParaAtribuir}
      />
    </Box>
  )
}
