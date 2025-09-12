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
  Divider,
} from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa'

interface Mensagem {
  id: string
  tipo: 'usuario' | 'ia'
  conteudo: string
  timestamp: Date
}

interface ChatIAProps {
  contextoDocumento?: string
}

export function ChatIA({ contextoDocumento }: ChatIAProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: '1',
      tipo: 'ia',
      conteudo:
        'Olá! Sou seu assistente de IA especializado em documentação de software. Como posso ajudá-lo a criar um documento melhor?',
      timestamp: new Date(),
    },
  ])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll para a última mensagem
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensagens])

  const enviarMensagem = async () => {
    if (!novaMensagem.trim() || enviando) return

    const mensagemUsuario: Mensagem = {
      id: Date.now().toString(),
      tipo: 'usuario',
      conteudo: novaMensagem,
      timestamp: new Date(),
    }

    setMensagens((prev) => [...prev, mensagemUsuario])
    setNovaMensagem('')
    setEnviando(true)

    try {
      const response = await fetch('/api/ia-helper/chat/pergunta', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pergunta: novaMensagem,
          contexto: contextoDocumento,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        const mensagemIA: Mensagem = {
          id: (Date.now() + 1).toString(),
          tipo: 'ia',
          conteudo: data.resposta,
          timestamp: new Date(),
        }

        setMensagens((prev) => [...prev, mensagemIA])
      } else {
        throw new Error('Erro ao obter resposta da IA')
      }
    } catch (error) {
      const mensagemErro: Mensagem = {
        id: (Date.now() + 1).toString(),
        tipo: 'ia',
        conteudo: 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.',
        timestamp: new Date(),
      }

      setMensagens((prev) => [...prev, mensagemErro])
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

  const sugestoesPergunta = [
    'Como documentar uma API REST?',
    'Qual a estrutura ideal para um README?',
    'Como escrever um guia de instalação?',
    'Boas práticas para documentação técnica',
  ]

  return (
    <VStack
      h="full"
      spacing={0}
    >
      {/* Header */}
      <Box
        w="full"
        p={4}
        bg="blue.50"
        borderTopRadius="md"
      >
        <HStack>
          <FaRobot color="blue" />
          <Heading size="sm">Assistente IA</Heading>
        </HStack>
        <Text
          fontSize="xs"
          color="gray.600"
          mt={1}
        >
          Especialista em documentação de software
        </Text>
      </Box>

      <Divider />

      {/* Área de Mensagens */}
      <Box
        ref={scrollRef}
        flex={1}
        w="full"
        overflowY="auto"
        p={4}
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#CBD5E0',
            borderRadius: '24px',
          },
        }}
      >
        <VStack
          spacing={4}
          align="stretch"
        >
          {mensagens.map((mensagem) => (
            <HStack
              key={mensagem.id}
              align="start"
              justify={mensagem.tipo === 'usuario' ? 'flex-end' : 'flex-start'}
            >
              {mensagem.tipo === 'ia' && (
                <Avatar
                  size="sm"
                  bg="blue.500"
                  icon={<FaRobot />}
                />
              )}

              <Card
                maxW="80%"
                bg={mensagem.tipo === 'usuario' ? 'blue.500' : 'gray.100'}
                color={mensagem.tipo === 'usuario' ? 'white' : 'black'}
              >
                <CardBody p={3}>
                  <Text
                    fontSize="sm"
                    whiteSpace="pre-wrap"
                  >
                    {mensagem.conteudo}
                  </Text>
                  <Text
                    fontSize="xs"
                    opacity={0.7}
                    mt={1}
                    textAlign={mensagem.tipo === 'usuario' ? 'right' : 'left'}
                  >
                    {mensagem.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </CardBody>
              </Card>

              {mensagem.tipo === 'usuario' && (
                <Avatar
                  size="sm"
                  bg="gray.500"
                  icon={<FaUser />}
                />
              )}
            </HStack>
          ))}

          {enviando && (
            <HStack justify="flex-start">
              <Avatar
                size="sm"
                bg="blue.500"
                icon={<FaRobot />}
              />
              <Card bg="gray.100">
                <CardBody p={3}>
                  <HStack>
                    <Spinner size="sm" />
                    <Text fontSize="sm">Pensando...</Text>
                  </HStack>
                </CardBody>
              </Card>
            </HStack>
          )}
        </VStack>
      </Box>

      {/* Sugestões (apenas quando não há muitas mensagens) */}
      {mensagens.length <= 2 && (
        <Box
          w="full"
          p={2}
          borderTop="1px"
          borderColor="gray.200"
        >
          <Text
            fontSize="xs"
            color="gray.600"
            mb={2}
          >
            Sugestões:
          </Text>
          <VStack spacing={1}>
            {sugestoesPergunta.map((sugestao, index) => (
              <Button
                key={index}
                size="xs"
                variant="ghost"
                fontSize="xs"
                h="auto"
                p={2}
                w="full"
                textAlign="left"
                justifyContent="flex-start"
                onClick={() => setNovaMensagem(sugestao)}
              >
                {sugestao}
              </Button>
            ))}
          </VStack>
        </Box>
      )}

      {/* Input de Mensagem */}
      <Box
        w="full"
        p={4}
        borderTop="1px"
        borderColor="gray.200"
      >
        <HStack>
          <Input
            value={novaMensagem}
            onChange={(e) => setNovaMensagem(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta..."
            size="sm"
            disabled={enviando}
          />
          <Button
            onClick={enviarMensagem}
            isLoading={enviando}
            colorScheme="blue"
            size="sm"
            isDisabled={!novaMensagem.trim()}
          >
            <FaPaperPlane />
          </Button>
        </HStack>
      </Box>
    </VStack>
  )
}
