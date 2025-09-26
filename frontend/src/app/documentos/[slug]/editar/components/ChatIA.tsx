'use client'

import { Box, VStack, HStack, Text, Input, Button, Avatar, Card, CardBody, Spinner, Heading } from '@chakra-ui/react'
import { useState, useRef, useEffect } from 'react'
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa'
import { User } from 'firebase/auth'
import { enviarMensagemIA } from '@/action/ia'

interface Mensagem {
  id: string
  tipo: 'usuario' | 'ia'
  conteudo: string
  timestamp: Date
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
        'Olá! Sou seu assistente de IA especializado em documentação de software. Como posso ajudá-lo a criar um documento melhor?',
      timestamp: new Date(),
    },
  ])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
      if (!user) {
        console.error('Usuário não autenticado para enviar mensagem para a IA.')
        setEnviando(false)
        return
      }

      const token = await user.getIdToken()
      const data = await enviarMensagemIA(novaMensagem, contextoDocumento, token)

      const mensagemIA: Mensagem = {
        id: (Date.now() + 1).toString(),
        tipo: 'ia',
        conteudo: typeof data === 'string' ? data : data.resposta,
        timestamp: new Date(),
      }

      setMensagens((prev) => [...prev, mensagemIA])
    } catch {
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
      bg="gray.50"
      borderRadius="md"
      overflow="hidden"
    >
      {/* Header */}
      <Box
        w="full"
        p={4}
        bg="blue.50"
        borderBottom="1px solid"
        borderColor="gray.200"
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

      {/* Mensagens */}
      <Box
        ref={scrollRef}
        flex={1}
        w="full"
        overflowY="auto"
        p={4}
        css={{
          '&::-webkit-scrollbar': { width: '4px' },
          '&::-webkit-scrollbar-thumb': { background: '#CBD5E0', borderRadius: '24px' },
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
                maxW="75%"
                bg={mensagem.tipo === 'usuario' ? 'blue.600' : 'white'}
                color={mensagem.tipo === 'usuario' ? 'white' : 'gray.800'}
                shadow="sm"
                border={mensagem.tipo === 'ia' ? '1px solid #E2E8F0' : 'none'}
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
              <Card
                bg="white"
                border="1px solid #E2E8F0"
              >
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

      {/* Sugestões */}
      {mensagens.length <= 2 && (
        <Box
          w="full"
          p={2}
          borderTop="1px solid"
          borderColor="gray.200"
          bg="white"
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

      {/* Input */}
      <Box
        w="full"
        p={3}
        borderTop="1px solid"
        borderColor="gray.200"
        bg="white"
        position="sticky"
        bottom="0"
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
