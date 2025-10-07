'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Avatar,
  AvatarGroup,
  Card,
  CardBody,
  Heading,
  Divider,
  Button,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { FaUsers, FaUser, FaCrown, FaCalendarAlt, FaEdit, FaPlus, FaCheckCircle } from 'react-icons/fa'
import { Equipe, obterEquipePorId } from '@/action/equipe'
import { getFuncionario } from '@/action/funcionario'

interface EquipeResponsavelProps {
  equipeId: string
  onEquipeChange?: (equipe: Equipe | null) => void
}

export function EquipeResponsavel({ equipeId, onEquipeChange }: EquipeResponsavelProps) {
  const [equipe, setEquipe] = useState<Equipe | null>(null)
  const [criador, setCriador] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    if (equipeId) {
      carregarEquipe()
    } else {
      setEquipe(null)
      onEquipeChange?.(null)
    }
  }, [equipeId])

  const carregarEquipe = async () => {
    setLoading(true)
    setError(false)
    try {
      const equipeData = await obterEquipePorId(equipeId)
      const criador = await getFuncionario(equipeData.criadorId)
      setCriador(criador.nome)
      setEquipe(equipeData)
      onEquipeChange?.(equipeData)
    } catch (error) {
      console.error('Erro ao carregar equipe:', error)
      setError(true)
      toast({
        title: 'Erro ao carregar equipe',
        description: 'Não foi possível carregar as informações da equipe responsável.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (!equipeId) {
    return (
      <Card
        bg="orange.50"
        borderColor="orange.200"
        borderWidth="1px"
      >
        <CardBody p={4}>
          <Alert
            status="warning"
            borderRadius="md"
          >
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">Sem equipe atribuída</AlertTitle>
              <AlertDescription fontSize="xs">
                Este documento não possui uma equipe responsável atribuída.
              </AlertDescription>
            </Box>
          </Alert>
          <Button
            size="sm"
            colorScheme="orange"
            variant="outline"
            mt={3}
            leftIcon={<FaPlus />}
            w="full"
          >
            Atribuir Equipe
          </Button>
        </CardBody>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardBody p={4}>
          <VStack spacing={3}>
            <Spinner
              size="md"
              color="blue.500"
            />
            <Text
              fontSize="sm"
              color="gray.600"
            >
              Carregando informações da equipe...
            </Text>
          </VStack>
        </CardBody>
      </Card>
    )
  }

  if (error || !equipe) {
    return (
      <Card
        bg="red.50"
        borderColor="red.200"
        borderWidth="1px"
      >
        <CardBody p={4}>
          <Alert
            status="error"
            borderRadius="md"
          >
            <AlertIcon />
            <Box>
              <AlertTitle fontSize="sm">Erro ao carregar equipe</AlertTitle>
              <AlertDescription fontSize="xs">
                Não foi possível carregar as informações da equipe responsável.
              </AlertDescription>
            </Box>
          </Alert>
          <Button
            size="sm"
            colorScheme="red"
            variant="outline"
            mt={3}
            onClick={carregarEquipe}
            w="full"
          >
            Tentar Novamente
          </Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <Card
        bg="blue.50"
        borderColor="blue.200"
        borderWidth="1px"
      >
        <CardBody p={4}>
          <VStack
            align="start"
            spacing={4}
          >
            {/* Header */}
            <HStack
              justify="space-between"
              w="full"
            >
              <HStack>
                <FaUsers color="blue" />
                <Heading
                  size="sm"
                  color="blue.700"
                >
                  Equipe Responsável
                </Heading>
              </HStack>
              <Button
                size="xs"
                variant="ghost"
                colorScheme="blue"
                onClick={onOpen}
                leftIcon={<FaEdit />}
              >
                Detalhes
              </Button>
            </HStack>

            <Divider borderColor="blue.200" />

            {/* Nome da Equipe */}
            <Box w="full">
              <Text
                fontSize="lg"
                fontWeight="bold"
                color="blue.800"
              >
                {equipe.nome}
              </Text>
              <HStack
                spacing={2}
                mt={1}
              >
                <Badge
                  colorScheme="blue"
                  size="sm"
                >
                  {equipe.membros.length} membros
                </Badge>
                <Badge
                  colorScheme="green"
                  size="sm"
                  variant="outline"
                >
                  Ativa
                </Badge>
              </HStack>
            </Box>

            {/* Membros */}
            <Box w="full">
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color="gray.700"
                mb={2}
              >
                Membros da Equipe:
              </Text>
              <HStack
                spacing={2}
                wrap="wrap"
              >
                <AvatarGroup
                  size="sm"
                  max={4}
                >
                  {equipe.membros.map((membroId, index) => (
                    <Tooltip
                      key={membroId}
                      label={`Membro ${index + 1}: ${membroId}`}
                    >
                      <Avatar
                        size="sm"
                        name={`Membro ${index + 1}`}
                        bg="blue.500"
                        color="white"
                        icon={<FaUser />}
                      />
                    </Tooltip>
                  ))}
                </AvatarGroup>
                {equipe.membros.length > 4 && (
                  <Text
                    fontSize="xs"
                    color="gray.600"
                  >
                    +{equipe.membros.length - 4} mais
                  </Text>
                )}
              </HStack>
            </Box>

            {/* Criador */}
            <HStack
              spacing={2}
              w="full"
            >
              <FaCrown
                color="gold"
                size="14px"
              />
              <Text
                fontSize="sm"
                color="gray.700"
              >
                <Text
                  as="span"
                  fontWeight="semibold"
                >
                  Criador:
                </Text>{' '}
                {criador}
              </Text>
            </HStack>

            {/* Data de Criação */}
            <HStack
              spacing={2}
              w="full"
            >
              <FaCalendarAlt
                color="gray"
                size="12px"
              />
              <Text
                fontSize="xs"
                color="gray.600"
              >
                Criada em {formatarData(equipe.dataCadastro)}
              </Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <FaUsers />
              <Text>Detalhes da Equipe</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack
              align="stretch"
              spacing={6}
            >
              {/* Informações Gerais */}
              <Box>
                <Heading
                  size="md"
                  mb={3}
                >
                  {equipe.nome}
                </Heading>
                <HStack
                  spacing={4}
                  mb={4}
                >
                  <Badge
                    colorScheme="blue"
                    size="lg"
                  >
                    {equipe.membros.length} membros
                  </Badge>
                  <Badge
                    colorScheme="green"
                    size="lg"
                    variant="outline"
                  >
                    Equipe Ativa
                  </Badge>
                </HStack>

                <VStack
                  align="start"
                  spacing={2}
                >
                  <HStack>
                    <FaCrown color="gold" />
                    <Text>
                      <strong>Criador:</strong> {criador}
                    </Text>
                  </HStack>
                  <HStack>
                    <FaCalendarAlt color="gray" />
                    <Text>
                      <strong>Criada em:</strong> {formatarData(equipe.dataCadastro)}
                    </Text>
                  </HStack>
                  {equipe.documentoId && (
                    <HStack>
                      <FaCheckCircle color="green" />
                      <Text>
                        <strong>Documento atribuído:</strong> Sim
                      </Text>
                    </HStack>
                  )}
                </VStack>
              </Box>

              <Divider />

              {/* Lista de Membros */}
              <Box>
                <Heading
                  size="sm"
                  mb={3}
                >
                  Membros da Equipe ({equipe.membros.length})
                </Heading>
                <List spacing={2}>
                  {equipe.membros.map((membroId, index) => (
                    <ListItem key={membroId}>
                      <HStack>
                        <ListIcon
                          as={FaUser}
                          color="blue.500"
                        />
                        <Avatar
                          size="xs"
                          name={`Membro ${index + 1}`}
                          bg="blue.500"
                        />
                        <Text fontSize="sm">
                          Membro {index + 1} (ID: {membroId})
                        </Text>
                        {membroId === equipe.criadorId && (
                          <Badge
                            colorScheme="gold"
                            size="sm"
                          >
                            Criador
                          </Badge>
                        )}
                      </HStack>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={onClose}
            >
              Fechar
            </Button>
            <Button
              variant="outline"
              leftIcon={<FaEdit />}
            >
              Editar Equipe
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
