'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Divider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Flex,
  Spacer,
  Avatar,
  Tooltip,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { 
  FaPlus, 
  FaComments, 
  FaPaperPlane, 
  FaEdit, 
  FaClock, 
  FaEllipsisV, 
  FaTrash,
  FaBuilding,
  FaUsers
} from 'react-icons/fa'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase'
import {
  ChatEmpresa as ChatEmpresaType,
  Mensagem,
  criarChatEmpresa,
  listarChatsEmpresa,
  enviarMensagem,
  listarMensagens,
  editarMensagem,
  deletarMensagem,
} from '@/action/chat-empresa'

interface ChatEmpresaProps {
  empresaId: string
  empresaNome: string
  isAdmin?: boolean
}

export function ChatEmpresa({ empresaId, empresaNome, isAdmin = false }: ChatEmpresaProps) {
  const [user] = useAuthState(auth)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)

  const [chats, setChats] = useState<ChatEmpresaType[]>([])
  const [chatAtivo, setChatAtivo] = useState<ChatEmpresaType | null>(null)
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [novoChatNome, setNovoChatNome] = useState('')
  const [novaMensagem, setNovaMensagem] = useState('')
  const [mensagemParaDeletar, setMensagemParaDeletar] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [enviandoMensagem, setEnviandoMensagem] = useState(false)
  const [criandoChat, setCriandoChat] = useState(false)

  useEffect(() => {
    if (user?.uid) {
      carregarChats()
    }
  }, [user?.uid])

  useEffect(() => {
    if (chatAtivo && user?.uid) {
      carregarMensagens()
    }
  }, [chatAtivo, user?.uid])

  useEffect(() => {
    scrollToBottom()
  }, [mensagens])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const carregarChats = async () => {
    if (!user?.uid) return

    setLoading(true)
    try {
      const chatsData = await listarChatsEmpresa(user.uid)
      setChats(chatsData)
      
      // Se não há chat ativo e há chats disponíveis, selecionar o primeiro
      if (!chatAtivo && chatsData.length > 0) {
        setChatAtivo(chatsData[0])
      }
    } catch (error) {
      console.error('Erro ao carregar chats:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os chats da empresa.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const carregarMensagens = async () => {
    if (!chatAtivo || !user?.uid) return

    try {
      const mensagensData = await listarMensagens(chatAtivo.id, user.uid)
      setMensagens(mensagensData)
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as mensagens.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleCriarChat = async () => {
    if (!novoChatNome.trim() || !user?.uid) return

    setCriandoChat(true)
    try {
      const novoChat = await criarChatEmpresa({
        nome: novoChatNome.trim(),
        empresaId,
        criadoPor: user.uid,
      })

      setChats([novoChat, ...chats])
      setChatAtivo(novoChat)
      setNovoChatNome('')
      onClose()

      toast({
        title: 'Chat criado!',
        description: `O chat "${novoChat.nome}" foi criado com sucesso.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Erro ao criar chat:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o chat. Apenas administradores podem criar chats da empresa.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setCriandoChat(false)
    }
  }

  const handleEnviarMensagem = async () => {
    if (!novaMensagem.trim() || !chatAtivo || !user?.uid) return

    setEnviandoMensagem(true)
    try {
      const mensagem = await enviarMensagem(chatAtivo.id, {
        conteudo: novaMensagem.trim(),
        autorId: user.uid,
      })

      setMensagens([...mensagens, mensagem])
      setNovaMensagem('')
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setEnviandoMensagem(false)
    }
  }

  const handleDeletarMensagem = async () => {
    if (!mensagemParaDeletar || !user?.uid) return

    try {
      await deletarMensagem(mensagemParaDeletar, user.uid)
      setMensagens(mensagens.filter(m => m.id !== mensagemParaDeletar))
      setMensagemParaDeletar(null)
      onDeleteClose()

      toast({
        title: 'Mensagem deletada',
        description: 'A mensagem foi removida com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar a mensagem.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const formatarDataHora = (data: Date) => {
    return new Date(data).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Carregando chats...</Text>
      </Box>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <Flex align="center">
            <HStack>
              <FaBuilding color="green" />
              <Heading size="md">Chat da Empresa - {empresaNome}</Heading>
              <Badge colorScheme="green" variant="outline">
                <HStack spacing={1}>
                  <FaUsers size="10px" />
                  <Text>Geral</Text>
                </HStack>
              </Badge>
            </HStack>
            <Spacer />
            {isAdmin && (
              <Button
                leftIcon={<FaPlus />}
                onClick={onOpen}
                colorScheme="green"
                size="sm"
              >
                Novo Chat
              </Button>
            )}
          </Flex>
        </CardHeader>

        <CardBody>
          <HStack align="start" spacing={4} h="500px">
            {/* Lista de Chats */}
            <VStack
              w="250px"
              h="full"
              align="stretch"
              spacing={2}
              overflowY="auto"
              borderRight="1px solid"
              borderColor="gray.200"
              pr={4}
            >
              <Text fontSize="sm" fontWeight="bold" color="gray.600">
                Chats da Empresa
              </Text>
              {chats.length === 0 ? (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                  {isAdmin ? 'Crie o primeiro chat da empresa' : 'Nenhum chat disponível ainda'}
                </Text>
              ) : (
                chats.map((chat) => (
                  <Box
                    key={chat.id}
                    p={3}
                    bg={chatAtivo?.id === chat.id ? 'green.50' : 'gray.50'}
                    borderRadius="md"
                    cursor="pointer"
                    onClick={() => setChatAtivo(chat)}
                    _hover={{ bg: chatAtivo?.id === chat.id ? 'green.100' : 'gray.100' }}
                    border="1px solid"
                    borderColor={chatAtivo?.id === chat.id ? 'green.200' : 'gray.200'}
                  >
                    <HStack>
                      <FaBuilding size="12px" color="green" />
                      <Text fontSize="sm" fontWeight="medium" noOfLines={1} flex={1}>
                        {chat.nome}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {formatarDataHora(chat.dataCriacao)}
                    </Text>
                  </Box>
                ))
              )}
            </VStack>

            {/* Área de Mensagens */}
            <VStack flex={1} h="full" spacing={0}>
              {chatAtivo ? (
                <>
                  {/* Header do Chat */}
                  <Box
                    w="full"
                    p={3}
                    bg="green.50"
                    borderRadius="md"
                    mb={3}
                  >
                    <HStack>
                      <FaBuilding color="green" />
                      <Text fontWeight="bold">{chatAtivo.nome}</Text>
                      <Badge colorScheme="green" size="sm">Público</Badge>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      {mensagens.length} mensagens • Todos os funcionários podem participar
                    </Text>
                  </Box>

                  {/* Mensagens */}
                  <VStack
                    flex={1}
                    w="full"
                    overflowY="auto"
                    spacing={3}
                    align="stretch"
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                  >
                    {mensagens.length === 0 ? (
                      <Text textAlign="center" color="gray.500" py={8}>
                        Nenhuma mensagem ainda. Seja o primeiro a enviar!
                      </Text>
                    ) : (
                      mensagens.map((mensagem) => (
                        <Box
                          key={mensagem.id}
                          alignSelf={mensagem.autorId === user?.uid ? 'flex-end' : 'flex-start'}
                          maxW="70%"
                        >
                          <Box
                            bg={mensagem.autorId === user?.uid ? 'green.500' : 'white'}
                            color={mensagem.autorId === user?.uid ? 'white' : 'black'}
                            p={3}
                            borderRadius="lg"
                            boxShadow="sm"
                            position="relative"
                          >
                            <Text fontSize="sm">{mensagem.conteudo}</Text>
                            <HStack justify="space-between" mt={1}>
                              <Text fontSize="xs" opacity={0.8}>
                                {formatarDataHora(mensagem.dataEnvio)}
                              </Text>
                              <HStack spacing={1}>
                                {mensagem.editada && (
                                  <Tooltip label="Mensagem editada">
                                    <Box>
                                      <FaEdit size="10px" />
                                    </Box>
                                  </Tooltip>
                                )}
                                {(mensagem.autorId === user?.uid || isAdmin) && (
                                  <Menu>
                                    <MenuButton
                                      as={IconButton}
                                      icon={<FaEllipsisV />}
                                      size="xs"
                                      variant="ghost"
                                      color={mensagem.autorId === user?.uid ? 'white' : 'gray.500'}
                                    />
                                    <MenuList>
                                      <MenuItem
                                        icon={<FaTrash />}
                                        onClick={() => {
                                          setMensagemParaDeletar(mensagem.id)
                                          onDeleteOpen()
                                        }}
                                        color="red.500"
                                      >
                                        Deletar
                                      </MenuItem>
                                    </MenuList>
                                  </Menu>
                                )}
                              </HStack>
                            </HStack>
                          </Box>
                        </Box>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </VStack>

                  {/* Input de Nova Mensagem */}
                  <HStack w="full" mt={3}>
                    <Input
                      placeholder="Digite sua mensagem para toda a empresa..."
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleEnviarMensagem()}
                      disabled={enviandoMensagem}
                    />
                    <IconButton
                      aria-label="Enviar mensagem"
                      icon={<FaPaperPlane />}
                      onClick={handleEnviarMensagem}
                      colorScheme="green"
                      isLoading={enviandoMensagem}
                      isDisabled={!novaMensagem.trim()}
                    />
                  </HStack>
                </>
              ) : (
                <Box textAlign="center" py={8} color="gray.500">
                  <FaBuilding size="48px" style={{ margin: '0 auto 16px' }} />
                  <Text>Selecione um chat para começar a conversar</Text>
                  <Text fontSize="sm" mt={2}>
                    Chats da empresa são visíveis para todos os funcionários
                  </Text>
                </Box>
              )}
            </VStack>
          </HStack>
        </CardBody>
      </Card>

      {/* Modal para Criar Novo Chat */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Criar Novo Chat da Empresa</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Box w="full">
                <Text mb={2} fontSize="sm" fontWeight="medium">
                  Nome do Chat
                </Text>
                <Input
                  placeholder="Ex: Anúncios Gerais, Comunicados, Bate-papo..."
                  value={novoChatNome}
                  onChange={(e) => setNovoChatNome(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCriarChat()}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Este chat será visível para todos os funcionários da empresa
                </Text>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="green"
              onClick={handleCriarChat}
              isLoading={criandoChat}
              isDisabled={!novoChatNome.trim()}
            >
              Criar Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dialog de confirmação de deleção */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Deletar Mensagem
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja deletar esta mensagem? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDeletarMensagem} ml={3}>
                Deletar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}
