'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  Badge,
  useDisclosure,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import { FaPlus, FaUpload, FaSearch, FaFile, FaEdit, FaTrash } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { auth } from '@/config/firebase'
import { useAuthState } from 'react-firebase-hooks/auth'
import { CriarDocumentoModal } from './components/CriarDocumentoModal'
import { UploadDocumentoModal } from './components/UploadDocumentoModal'
import { listarDocumentos, atribuirDocumentoAEquipe, listarDocumentosDisponiveisParaEquipe } from '@/action/documento'
import { listarEquipes, listarEquipesPorUsuario } from '@/action/equipe'
import { AtribuirDocumentoModal } from './components/AtribuirDocumentoModal'

interface Documento {
  id: string
  titulo: string
  descricao: string
  tipo: 'criado' | 'upload'
  status: 'rascunho' | 'publicado' | 'arquivado'
  equipeId: string
  criadoPor: string
  dataCriacao: string
  dataAtualizacao?: string
  versao: number
  nomeArquivo?: string
}

interface Equipe {
  id: string
  nome: string
}

export default function DocumentosPage() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [equipes, setEquipes] = useState<Equipe[]>([])
  const [loadingDocs, setLoadingDocs] = useState(true)
  const [filtroEquipe, setFiltroEquipe] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [busca, setBusca] = useState('')

  const { isOpen: isOpenCriar, onOpen: onOpenCriar, onClose: onCloseCriar } = useDisclosure()
  const { isOpen: isOpenUpload, onOpen: onOpenUpload, onClose: onCloseUpload } = useDisclosure()
  const { isOpen: isOpenAtribuir, onOpen: onOpenAtribuir, onClose: onCloseAtribuir } = useDisclosure()
  const [documentoSelecionado, setDocumentoSelecionado] = useState<Documento | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/user/login')
      return
    }

    if (user) {
      carregarDados()
    }
  }, [user, loading, router])

  const carregarDados = async () => {
    try {
      setLoadingDocs(true)

      if (!user) return

      // Carregar documentos
      const docs = await listarDocumentos(user.uid)
      setDocumentos(docs)

      // Carregar equipes
      const equipesData = await listarEquipesPorUsuario(user.uid)
      setEquipes(equipesData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoadingDocs(false)
    }
  }

  const documentosFiltrados = documentos.filter((doc) => {
    const matchEquipe = !filtroEquipe || doc.equipeId === filtroEquipe
    const matchTipo = !filtroTipo || doc.tipo === filtroTipo
    const matchStatus = !filtroStatus || doc.status === filtroStatus
    const matchBusca =
      !busca ||
      doc.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      doc.descricao.toLowerCase().includes(busca.toLowerCase())

    return matchEquipe && matchTipo && matchStatus && matchBusca
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'publicado':
        return 'green'
      case 'rascunho':
        return 'yellow'
      case 'arquivado':
        return 'gray'
      default:
        return 'blue'
    }
  }

  const getTipoIcon = (tipo: string) => {
    return tipo === 'upload' ? <FaFile /> : <FaEdit />
  }

  if (loading || loadingDocs) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Container
      maxW="7xl"
      py={8}
    >
      <VStack
        spacing={6}
        align="stretch"
      >
        {/* Header */}
        <Box>
          <Heading
            size="lg"
            mb={4}
          >
            Documentos
          </Heading>
          <HStack spacing={4}>
            <Button
              leftIcon={<FaPlus />}
              colorScheme="blue"
              onClick={onOpenCriar}
            >
              Criar Documento
            </Button>
            <Button
              leftIcon={<FaUpload />}
              colorScheme="green"
              onClick={onOpenUpload}
            >
              Upload de Arquivo
            </Button>
          </HStack>
        </Box>

        {/* Filtros */}
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <HStack
                spacing={4}
                w="full"
              >
                <InputGroup flex={2}>
                  <InputLeftElement>
                    <FaSearch />
                  </InputLeftElement>
                  <Input
                    placeholder="Buscar documentos..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </InputGroup>

                <Select
                  placeholder="Todas as equipes"
                  value={filtroEquipe}
                  onChange={(e) => setFiltroEquipe(e.target.value)}
                  flex={1}
                >
                  {equipes.map((equipe) => (
                    <option
                      key={equipe.id}
                      value={equipe.id}
                    >
                      {equipe.nome}
                    </option>
                  ))}
                </Select>

                <Select
                  placeholder="Todos os tipos"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  flex={1}
                >
                  <option value="criado">Criado</option>
                  <option value="upload">Upload</option>
                </Select>

                <Select
                  placeholder="Todos os status"
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  flex={1}
                >
                  <option value="rascunho">Rascunho</option>
                  <option value="publicado">Publicado</option>
                  <option value="arquivado">Arquivado</option>
                </Select>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Lista de Documentos */}
        {documentosFiltrados.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            {documentos.length === 0
              ? 'Nenhum documento encontrado. Crie seu primeiro documento!'
              : 'Nenhum documento encontrado com os filtros aplicados.'}
          </Alert>
        ) : (
          <VStack
            spacing={4}
            align="stretch"
          >
            {documentosFiltrados.map((documento) => (
              <Card
                key={documento.id}
                cursor="pointer"
                _hover={{ shadow: 'md' }}
              >
                <CardBody>
                  <HStack justify="space-between">
                    <VStack
                      align="start"
                      spacing={2}
                      flex={1}
                    >
                      <HStack>
                        {getTipoIcon(documento.tipo)}
                        <Heading size="md">{documento.titulo}</Heading>
                        <Badge colorScheme={getStatusColor(documento.status)}>{documento.status}</Badge>
                        {documento.tipo === 'upload' && <Badge colorScheme="purple">{documento.nomeArquivo}</Badge>}
                      </HStack>
                      <Text color="gray.600">{documento.descricao}</Text>
                      <HStack
                        spacing={4}
                        fontSize="sm"
                        color="gray.500"
                      >
                        <Text>Versão {documento.versao}</Text>
                        <Text>Criado em {new Date(documento.dataCriacao).toLocaleDateString()}</Text>
                        {documento.dataAtualizacao && (
                          <Text>Atualizado em {new Date(documento.dataAtualizacao).toLocaleDateString()}</Text>
                        )}
                      </HStack>
                    </VStack>

                    <HStack>
                      <Button
                        size="sm"
                        leftIcon={<FaEdit />}
                        onClick={() => router.push(`/documentos/${documento.id}/editar`)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => {
                          setDocumentoSelecionado(documento)
                          onOpenAtribuir()
                        }}
                      >
                        Atribuir à Equipe
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        leftIcon={<FaTrash />}
                      >
                        Excluir
                      </Button>
                    </HStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>

      {/* Modais */}
      <CriarDocumentoModal
        isOpen={isOpenCriar}
        onClose={onCloseCriar}
        equipes={equipes}
        onSuccess={carregarDados}
      />

      <UploadDocumentoModal
        isOpen={isOpenUpload}
        onClose={onCloseUpload}
        equipes={equipes}
        onSuccess={carregarDados}
      />

      <AtribuirDocumentoModal
        isOpen={isOpenAtribuir}
        onClose={onCloseAtribuir}
        documento={documentoSelecionado}
        onSuccess={carregarDados}
      />
    </Container>
  )
}
