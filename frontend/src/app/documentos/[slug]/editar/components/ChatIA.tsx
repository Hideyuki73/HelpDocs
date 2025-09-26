'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Avatar,
  Card,
  CardBody,
  Spinner,
  Heading,
  IconButton,
  Tooltip,
  Fade,
  useToast,
  Divider,
  Badge,
} from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { FaPaperPlane, FaRobot, FaUser, FaLightbulb, FaCopy, FaThumbsUp, FaThumbsDown, FaTrash } from 'react-icons/fa'
import { User } from 'firebase/auth'
import { enviarMensagemIA } from '@/action/ia'

interface Mensagem {
  id: string
  tipo: 'usuario' | 'ia'
  conteudo: string
  timestamp: Date
  feedback?: 'positivo' | 'negativo'
}

interface ChatIAProps {
  contextoDocumento?: string
  user: User | null
}

export function ChatIA({ contextoDocumento, user }: ChatIAProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: '1',
      tipo: 'ia',
      conteudo:
        'Olá! 👋 Sou seu assistente de IA especializado em documentação de software. Estou aqui para ajudá-lo a criar documentos mais claros, completos e profissionais. Como posso ajudá-lo hoje?',
      timestamp: new Date(),
    },
  ])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sugestoesVisiveis, setSugestoesVisiveis] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensagens])

  const enviarMensagem = async (mensagemTexto?: string) => {
    const textoEnvio = mensagemTexto || novaMensagem
    if (!textoEnvio.trim() || enviando) return

    const mensagemUsuario: Mensagem = {
      id: Date.now().toString(),
      tipo: 'usuario',
      conteudo: textoEnvio,
      timestamp: new Date(),
    }

    setMensagens((prev) => [...prev, mensagemUsuario])
    setNovaMensagem('')
    setEnviando(true)
    setSugestoesVisiveis(false)

    try {
      if (!user) {
        toast({
          title: 'Erro de autenticação',
          description: 'Você precisa estar logado para usar o assistente IA.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        setEnviando(false)
        return
      }

      const token = await user.getIdToken()
      const data = await enviarMensagemIA(textoEnvio, contextoDocumento, token)

      const mensagemIA: Mensagem = {
        id: (Date.now() + 1).toString(),
        tipo: 'ia',
        conteudo: typeof data === 'string' ? data : data.resposta,
        timestamp: new Date(),
      }

      setMensagens((prev) => [...prev, mensagemIA])
    } catch (error) {
      const mensagemErro: Mensagem = {
        id: (Date.now() + 1).toString(),
        tipo: 'ia',
        conteudo:
          'Desculpe, ocorreu um erro ao processar sua pergunta. Por favor, tente novamente em alguns instantes.',
        timestamp: new Date(),
      }
      setMensagens((prev) => [...prev, mensagemErro])

      toast({
        title: 'Erro na comunicação',
        description: 'Não foi possível enviar sua mensagem. Tente novamente.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setEnviando(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensagem()
    }
  }

  const copiarMensagem = (conteudo: string) => {
    navigator.clipboard.writeText(conteudo)
    toast({
      title: 'Copiado!',
      description: 'Mensagem copiada para a área de transferência.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    })
  }

  const darFeedback = (mensagemId: string, tipo: 'positivo' | 'negativo') => {
    setMensagens((prev) => prev.map((msg) => (msg.id === mensagemId ? { ...msg, feedback: tipo } : msg)))

    toast({
      title: 'Obrigado pelo feedback!',
      description: 'Sua avaliação nos ajuda a melhorar o assistente.',
      status: 'info',
      duration: 2000,
      isClosable: true,
    })
  }

  const gerarSugestoesContextuais = () => {
    const sugestoesBase = [
      'Como documentar uma API REST?',
      'Qual a estrutura ideal para um README?',
      'Como escrever um guia de instalação?',
      'Boas práticas para documentação técnica',
    ]

    const sugestoesContextuais = []

    if (contextoDocumento?.includes('API')) {
      sugestoesContextuais.push('Como documentar endpoints desta API?')
    }
    if (contextoDocumento?.includes('instalação') || contextoDocumento?.includes('setup')) {
      sugestoesContextuais.push('Como melhorar este guia de instalação?')
    }
    if (contextoDocumento && contextoDocumento.length > 100) {
      sugestoesContextuais.push('Como posso organizar melhor este conteúdo?')
    }

    return sugestoesContextuais.length > 0 ? sugestoesContextuais : sugestoesBase
  }

  const limparConversa = () => {
    setMensagens([
      {
        id: '1',
        tipo: 'ia',
        conteudo:
          'Olá! 👋 Sou seu assistente de IA especializado em documentação de software. Estou aqui para ajudá-lo a criar documentos mais claros, completos e profissionais. Como posso ajudá-lo hoje?',
        timestamp: new Date(),
      },
    ])
    setSugestoesVisiveis(true)
  }

  return (
    <VStack
      h="full"
      spacing={0}
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      border="1px solid"
      borderColor="gray.100"
    >
      {/* Header Melhorado */}
      <Box
        w="full"
        p={4}
        bg="gradient-to-r"
        bgGradient="linear(to-r, blue.500, blue.600)"
        color="white"
      >
        <HStack justify="space-between">
          <HStack>
            <Avatar
              size="sm"
              bg="white"
              color="blue.500"
              icon={<FaRobot />}
            />
            <VStack
              align="start"
              spacing={0}
            >
              <Heading size="sm">Assistente IA</Heading>
              <Text
                fontSize="xs"
                opacity={0.9}
              >
                Especialista em documentação
              </Text>
            </VStack>
          </HStack>

          <HStack>
            <Badge
              colorScheme="green"
              variant="solid"
            >
              Online
            </Badge>
            <Tooltip label="Limpar conversa">
              <IconButton
                aria-label="Limpar conversa"
                icon={<FaTrash />}
                size="sm"
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={limparConversa}
              />
            </Tooltip>
          </HStack>
        </HStack>
      </Box>

      {/* Mensagens */}
      <Box
        ref={scrollRef}
        flex={1}
        w="full"
        overflowY="auto"
        p={4}
        css={{
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(to bottom, #CBD5E0, #A0AEC0)',
            borderRadius: '24px',
          },
          '&::-webkit-scrollbar-track': { background: '#F7FAFC' },
        }}
      >
        <VStack
          spacing={4}
          align="stretch"
        >
          {mensagens.map((mensagem) => (
            <Fade
              key={mensagem.id}
              in={true}
            >
              <HStack
                align="start"
                justify={mensagem.tipo === 'usuario' ? 'flex-end' : 'flex-start'}
                spacing={3}
              >
                {mensagem.tipo === 'ia' && (
                  <Avatar
                    size="sm"
                    bg="blue.500"
                    icon={<FaRobot />}
                    boxShadow="md"
                  />
                )}

                <VStack
                  align={mensagem.tipo === 'usuario' ? 'flex-end' : 'flex-start'}
                  spacing={1}
                >
                  <Card
                    maxW="85%"
                    bg={mensagem.tipo === 'usuario' ? 'blue.500' : 'gray.50'}
                    color={mensagem.tipo === 'usuario' ? 'white' : 'gray.800'}
                    boxShadow="md"
                    border={mensagem.tipo === 'ia' ? '1px solid' : 'none'}
                    borderColor="gray.200"
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-1px)',
                      boxShadow: 'lg',
                    }}
                  >
                    <CardBody p={4}>
                      <Text
                        fontSize="sm"
                        whiteSpace="pre-wrap"
                        lineHeight="1.5"
                      >
                        {mensagem.conteudo}
                      </Text>

                      <HStack
                        justify="space-between"
                        mt={2}
                        pt={2}
                        borderTop="1px solid"
                        borderColor={mensagem.tipo === 'usuario' ? 'whiteAlpha.300' : 'gray.200'}
                      >
                        <Text
                          fontSize="xs"
                          opacity={0.7}
                        >
                          {mensagem.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>

                        {mensagem.tipo === 'ia' && (
                          <HStack spacing={1}>
                            <Tooltip label="Copiar mensagem">
                              <IconButton
                                aria-label="Copiar"
                                icon={<FaCopy />}
                                size="xs"
                                variant="ghost"
                                onClick={() => copiarMensagem(mensagem.conteudo)}
                              />
                            </Tooltip>
                            <Tooltip label="Útil">
                              <IconButton
                                aria-label="Útil"
                                icon={<FaThumbsUp />}
                                size="xs"
                                variant="ghost"
                                colorScheme={mensagem.feedback === 'positivo' ? 'green' : 'gray'}
                                onClick={() => darFeedback(mensagem.id, 'positivo')}
                              />
                            </Tooltip>
                            <Tooltip label="Não útil">
                              <IconButton
                                aria-label="Não útil"
                                icon={<FaThumbsDown />}
                                size="xs"
                                variant="ghost"
                                colorScheme={mensagem.feedback === 'negativo' ? 'red' : 'gray'}
                                onClick={() => darFeedback(mensagem.id, 'negativo')}
                              />
                            </Tooltip>
                          </HStack>
                        )}
                      </HStack>
                    </CardBody>
                  </Card>
                </VStack>

                {mensagem.tipo === 'usuario' && (
                  <Avatar
                    size="sm"
                    bg="gray.500"
                    icon={<FaUser />}
                    boxShadow="md"
                  />
                )}
              </HStack>
            </Fade>
          ))}

          {enviando && (
            <Fade in={true}>
              <HStack
                justify="flex-start"
                spacing={3}
              >
                <Avatar
                  size="sm"
                  bg="blue.500"
                  icon={<FaRobot />}
                  boxShadow="md"
                />
                <Card
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <CardBody p={4}>
                    <HStack>
                      <Spinner
                        size="sm"
                        color="blue.500"
                      />
                      <Text
                        fontSize="sm"
                        color="gray.600"
                      >
                        Analisando e preparando resposta...
                      </Text>
                    </HStack>
                  </CardBody>
                </Card>
              </HStack>
            </Fade>
          )}
        </VStack>
      </Box>

      {/* Sugestões Contextuais */}
      {sugestoesVisiveis && (
        <Fade in={true}>
          <Box
            w="full"
            p={4}
            bg="gray.50"
            borderTop="1px solid"
            borderColor="gray.200"
          >
            <HStack mb={3}>
              <FaLightbulb color="orange" />
              <Text
                fontSize="sm"
                fontWeight="medium"
                color="gray.700"
              >
                Sugestões para você:
              </Text>
            </HStack>
            <VStack spacing={2}>
              {gerarSugestoesContextuais()
                .slice(0, 3)
                .map((sugestao, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    fontSize="xs"
                    h="auto"
                    p={3}
                    w="full"
                    textAlign="left"
                    justifyContent="flex-start"
                    borderColor="blue.200"
                    color="blue.600"
                    _hover={{
                      bg: 'blue.50',
                      borderColor: 'blue.300',
                      transform: 'translateY(-1px)',
                    }}
                    transition="all 0.2s"
                    onClick={() => enviarMensagem(sugestao)}
                  >
                    {sugestao}
                  </Button>
                ))}
            </VStack>
          </Box>
        </Fade>
      )}

      <Divider />

      {/* Input Melhorado */}
      <Box
        w="full"
        p={4}
        bg="white"
        borderTop="1px solid"
        borderColor="gray.100"
      >
        <HStack spacing={3}>
          <Input
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta ou solicite ajuda..."
            size="md"
            disabled={enviando}
            bg="gray.50"
            border="1px solid"
            borderColor="gray.200"
            _focus={{
              bg: 'white',
              borderColor: 'blue.300',
              boxShadow: '0 0 0 1px #3182CE',
            }}
            _hover={{ borderColor: 'gray.300' }}
            borderRadius="lg"
          />
          <Tooltip label={novaMensagem.trim() ? 'Enviar mensagem' : 'Digite uma mensagem'}>
            <IconButton
              aria-label="Enviar mensagem"
              icon={<FaPaperPlane />}
              onClick={() => enviarMensagem()}
              isLoading={enviando}
              colorScheme="blue"
              size="md"
              isDisabled={!novaMensagem.trim()}
              borderRadius="lg"
              _hover={{ transform: 'translateY(-1px)' }}
              transition="all 0.2s"
            />
          </Tooltip>
        </HStack>
      </Box>
    </VStack>
  )
}
