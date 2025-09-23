'use client'

import { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  GridItem,
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Spinner,
  Center,
  Badge,
  Text,
} from '@chakra-ui/react'
import { FaSave, FaArrowLeft, FaRobot } from 'react-icons/fa'
import { useRouter, useParams } from 'next/navigation'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase'
import { ChatIA } from '../../components/ChatIA'

interface Documento {
  id: string
  titulo: string
  descricao: string
  conteudo: string
  tipo: 'criado' | 'upload'
  status: 'rascunho' | 'publicado' | 'arquivado'
  equipeId: string
  versao: number
  dataCriacao: string
  dataAtualizacao?: string
}

export default function EditarDocumentoPage() {
  const [user, loading] = useAuthState(auth)
  const router = useRouter()
  const params = useParams()
  const toast = useToast()

  const [documento, setDocumento] = useState<Documento | null>(null)
  const [loadingDoc, setLoadingDoc] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    conteudo: '',
    status: 'rascunho' as 'rascunho' | 'publicado' | 'arquivado',
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/user/login')
      return
    }

    if (user && params.slug) {
      carregarDocumento()
    }
  }, [user, loading, params.slug, router])

  const carregarDocumento = async () => {
    if (!user) return
    try {
      setLoadingDoc(true)
      const response = await fetch(`/api/documentos/${params.slug}?usuarioId=${user.uid}`)
      if (response.ok) {
        const doc = await response.json()
        setDocumento(doc)
        setFormData({
          titulo: doc.titulo,
          descricao: doc.descricao,
          conteudo: doc.conteudo || '',
          status: doc.status,
        })
      } else if (response.status === 403) {
        toast({
          title: 'Acesso negado',
          description: 'Você não tem permissão para acessar este documento.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        router.push('/documentos')
      } else {
        throw new Error('Documento não encontrado')
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o documento.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoadingDoc(false)
    }
  }

  const salvarDocumento = async () => {
    if (!user) return
    try {
      setSaving(true)
      const response = await fetch(`/api/documentos/${params.slug}?usuarioId=${user.uid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const atualizado = await response.json()
        setDocumento(atualizado)
        toast({
          title: 'Sucesso',
          description: 'Documento atualizado com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        throw new Error('Erro ao atualizar documento')
      }
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as alterações.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  const publicarDocumento = async () => {
    const novoFormData = { ...formData, status: 'publicado' as const }
    setFormData(novoFormData)

    try {
      setSaving(true)

      const response = await fetch(`/api/documentos/${params.slug}?usuarioId=${user?.uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novoFormData),
      })

      if (response.ok) {
        const docAtualizado = await response.json()
        setDocumento(docAtualizado)

        toast({
          title: 'Sucesso',
          description: 'Documento publicado com sucesso',
          status: 'success',
          duration: 3000,
        })
      } else {
        throw new Error('Erro ao publicar documento')
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao publicar documento',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading || loadingDoc) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (!documento) {
    return null
  }

  // Se for documento de upload, não permite edição do conteúdo
  if (documento.tipo === 'upload') {
    return (
      <Container
        maxW="4xl"
        py={8}
      >
        <VStack
          spacing={6}
          align="stretch"
        >
          <HStack justify="space-between">
            <Button
              leftIcon={<FaArrowLeft />}
              onClick={() => router.push('/documentos')}
            >
              Voltar
            </Button>
          </HStack>

          <Box
            textAlign="center"
            py={12}
          >
            <Heading
              size="lg"
              mb={4}
            >
              Documento de Upload
            </Heading>
            <Text
              color="gray.600"
              mb={6}
            >
              Este documento foi enviado como arquivo e não pode ser editado diretamente.
            </Text>
            <Text
              fontSize="lg"
              fontWeight="bold"
            >
              {documento.titulo}
            </Text>
            <Text color="gray.600">{documento.descricao}</Text>
          </Box>
        </VStack>
      </Container>
    )
  }

  return (
    <Container
      maxW="full"
      py={4}
    >
      <Grid
        templateColumns="1fr 400px"
        gap={6}
        h="calc(100vh - 120px)"
      >
        {/* Editor Principal */}
        <GridItem>
          <VStack
            spacing={4}
            align="stretch"
            h="full"
          >
            {/* Header */}
            <HStack justify="space-between">
              <HStack>
                <Button
                  leftIcon={<FaArrowLeft />}
                  onClick={() => router.push('/documentos')}
                  variant="ghost"
                >
                  Voltar
                </Button>
                <Badge colorScheme={documento.status === 'publicado' ? 'green' : 'yellow'}>{documento.status}</Badge>
                <Text
                  fontSize="sm"
                  color="gray.600"
                >
                  Versão {documento.versao}
                </Text>
              </HStack>

              <HStack>
                <Button
                  leftIcon={<FaRobot />}
                  onClick={() => setShowChat(!showChat)}
                  colorScheme={showChat ? 'blue' : 'gray'}
                  variant={showChat ? 'solid' : 'outline'}
                >
                  {showChat ? 'Ocultar' : 'Mostrar'} IA
                </Button>
                <Button
                  leftIcon={<FaSave />}
                  onClick={salvarDocumento}
                  isLoading={saving}
                  loadingText="Salvando..."
                  colorScheme="blue"
                  variant="outline"
                >
                  Salvar
                </Button>
                {documento.status !== 'publicado' && (
                  <Button
                    onClick={publicarDocumento}
                    isLoading={saving}
                    loadingText="Publicando..."
                    colorScheme="green"
                  >
                    Publicar
                  </Button>
                )}
              </HStack>
            </HStack>

            {/* Formulário de Edição */}
            <VStack
              spacing={4}
              align="stretch"
              flex={1}
            >
              <FormControl>
                <FormLabel>Título</FormLabel>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  size="lg"
                  fontWeight="bold"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Descrição</FormLabel>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={2}
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel>Conteúdo</FormLabel>
                <Textarea
                  value={formData.conteudo}
                  onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                  placeholder="Digite o conteúdo do documento aqui..."
                  resize="none"
                  h="full"
                  fontFamily="mono"
                />
              </FormControl>
            </VStack>
          </VStack>
        </GridItem>

        {/* Chat IA */}
        {showChat && (
          <GridItem>
            <Box
              h="full"
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
            >
              <ChatIA
                contextoDocumento={`Título: ${formData.titulo}\nDescrição: ${formData.descricao}\nConteúdo: ${formData.conteudo}`} user={null}              />
            </Box>
          </GridItem>
        )}
      </Grid>
    </Container>
  )
}