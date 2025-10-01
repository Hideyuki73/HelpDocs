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
  Heading,
} from '@chakra-ui/react'
import {
  FaSave,
  FaArrowLeft,
  FaRobot,
  FaEye,
  FaEdit,
  FaHistory,
  FaCog,
  FaExpand,
  FaCompress,
  FaFileAlt,
  FaClock,
  FaListUl,
} from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  codeBlockPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  ListsToggle,
  BlockTypeSelect,
  UndoRedo,
  CodeToggle,
  Separator,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { Documento, DocumentoFormData } from '../types'
import { User } from 'firebase/auth'
import { ChatIA } from './ChatIA'
import { HistoricoVersoes } from './HistoricoVersoes'
import { ChecklistManager } from '../../../components/ChecklistManager'

interface DocumentoEditorProps {
  documento: Documento
  formData: DocumentoFormData
  saving: boolean
  showChat: boolean
  user?: User | null
  onFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string } },
  ) => void
  onSalvar: () => void
  onPublicar: () => void
  onToggleChat: () => void
  onVoltar: () => void
}

// Função simples para renderizar markdown básico
const renderMarkdown = (text: string) => {
  if (!text) return 'Nenhum conteúdo foi adicionado ainda.'

  let html = text

  // Títulos
  html = html.replace(
    /^### (.*$)/gim,
    '<h3 style="font-size: 1.25rem; font-weight: 600; margin: 1rem 0 0.5rem 0; color: #2D3748;">$1</h3>',
  )
  html = html.replace(
    /^## (.*$)/gim,
    '<h2 style="font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0 0.75rem 0; color: #2D3748;">$1</h2>',
  )
  html = html.replace(
    /^# (.*$)/gim,
    '<h1 style="font-size: 2rem; font-weight: 800; margin: 2rem 0 1rem 0; color: #1A202C;">$1</h1>',
  )

  // Negrito e itálico
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>')

  // Listas
  html = html.replace(/^\- (.*$)/gim, '<li style="margin: 0.25rem 0; padding-left: 0.5rem;">$1</li>')
  html = html.replace(
    /(<li.*<\/li>)/,
    '<ul style="margin: 1rem 0; padding-left: 1.5rem; list-style-type: disc;">$1</ul>',
  )

  // Código inline
  html = html.replace(
    /`([^`]+)`/g,
    '<code style="background-color: #EDF2F7; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875rem;">$1</code>',
  )

  // Blocos de código
  html = html.replace(
    /```([\\s\\S]*?)```/g,
    '<pre style="background-color: #1A202C; color: #E2E8F0; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; overflow-x: auto; font-family: monospace; font-size: 0.875rem; line-height: 1.5;"><code>$1</code></pre>',
  )

  // Links
  html = html.replace(
    /\\[([^\\]]+\\]\\(([^\\)]+)\\)/g,
    '<a href="$2" style="color: #3182CE; text-decoration: underline;" target="_blank" rel="noopener noreferrer">$1</a>',
  )

  // Quebras de linha
  html = html.replace(/\\n/g, '<br>')

  return html
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
  const [showChecklistPanel, setShowChecklistPanel] = useState(false)
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure()
  const { isOpen: isHistoricoModalOpen, onOpen: onHistoricoModalOpen, onClose: onHistoricoModalClose } = useDisclosure()
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

  // Formatação rápida melhorada - só aparece no modo de edição
  const formatacaoRapida = [
    { label: 'Título', action: () => insertTextAtCursor('# '), description: 'Adiciona um título principal' },
    { label: 'Subtítulo', action: () => insertTextAtCursor('## '), description: 'Adiciona um subtítulo' },
    { label: 'Lista', action: () => insertTextAtCursor('- '), description: 'Adiciona um item de lista' },
    { label: 'Código', action: () => insertTextAtCursor('```\\n\\n```'), description: 'Adiciona um bloco de código' },
    { label: 'Negrito', action: () => insertTextAtCursor('**texto**'), description: 'Texto em negrito' },
    { label: 'Itálico', action: () => insertTextAtCursor('*texto*'), description: 'Texto em itálico' },
  ]

  const handleVersaoRestaurada = () => {
    toast({
      title: 'Versão restaurada!',
      description: 'A página será recarregada para exibir a versão restaurada.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
    // Recarregar a página após 2 segundos para mostrar a versão restaurada
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

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
        templateColumns={
          showChat && showChecklistPanel
            ? isFullscreen
              ? '1fr 350px 400px'
              : '1fr minmax(300px, 350px) minmax(350px, 400px)'
            : showChat
            ? isFullscreen
              ? '1fr 400px'
              : '1fr minmax(350px, 400px)'
            : showChecklistPanel
            ? isFullscreen
              ? '1fr 350px'
              : '1fr minmax(300px, 350px)'
            : '1fr'
        }
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
                        onClick={onHistoricoModalOpen}
                        variant="ghost"
                        size="sm"
                      />
                    </Tooltip>

                    <Tooltip label={previewMode ? 'Modo de edição' : 'Visualizar documento'}>
                      <IconButton
                        aria-label="Visualizar"
                        icon={previewMode ? <FaEdit /> : <FaEye />}
                        variant={previewMode ? 'solid' : 'ghost'}
                        colorScheme={previewMode ? 'green' : 'gray'}
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

                    <Tooltip label={showChecklistPanel ? 'Ocultar checklist' : 'Mostrar checklist'}>
                      <Button
                        leftIcon={<FaListUl />}
                        onClick={() => setShowChecklistPanel(!showChecklistPanel)}
                        colorScheme={showChecklistPanel ? 'purple' : 'gray'}
                        variant={showChecklistPanel ? 'solid' : 'outline'}
                        size="sm"
                      >
                        Checklist
                      </Button>
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

            {/* Barra de Formatação Rápida - APENAS NO MODO DE EDIÇÃO */}
            {!previewMode && (
              <Card
                mb={4}
                boxShadow="sm"
              >
                <CardBody p={3}>
                  <VStack
                    spacing={3}
                    align="stretch"
                  >
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
                        <Tooltip
                          key={index}
                          label={item.description}
                        >
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={item.action}
                            _hover={{ bg: 'blue.50', borderColor: 'blue.300' }}
                          >
                            {item.label}
                          </Button>
                        </Tooltip>
                      ))}
                    </HStack>

                    <Alert
                      status="info"
                      size="sm"
                      borderRadius="md"
                    >
                      <AlertIcon />
                      <Text fontSize="xs">
                        Use a formatação Markdown para estruturar seu documento. Clique em "Visualizar" para ver o
                        resultado formatado.
                      </Text>
                    </Alert>
                  </VStack>
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
                          Conteúdo
                        </FormLabel>

                        <Box
                          border="2px solid"
                          borderColor="gray.200"
                          borderRadius="lg"
                          bg="gray.50"
                          _focusWithin={{
                            borderColor: 'blue.400',
                            boxShadow: '0 0 0 1px #3182CE',
                          }}
                          minH="300px"
                          maxH="400px" // altura máxima antes de aparecer scroll
                          overflowY="auto" // ativa o scroll
                          p={2} // espaçamento interno para evitar que o conteúdo grude na borda
                        >
                          <MDXEditor
                            key="document-editor"
                            markdown={formData.conteudo || ''}
                            onChange={(value) =>
                              onFormChange({
                                target: { name: 'conteudo', value },
                              })
                            }
                            className="w-full h-full"
                            plugins={[
                              headingsPlugin(),
                              listsPlugin(),
                              quotePlugin(),
                              codeBlockPlugin(),
                              markdownShortcutPlugin(),
                              toolbarPlugin({
                                toolbarContents: () => (
                                  <>
                                    <UndoRedo />
                                    <Separator />
                                    <BoldItalicUnderlineToggles />
                                    <Separator />
                                    <BlockTypeSelect />
                                    <ListsToggle />
                                    <CodeToggle />
                                  </>
                                ),
                              }),
                            ]}
                          />
                        </Box>
                      </FormControl>
                    </>
                  ) : (
                    // Modo Preview com Renderização de Markdown
                    <VStack
                      align="stretch"
                      spacing={4}
                      h="full"
                    >
                      <Box>
                        <Heading
                          size="2xl"
                          mb={2}
                          color="gray.800"
                        >
                          {formData.titulo || 'Documento sem título'}
                        </Heading>
                        {formData.descricao && (
                          <Text
                            fontSize="lg"
                            color="gray.600"
                            mb={4}
                            fontStyle="italic"
                          >
                            {formData.descricao}
                          </Text>
                        )}
                        <Divider />
                      </Box>

                      <Box
                        flex={1}
                        overflowY="auto"
                        p={6}
                        bg="white"
                        borderRadius="lg"
                        border="1px solid"
                        borderColor="gray.200"
                        boxShadow="inner"
                      >
                        <Box
                          dangerouslySetInnerHTML={{
                            __html: renderMarkdown(formData.conteudo || ''),
                          }}
                          sx={{
                            '& > *:first-of-type': {
                              marginTop: 0,
                            },
                            '& > *:last-of-type': {
                              marginBottom: 0,
                            },
                          }}
                        />
                      </Box>

                      <Alert
                        status="success"
                        borderRadius="md"
                      >
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Modo de Visualização</AlertTitle>
                          <AlertDescription>
                            Este é como seu documento aparecerá quando publicado. Clique no ícone de edição para voltar
                            ao modo de edição.
                          </AlertDescription>
                        </Box>
                      </Alert>
                    </VStack>
                  )}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>

        {/* Painel da Checklist */}
        {showChecklistPanel && (
          <GridItem>
            <Box
              h="full"
              overflowY="auto"
            >
              <ChecklistManager
                documentoId={documento.id}
                usuarioId={user?.uid || ''}
                checklist={documento.checklist || []}
                onChecklistUpdate={(novaChecklist) => {
                  // Atualizar o documento com a nova checklist
                  // Isso pode ser feito através de uma prop ou callback
                  console.log('Checklist atualizada:', novaChecklist)
                }}
              />
            </Box>
          </GridItem>
        )}

        {/* Chat IA */}
        {showChat && (
          <GridItem>
            <Box h="full">
              <ChatIA
                contextoDocumento={`Título: ${formData.titulo}\\nDescrição: ${formData.descricao}\\nConteúdo: ${formData.conteudo}`}
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

              <Alert
                status="success"
                borderRadius="md"
              >
                <AlertIcon />
                <Box>
                  <AlertTitle>Suporte a Markdown</AlertTitle>
                  <AlertDescription>
                    O editor agora suporta formatação Markdown. Use o modo de visualização para ver o resultado
                    formatado.
                  </AlertDescription>
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

      <Modal
        isOpen={isHistoricoModalOpen}
        onClose={onHistoricoModalClose}
        size="4xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FaHistory />
              <Text>Histórico de Versões</Text>
              <Badge colorScheme="blue">{documento.titulo}</Badge>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            maxH="70vh"
            overflowY="auto"
          >
            <HistoricoVersoes
              documentoId={documento.id}
              usuarioId={user?.uid || ''}
              versaoAtual={documento.versao}
              onVersaoRestaurada={handleVersaoRestaurada}
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={onHistoricoModalClose}>Fechar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}
