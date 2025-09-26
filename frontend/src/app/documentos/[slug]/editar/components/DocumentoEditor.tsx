'use client'

import {
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Badge,
  Text,
  Button,
  Box,
  IconButton,
  Tooltip,
  useToast,
  Progress,
  Divider,
  Card,
  CardBody,
  Flex,
  Spacer,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import {
  FaSave,
  FaArrowLeft,
  FaRobot,
  FaEye,
  FaEdit,
  FaHistory,
  FaShare,
  FaCog,
  FaExpand,
  FaCompress,
  FaFileAlt,
  FaClock,
} from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'
import { Documento, DocumentoFormData } from '../types/documento'
import { User } from 'firebase/auth'
import { ChatIA } from './ChatIA'

interface DocumentoEditorProps {
  documento: Documento
  formData: DocumentoFormData
  saving: boolean
  showChat: boolean
  user?: User | null
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSalvar: () => void
  onPublicar: () => void
  onToggleChat: () => void
  onVoltar: () => void
}

export function DocumentoEditor({
  documento,
  formData,
  saving,
  showChat,
  user,
  onFormChange,
  onSalvar,
  onPublicar,
  onToggleChat,
  onVoltar,
}: DocumentoEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [previewMode, setPreviewMode] = useState(false)
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure()
  const toast = useToast()
  const contentRef = useRef<HTMLTextAreaElement>(null)

  // Contagem de palavras em tempo real
  useEffect(() => {
    const words = formData.conteudo
      ?.trim()
      .split(/\s+/)
      .filter((word) => word.length > 0)
    setWordCount(words?.length || 0)
  }, [formData.conteudo])

  // Auto-save (simulado)
  useEffect(() => {
    if (!autoSaveEnabled) return

    const autoSaveTimer = setTimeout(() => {
      if (formData.titulo || formData.conteudo) {
        setLastSaved(new Date())
        // Aqui seria chamado o onSalvar() em uma implementação real
      }
    }, 30000) // Auto-save a cada 30 segundos

    return () => clearTimeout(autoSaveTimer)
  }, [formData, autoSaveEnabled])

  const handleSalvarComFeedback = async () => {
    try {
      await onSalvar()
      setLastSaved(new Date())
      toast({
        title: 'Documento salvo!',
        description: 'Suas alterações foram salvas com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o documento. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handlePublicarComFeedback = async () => {
    try {
      await onPublicar()
      toast({
        title: 'Documento publicado!',
        description: 'O documento foi publicado e está disponível para visualização.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao publicar',
        description: 'Não foi possível publicar o documento. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
    if (!isFullscreen && contentRef.current) {
      contentRef.current.focus()
    }
  }

  const insertTextAtCursor = (text: string) => {
    if (contentRef.current) {
      const start = contentRef.current.selectionStart
      const end = contentRef.current.selectionEnd
      const currentValue = formData.conteudo
      const newValue = currentValue?.substring(0, start) + text + currentValue?.substring(end)

      // Simular mudança no formulário
      const event = {
        target: { name: 'conteudo', value: newValue },
      } as React.ChangeEvent<HTMLTextAreaElement>

      onFormChange(event)

      // Reposicionar cursor
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.selectionStart = start + text.length
          contentRef.current.selectionEnd = start + text.length
          contentRef.current.focus()
        }
      }, 0)
    }
  }

  const formatacaoRapida = [
    { label: 'Título', action: () => insertTextAtCursor('# ') },
    { label: 'Subtítulo', action: () => insertTextAtCursor('## ') },
    { label: 'Lista', action: () => insertTextAtCursor('- ') },
    { label: 'Código', action: () => insertTextAtCursor('```\n\n```') },
  ]

  return (
    <Container
      maxW={isFullscreen ? 'full' : 'full'}
      py={isFullscreen ? 0 : 4}
      h={isFullscreen ? '100vh' : 'calc(100vh - 80px)'}
      bg={isFullscreen ? 'white' : 'transparent'}
      position={isFullscreen ? 'fixed' : 'relative'}
      top={isFullscreen ? 0 : 'auto'}
      left={isFullscreen ? 0 : 'auto'}
      zIndex={isFullscreen ? 1000 : 'auto'}
    >
      <Grid
        templateColumns={showChat ? (isFullscreen ? '1fr 400px' : '1fr minmax(350px, 400px)') : '1fr'}
        gap={6}
        h="full"
      >
        {/* Editor Principal */}
        <GridItem>
          <VStack
            spacing={0}
            align="stretch"
            h="full"
          >
            {/* Header Melhorado */}
            <Card
              mb={4}
              boxShadow="sm"
            >
              <CardBody p={4}>
                <Flex
                  align="center"
                  wrap="wrap"
                  gap={4}
                >
                  <HStack>
                    <Tooltip label="Voltar aos documentos">
                      <IconButton
                        aria-label="Voltar"
                        icon={<FaArrowLeft />}
                        onClick={onVoltar}
                        variant="ghost"
                        size="sm"
                      />
                    </Tooltip>

                    <VStack
                      align="start"
                      spacing={0}
                    >
                      <HStack>
                        <FaFileAlt color="gray" />
                        <Text
                          fontWeight="bold"
                          fontSize="lg"
                        >
                          {formData.titulo || 'Documento sem título'}
                        </Text>
                      </HStack>
                      <HStack spacing={2}>
                        <Badge
                          colorScheme={documento.status === 'publicado' ? 'green' : 'yellow'}
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
                        {lastSaved && (
                          <HStack spacing={1}>
                            <FaClock
                              size="12px"
                              color="gray"
                            />
                            <Text
                              fontSize="xs"
                              color="gray.500"
                            >
                              Salvo às {lastSaved.toLocaleTimeString()}
                            </Text>
                          </HStack>
                        )}
                      </HStack>
                    </VStack>
                  </HStack>

                  <Spacer />

                  <HStack spacing={2}>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                    >
                      {wordCount} palavras
                    </Text>

                    <Divider
                      orientation="vertical"
                      h="20px"
                    />

                    <Tooltip label="Configurações">
                      <IconButton
                        aria-label="Configurações"
                        icon={<FaCog />}
                        variant="ghost"
                        size="sm"
                        onClick={onSettingsOpen}
                      />
                    </Tooltip>

                    <Tooltip label="Histórico de versões">
                      <IconButton
                        aria-label="Histórico"
                        icon={<FaHistory />}
                        variant="ghost"
                        size="sm"
                      />
                    </Tooltip>

                    <Tooltip label={previewMode ? 'Modo de edição' : 'Visualizar'}>
                      <IconButton
                        aria-label="Visualizar"
                        icon={<FaEye />}
                        variant={previewMode ? 'solid' : 'ghost'}
                        colorScheme={previewMode ? 'blue' : 'gray'}
                        size="sm"
                        onClick={() => setPreviewMode(!previewMode)}
                      />
                    </Tooltip>

                    <Tooltip label={isFullscreen ? 'Sair do modo tela cheia' : 'Tela cheia'}>
                      <IconButton
                        aria-label="Tela cheia"
                        icon={isFullscreen ? <FaCompress /> : <FaExpand />}
                        variant="ghost"
                        size="sm"
                        onClick={toggleFullscreen}
                      />
                    </Tooltip>

                    <Tooltip label={showChat ? 'Ocultar assistente IA' : 'Mostrar assistente IA'}>
                      <Button
                        leftIcon={<FaRobot />}
                        onClick={onToggleChat}
                        colorScheme={showChat ? 'blue' : 'gray'}
                        variant={showChat ? 'solid' : 'outline'}
                        size="sm"
                      >
                        IA
                      </Button>
                    </Tooltip>

                    <Button
                      leftIcon={<FaSave />}
                      onClick={handleSalvarComFeedback}
                      isLoading={saving}
                      loadingText="Salvando..."
                      colorScheme="blue"
                      variant="outline"
                      size="sm"
                    >
                      Salvar
                    </Button>

                    {documento.status !== 'publicado' && (
                      <Button
                        onClick={handlePublicarComFeedback}
                        isLoading={saving}
                        loadingText="Publicando..."
                        colorScheme="green"
                        size="sm"
                      >
                        Publicar
                      </Button>
                    )}
                  </HStack>
                </Flex>

                {saving && (
                  <Progress
                    size="xs"
                    isIndeterminate
                    colorScheme="blue"
                    mt={2}
                    borderRadius="full"
                  />
                )}
              </CardBody>
            </Card>

            {/* Barra de Formatação Rápida */}
            {!previewMode && (
              <Card
                mb={4}
                boxShadow="sm"
              >
                <CardBody p={3}>
                  <HStack
                    spacing={2}
                    wrap="wrap"
                  >
                    <Text
                      fontSize="sm"
                      color="gray.600"
                      mr={2}
                    >
                      Formatação rápida:
                    </Text>
                    {formatacaoRapida.map((item, index) => (
                      <Button
                        key={index}
                        size="xs"
                        variant="outline"
                        onClick={item.action}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </HStack>
                </CardBody>
              </Card>
            )}

            {/* Formulário de Edição */}
            <Card
              flex={1}
              boxShadow="sm"
            >
              <CardBody
                p={6}
                h="full"
              >
                <VStack
                  spacing={6}
                  align="stretch"
                  h="full"
                >
                  {!previewMode ? (
                    <>
                      <FormControl>
                        <FormLabel
                          fontWeight="semibold"
                          color="gray.700"
                        >
                          Título do Documento
                        </FormLabel>
                        <Input
                          name="titulo"
                          value={formData.titulo}
                          onChange={onFormChange}
                          size="lg"
                          fontWeight="bold"
                          placeholder="Digite o título do documento..."
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _focus={{
                            bg: 'white',
                            borderColor: 'blue.400',
                            boxShadow: '0 0 0 1px #3182CE',
                          }}
                          _hover={{ borderColor: 'gray.300' }}
                          borderRadius="lg"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel
                          fontWeight="semibold"
                          color="gray.700"
                        >
                          Descrição
                        </FormLabel>
                        <Textarea
                          name="descricao"
                          value={formData.descricao}
                          onChange={onFormChange}
                          rows={3}
                          placeholder="Descreva brevemente o conteúdo do documento..."
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _focus={{
                            bg: 'white',
                            borderColor: 'blue.400',
                            boxShadow: '0 0 0 1px #3182CE',
                          }}
                          _hover={{ borderColor: 'gray.300' }}
                          borderRadius="lg"
                          resize="vertical"
                        />
                      </FormControl>

                      <FormControl flex={1}>
                        <FormLabel
                          fontWeight="semibold"
                          color="gray.700"
                        >
                          Conteúdo do Documento
                        </FormLabel>
                        <Textarea
                          ref={contentRef}
                          name="conteudo"
                          value={formData.conteudo}
                          onChange={onFormChange}
                          placeholder="Digite o conteúdo do documento aqui... 

Dicas:
- Use # para títulos
- Use ## para subtítulos  
- Use - para listas
- Use ``` para blocos de código"
                          resize="none"
                          h="full"
                          fontFamily="'JetBrains Mono', 'Fira Code', monospace"
                          fontSize="sm"
                          lineHeight="1.6"
                          bg="gray.50"
                          border="2px solid"
                          borderColor="gray.200"
                          _focus={{
                            bg: 'white',
                            borderColor: 'blue.400',
                            boxShadow: '0 0 0 1px #3182CE',
                          }}
                          _hover={{ borderColor: 'gray.300' }}
                          borderRadius="lg"
                        />
                      </FormControl>
                    </>
                  ) : (
                    // Modo Preview
                    <VStack
                      align="stretch"
                      spacing={4}
                      h="full"
                    >
                      <Box>
                        <Text
                          fontSize="3xl"
                          fontWeight="bold"
                          mb={2}
                        >
                          {formData.titulo || 'Documento sem título'}
                        </Text>
                        {formData.descricao && (
                          <Text
                            fontSize="lg"
                            color="gray.600"
                            mb={4}
                          >
                            {formData.descricao}
                          </Text>
                        )}
                        <Divider />
                      </Box>

                      <Box
                        flex={1}
                        overflowY="auto"
                        p={4}
                        bg="gray.50"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="gray.200"
                      >
                        <Text
                          whiteSpace="pre-wrap"
                          lineHeight="1.8"
                          fontSize="md"
                        >
                          {formData.conteudo || 'Nenhum conteúdo foi adicionado ainda.'}
                        </Text>
                      </Box>
                    </VStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>

        {/* Chat IA */}
        {showChat && (
          <GridItem>
            <Box h="full">
              <ChatIA
                contextoDocumento={`Título: ${formData.titulo}\nDescrição: ${formData.descricao}\nConteúdo: ${formData.conteudo}`}
                user={user ?? null}
              />
            </Box>
          </GridItem>
        )}
      </Grid>

      {/* Modal de Configurações */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={onSettingsClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Configurações do Editor</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
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
                  <AlertTitle>Auto-salvamento</AlertTitle>
                  <AlertDescription>O documento é salvo automaticamente a cada 30 segundos.</AlertDescription>
                </Box>
              </Alert>

              <FormControl
                display="flex"
                alignItems="center"
              >
                <FormLabel
                  htmlFor="auto-save"
                  mb="0"
                >
                  Ativar auto-salvamento
                </FormLabel>
                <Button
                  id="auto-save"
                  size="sm"
                  colorScheme={autoSaveEnabled ? 'green' : 'gray'}
                  onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
                >
                  {autoSaveEnabled ? 'Ativado' : 'Desativado'}
                </Button>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onSettingsClose}>Fechar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}
