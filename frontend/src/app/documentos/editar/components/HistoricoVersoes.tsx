'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Badge,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Center,
  Tooltip,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Textarea,
  Flex,
  Spacer,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FaHistory, FaEye, FaUndo, FaClock, FaUser, FaCode, FaCompressArrowsAlt } from 'react-icons/fa'
import {
  listarVersoesDocumento,
  obterVersaoDocumento,
  restaurarVersaoDocumento,
  compararVersoes,
  VersaoDocumento,
} from '@/action/versao-documento'

interface HistoricoVersoesProps {
  documentoId: string
  usuarioId: string
  versaoAtual: number
  onVersaoRestaurada?: () => void
}

export function HistoricoVersoes({ documentoId, usuarioId, versaoAtual, onVersaoRestaurada }: HistoricoVersoesProps) {
  const [versoes, setVersoes] = useState<VersaoDocumento[]>([])
  const [loading, setLoading] = useState(false)
  const [versaoSelecionada, setVersaoSelecionada] = useState<VersaoDocumento | null>(null)
  const [comparacao, setComparacao] = useState<any>(null)
  const [restaurando, setRestaurando] = useState(false)

  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()

  const { isOpen: isCompareModalOpen, onOpen: onCompareModalOpen, onClose: onCompareModalClose } = useDisclosure()

  const toast = useToast()

  useEffect(() => {
    carregarVersoes()
  }, [documentoId])

  const carregarVersoes = async () => {
    setLoading(true)
    try {
      const versoesData = await listarVersoesDocumento(documentoId)
      // Ordenar por número da versão (mais recente primeiro)
      const versoesOrdenadas = versoesData.sort(
        (a: VersaoDocumento, b: VersaoDocumento) => b.numeroVersao - a.numeroVersao,
      )
      setVersoes(versoesOrdenadas)
    } catch (error) {
      toast({
        title: 'Erro ao carregar histórico',
        description: 'Não foi possível carregar o histórico de versões.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const visualizarVersao = async (versao: VersaoDocumento) => {
    try {
      const versaoCompleta = await obterVersaoDocumento(versao.id)
      setVersaoSelecionada(versaoCompleta)
      onModalOpen()
    } catch (error) {
      toast({
        title: 'Erro ao carregar versão',
        description: 'Não foi possível carregar o conteúdo da versão.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const restaurarVersao = async (versao: VersaoDocumento) => {
    setRestaurando(true)
    try {
      await restaurarVersaoDocumento(documentoId, versao.id, usuarioId)
      toast({
        title: 'Versão restaurada!',
        description: `A versão ${versao.numeroVersao} foi restaurada com sucesso.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      onVersaoRestaurada?.()
      await carregarVersoes()
    } catch (error) {
      toast({
        title: 'Erro ao restaurar versão',
        description: 'Não foi possível restaurar a versão selecionada.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setRestaurando(false)
    }
  }

  const compararComVersaoAtual = async (versao: VersaoDocumento) => {
    try {
      // Para comparar com a versão atual, precisamos da versão mais recente
      const versaoMaisRecente = versoes[0]
      if (versaoMaisRecente && versaoMaisRecente.id !== versao.id) {
        const resultadoComparacao = await compararVersoes(versao.id, versaoMaisRecente.id)
        setComparacao(resultadoComparacao)
        onCompareModalOpen()
      }
    } catch (error) {
      toast({
        title: 'Erro na comparação',
        description: 'Não foi possível comparar as versões.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const formatarData = (data: string | Date) => {
    console.log(data)
    const d = new Date(data)
    if (isNaN(d.getTime())) return 'Data inválida'
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
  }

  if (loading) {
    return (
      <Center p={8}>
        <VStack>
          <Spinner
            size="lg"
            color="blue.500"
          />
          <Text>Carregando histórico de versões...</Text>
        </VStack>
      </Center>
    )
  }

  return (
    <Box>
      <VStack
        spacing={4}
        align="stretch"
      >
        <HStack>
          <FaHistory color="blue" />
          <Text
            fontSize="lg"
            fontWeight="bold"
          >
            Histórico de Versões
          </Text>
          <Badge
            colorScheme="blue"
            ml={2}
          >
            {versoes.length} versões
          </Badge>
        </HStack>

        {versoes.length === 0 ? (
          <Alert
            status="info"
            borderRadius="md"
          >
            <AlertIcon />
            <Box>
              <AlertTitle>Nenhuma versão encontrada</AlertTitle>
              <AlertDescription>Este documento ainda não possui histórico de versões.</AlertDescription>
            </Box>
          </Alert>
        ) : (
          <VStack
            spacing={3}
            align="stretch"
          >
            {versoes.map((versao, index) => (
              <Card
                key={versao.id}
                variant={versao.numeroVersao === versaoAtual ? 'filled' : 'outline'}
                bg={versao.numeroVersao === versaoAtual ? 'blue.50' : 'white'}
                borderColor={versao.numeroVersao === versaoAtual ? 'blue.200' : 'gray.200'}
              >
                <CardBody p={4}>
                  <Flex align="center">
                    <VStack
                      align="start"
                      spacing={1}
                      flex={1}
                    >
                      <HStack>
                        <Badge
                          colorScheme={versao.numeroVersao === versaoAtual ? 'blue' : 'gray'}
                          variant="solid"
                        >
                          Versão {versao.numeroVersao}
                        </Badge>
                        {index === 0 && (
                          <Badge
                            colorScheme="green"
                            variant="outline"
                          >
                            Mais recente
                          </Badge>
                        )}
                        {versao.numeroVersao === versaoAtual && (
                          <Badge
                            colorScheme="blue"
                            variant="outline"
                          >
                            Atual
                          </Badge>
                        )}
                      </HStack>

                      <HStack
                        spacing={4}
                        fontSize="sm"
                        color="gray.600"
                      >
                        <HStack>
                          <FaClock size="12px" />
                          <Text>{formatarData(versao.dataCriacao)}</Text>
                        </HStack>
                        <HStack>
                          <FaUser size="12px" />
                          <Text>Responsável: {versao.nomeAutor ? versao.nomeAutor : versao.criadoPor}</Text>
                        </HStack>
                      </HStack>
                    </VStack>

                    <Spacer />

                    <HStack spacing={2}>
                      <Tooltip label="Visualizar conteúdo">
                        <IconButton
                          aria-label="Visualizar"
                          icon={<FaEye />}
                          size="sm"
                          variant="ghost"
                          onClick={() => visualizarVersao(versao)}
                        />
                      </Tooltip>

                      {versao.numeroVersao !== versaoAtual && (
                        <>
                          <Tooltip label="Comparar com versão atual">
                            <IconButton
                              aria-label="Comparar"
                              icon={<FaCompressArrowsAlt />}
                              size="sm"
                              variant="ghost"
                              onClick={() => compararComVersaoAtual(versao)}
                            />
                          </Tooltip>

                          <Tooltip label="Restaurar esta versão">
                            <IconButton
                              aria-label="Restaurar"
                              icon={<FaUndo />}
                              size="sm"
                              variant="ghost"
                              colorScheme="orange"
                              onClick={() => restaurarVersao(versao)}
                              isLoading={restaurando}
                            />
                          </Tooltip>
                        </>
                      )}
                    </HStack>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>

      {/* Modal de Visualização de Versão */}
      <Modal
        isOpen={isModalOpen}
        onClose={onModalClose}
        size="4xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FaEye />
              <Text>Versão {versaoSelecionada?.numeroVersao}</Text>
              <Badge colorScheme="blue">{versaoSelecionada && formatarData(versaoSelecionada.dataCriacao)}</Badge>
            </HStack>
          </ModalHeader>
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
                  <AlertTitle>Visualização de Versão Anterior</AlertTitle>
                  <AlertDescription>
                    Este é o conteúdo da versão {versaoSelecionada?.numeroVersao}. Para restaurar esta versão, feche
                    este modal e clique no botão de restaurar.
                  </AlertDescription>
                </Box>
              </Alert>

              <Box>
                <Text
                  fontWeight="bold"
                  mb={2}
                >
                  Conteúdo:
                </Text>
                <Textarea
                  value={versaoSelecionada?.conteudo || ''}
                  readOnly
                  h="400px"
                  fontFamily="mono"
                  fontSize="sm"
                  bg="gray.50"
                  border="1px solid"
                  borderColor="gray.200"
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onModalClose}>Fechar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Comparação */}
      <Modal
        isOpen={isCompareModalOpen}
        onClose={onCompareModalClose}
        size="6xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FaCode />
              <Text>Comparação de Versões</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {comparacao && (
              <VStack
                align="stretch"
                spacing={4}
              >
                <HStack justify="space-between">
                  <Badge colorScheme="red">Versão {comparacao.versao1.numeroVersao}</Badge>
                  <Badge colorScheme="green">Versão {comparacao.versao2.numeroVersao} (Atual)</Badge>
                </HStack>

                <Divider />

                <Box>
                  <Text
                    fontWeight="bold"
                    mb={2}
                  >
                    Diferenças encontradas: {comparacao.diferencas.length}
                  </Text>

                  {comparacao.diferencas.length === 0 ? (
                    <Alert
                      status="success"
                      borderRadius="md"
                    >
                      <AlertIcon />
                      <Text>As versões são idênticas!</Text>
                    </Alert>
                  ) : (
                    <VStack
                      align="stretch"
                      spacing={2}
                    >
                      {comparacao.diferencas.slice(0, 10).map((diff: any, index: number) => (
                        <Card
                          key={index}
                          size="sm"
                        >
                          <CardBody p={3}>
                            <Text
                              fontSize="sm"
                              fontWeight="bold"
                              mb={1}
                            >
                              Linha {diff.numeroLinha} - {diff.tipo}
                            </Text>
                            {diff.linhaAnterior && (
                              <Text
                                fontSize="xs"
                                color="red.600"
                                bg="red.50"
                                p={2}
                                borderRadius="md"
                              >
                                - {diff.linhaAnterior}
                              </Text>
                            )}
                            {diff.linhaNova && (
                              <Text
                                fontSize="xs"
                                color="green.600"
                                bg="green.50"
                                p={2}
                                borderRadius="md"
                              >
                                + {diff.linhaNova}
                              </Text>
                            )}
                          </CardBody>
                        </Card>
                      ))}

                      {comparacao.diferencas.length > 10 && (
                        <Text
                          fontSize="sm"
                          color="gray.600"
                          textAlign="center"
                        >
                          ... e mais {comparacao.diferencas.length - 10} diferenças
                        </Text>
                      )}
                    </VStack>
                  )}
                </Box>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onCompareModalClose}>Fechar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
