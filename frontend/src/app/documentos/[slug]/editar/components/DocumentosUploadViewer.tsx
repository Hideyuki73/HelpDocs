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
  Progress,
  Flex,
  Spacer,
} from '@chakra-ui/react'
import {
  FaArrowLeft,
  FaDownload,
  FaEye,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFile,
  FaCalendarAlt,
  FaUser,
  FaFileAlt,
  FaShare,
  FaTrash,
  FaEdit,
  FaCopy,
} from 'react-icons/fa'
import { useState } from 'react'
import { Documento } from '../types/documento'

interface DocumentoUploadViewerProps {
  documento: Documento
  onVoltar: () => void
}

export function DocumentoUploadViewer({ documento, onVoltar }: DocumentoUploadViewerProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const toast = useToast()

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

  // Simular download do arquivo
  const handleDownload = async () => {
    setIsDownloading(true)

    // Simular processo de download
    setTimeout(() => {
      setIsDownloading(false)
      toast({
        title: 'Download iniciado',
        description: 'O arquivo está sendo baixado para seu dispositivo.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    }, 2000)
  }

  // Simular visualização do arquivo
  const handleVisualize = () => {
    toast({
      title: 'Abrindo visualizador',
      description: 'O arquivo será aberto em uma nova aba.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
    // Aqui seria aberto o arquivo em uma nova aba
    // window.open(documento.urlArquivo, '_blank')
  }

  // Simular compartilhamento
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    toast({
      title: 'Link copiado!',
      description: 'O link do documento foi copiado para a área de transferência.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
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

                    {/* Botões de Ação */}
                    <HStack
                      spacing={4}
                      wrap="wrap"
                      justify="center"
                    >
                      <Button
                        leftIcon={<FaEye />}
                        colorScheme="blue"
                        size="lg"
                        onClick={handleVisualize}
                      >
                        Visualizar
                      </Button>

                      <Button
                        leftIcon={<FaDownload />}
                        colorScheme="green"
                        variant="outline"
                        size="lg"
                        onClick={handleDownload}
                        isLoading={isDownloading}
                        loadingText="Baixando..."
                      >
                        Download
                      </Button>

                      <Button
                        leftIcon={<FaShare />}
                        colorScheme="purple"
                        variant="outline"
                        size="lg"
                        onClick={handleShare}
                      >
                        Compartilhar
                      </Button>
                    </HStack>

                    {isDownloading && (
                      <Box w="full">
                        <Progress
                          size="sm"
                          isIndeterminate
                          colorScheme="green"
                          borderRadius="full"
                        />
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          textAlign="center"
                          mt={2}
                        >
                          Preparando download...
                        </Text>
                      </Box>
                    )}
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
                    <Button
                      leftIcon={<FaCopy />}
                      variant="outline"
                      size="sm"
                      w="full"
                      onClick={handleShare}
                    >
                      Copiar Link
                    </Button>

                    <Button
                      leftIcon={<FaEdit />}
                      variant="outline"
                      size="sm"
                      w="full"
                      colorScheme="orange"
                    >
                      Substituir Arquivo
                    </Button>

                    <Button
                      leftIcon={<FaTrash />}
                      variant="outline"
                      size="sm"
                      w="full"
                      colorScheme="red"
                    >
                      Excluir Documento
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Dicas */}
              <Card
                boxShadow="sm"
                bg="blue.50"
                borderColor="blue.200"
              >
                <CardBody p={6}>
                  <Heading
                    size="sm"
                    mb={3}
                    color="blue.700"
                  >
                    💡 Dica
                  </Heading>
                  <Text
                    fontSize="sm"
                    color="blue.700"
                    lineHeight="1.5"
                  >
                    Para converter este documento em um formato editável, considere usar ferramentas de conversão online
                    ou recriar o conteúdo em um novo documento editável.
                  </Text>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  )
}
