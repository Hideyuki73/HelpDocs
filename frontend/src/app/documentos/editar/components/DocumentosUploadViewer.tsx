import {
  Container,
  VStack,
  HStack,
  Button,
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  Badge,
  Divider,
  Grid,
  GridItem,
  Icon,
  Tooltip,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Spacer,
} from '@chakra-ui/react'
import {
  FaArrowLeft,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFile,
  FaCalendarAlt,
  FaUser,
  FaFileAlt,
  FaTrash,
  FaEdit,
} from 'react-icons/fa'
import { useState, useRef } from 'react'
import { Documento } from '../types'
import { deletarDocumento, substituirDocumento } from '../../../../action/documento'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase'

interface DocumentoUploadViewerProps {
  documento: Documento
  onVoltar: () => void
}

export function DocumentoUploadViewer({ documento, onVoltar }: DocumentoUploadViewerProps) {
  const toast = useToast()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Função para determinar o ícone baseado no tipo de arquivo
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()

    switch (extension) {
      case 'pdf':
        return { icon: FaFilePdf, color: 'red.500' }
      case 'doc':
      case 'docx':
        return { icon: FaFileWord, color: 'blue.500' }
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return { icon: FaFileImage, color: 'green.500' }
      default:
        return { icon: FaFile, color: 'gray.500' }
    }
  }

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const [user] = useAuthState(auth)

  const handleReplaceFileClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!user?.uid) {
        toast({
          title: 'Erro de autenticação',
          description: 'Você precisa estar logado para substituir o documento.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }
      try {
        // Aqui você chamaria a action para substituir o documento
        // await substituirDocumento(documento.id, user.uid, file);
        await substituirDocumento(documento.id, user.uid, file)
        toast({
          title: 'Documento substituído',
          description: `O arquivo ${file.name} foi substituído com sucesso.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        console.error('Erro ao substituir documento:', error)
        toast({
          title: 'Erro na substituição',
          description: 'Não foi possível substituir o documento. Tente novamente.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }
  }

  const handleDeleteDocument = async () => {
    if (!user?.uid) {
      toast({
        title: 'Erro de autenticação',
        description: 'Você precisa estar logado para excluir o documento.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (window.confirm('Tem certeza que deseja excluir este documento? Esta ação não pode ser desfeita.')) {
      try {
        await deletarDocumento(documento.id, user.uid)
        toast({
          title: 'Documento excluído',
          description: 'O documento foi excluído com sucesso.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onVoltar() // Redireciona após a exclusão
      } catch (error) {
        console.error('Erro ao excluir documento:', error)
        toast({
          title: 'Erro na exclusão',
          description: 'Não foi possível excluir o documento. Tente novamente.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }
  }

  const fileInfo = getFileIcon(documento.titulo)

  // Dados simulados do arquivo
  const arquivoInfo = {
    nome: documento.titulo,
    tamanho: 2048576, // 2MB simulado
    dataUpload: new Date('2024-01-15'),
    autor: 'João Silva',
    downloads: 12,
    visualizacoes: 45,
  }

  return (
    <Container
      maxW="6xl"
      py={8}
    >
      <VStack
        spacing={8}
        align="stretch"
      >
        {/* Header */}
        <Card boxShadow="sm">
          <CardBody p={6}>
            <Flex
              align="center"
              wrap="wrap"
              gap={4}
            >
              <HStack>
                <Tooltip label="Voltar aos documentos">
                  <Button
                    leftIcon={<FaArrowLeft />}
                    onClick={onVoltar}
                    variant="ghost"
                    size="sm"
                  >
                    Voltar
                  </Button>
                </Tooltip>

                <Divider
                  orientation="vertical"
                  h="20px"
                />

                <VStack
                  align="start"
                  spacing={0}
                >
                  <HStack>
                    <Icon
                      as={fileInfo.icon}
                      color={fileInfo.color}
                      boxSize={5}
                    />
                    <Heading size="md">Documento de Upload</Heading>
                  </HStack>
                  <Text
                    fontSize="sm"
                    color="gray.600"
                  >
                    Arquivo enviado pelo usuário
                  </Text>
                </VStack>
              </HStack>

              <Spacer />

              <HStack spacing={2}>
                <Badge
                  colorScheme="blue"
                  variant="solid"
                >
                  {documento.status}
                </Badge>
                <Text
                  fontSize="sm"
                  color="gray.600"
                >
                  Versão {documento.versao}
                </Text>
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        {/* Informações do Arquivo */}
        <Grid
          templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
          gap={8}
        >
          {/* Painel Principal */}
          <GridItem>
            <VStack
              spacing={6}
              align="stretch"
            >
              {/* Preview do Arquivo */}
              <Card boxShadow="md">
                <CardBody p={8}>
                  <VStack spacing={6}>
                    <Box textAlign="center">
                      <Icon
                        as={fileInfo.icon}
                        color={fileInfo.color}
                        boxSize={20}
                        mb={4}
                      />
                      <Heading
                        size="lg"
                        mb={2}
                      >
                        {documento.titulo}
                      </Heading>
                      {documento.descricao && (
                        <Text
                          color="gray.600"
                          fontSize="lg"
                          mb={4}
                        >
                          {documento.descricao}
                        </Text>
                      )}
                      <Text
                        fontSize="md"
                        color="gray.500"
                      >
                        Tamanho: {formatFileSize(arquivoInfo.tamanho)}
                      </Text>
                    </Box>

                    <Divider />
                  </VStack>
                </CardBody>
              </Card>

              {/* Informações Adicionais */}
              <Card boxShadow="sm">
                <CardBody p={6}>
                  <Heading
                    size="md"
                    mb={4}
                  >
                    Sobre este documento
                  </Heading>
                  <VStack
                    align="stretch"
                    spacing={4}
                  >
                    <Alert
                      status="info"
                      borderRadius="md"
                    >
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Documento de Upload</AlertTitle>
                        <AlertDescription>
                          Este documento foi enviado como arquivo e não pode ser editado diretamente através do editor
                          de texto. Para fazer alterações, você precisará baixar o arquivo, editá-lo em um programa
                          apropriado e fazer um novo upload.
                        </AlertDescription>
                      </Box>
                    </Alert>

                    {documento.descricao && (
                      <Box>
                        <Text
                          fontWeight="semibold"
                          mb={2}
                        >
                          Descrição:
                        </Text>
                        <Text
                          color="gray.700"
                          lineHeight="1.6"
                        >
                          {documento.descricao}
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>

          {/* Painel Lateral */}
          <GridItem>
            <VStack
              spacing={6}
              align="stretch"
            >
              {/* Metadados do Arquivo */}
              <Card boxShadow="sm">
                <CardBody p={6}>
                  <Heading
                    size="sm"
                    mb={4}
                  >
                    Informações do Arquivo
                  </Heading>
                  <VStack
                    align="stretch"
                    spacing={3}
                  >
                    <HStack justify="space-between">
                      <HStack>
                        <Icon
                          as={FaFileAlt}
                          color="gray.500"
                        />
                        <Text fontSize="sm">Nome:</Text>
                      </HStack>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        textAlign="right"
                      >
                        {arquivoInfo.nome}
                      </Text>
                    </HStack>

                    <HStack justify="space-between">
                      <HStack>
                        <Icon
                          as={FaCalendarAlt}
                          color="gray.500"
                        />
                        <Text fontSize="sm">Upload:</Text>
                      </HStack>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        {arquivoInfo.dataUpload.toLocaleDateString('pt-BR')}
                      </Text>
                    </HStack>

                    <HStack justify="space-between">
                      <HStack>
                        <Icon
                          as={FaUser}
                          color="gray.500"
                        />
                        <Text fontSize="sm">Autor:</Text>
                      </HStack>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                      >
                        {arquivoInfo.autor}
                      </Text>
                    </HStack>

                    <Divider />

                    <HStack justify="space-between">
                      <Text fontSize="sm">Visualizações:</Text>
                      <Badge colorScheme="blue">{arquivoInfo.visualizacoes}</Badge>
                    </HStack>

                    <HStack justify="space-between">
                      <Text fontSize="sm">Downloads:</Text>
                      <Badge colorScheme="green">{arquivoInfo.downloads}</Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Ações Rápidas */}
              <Card boxShadow="sm">
                <CardBody p={6}>
                  <Heading
                    size="sm"
                    mb={4}
                  >
                    Ações Rápidas
                  </Heading>
                  <VStack spacing={3}>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                    <Button
                      leftIcon={<FaEdit />}
                      variant="outline"
                      size="sm"
                      w="full"
                      colorScheme="orange"
                      onClick={handleReplaceFileClick}
                    >
                      Substituir Arquivo
                    </Button>

                    <Button
                      leftIcon={<FaTrash />}
                      variant="outline"
                      size="sm"
                      w="full"
                      colorScheme="red"
                      onClick={handleDeleteDocument}
                    >
                      Excluir Documento
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  )
}
