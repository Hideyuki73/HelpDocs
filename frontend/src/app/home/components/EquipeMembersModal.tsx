'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Box,
  Divider,
  Icon,
  SimpleGrid,
  Card,
  CardBody,
  useColorModeValue,
} from '@chakra-ui/react'
import { FaUsers, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa'
import { Equipe } from '@/app/equipes/types'

interface EquipeMember {
  id: string
  nome: string
  email?: string
  telefone?: string
  cargo?: string
  avatar?: string
  dataIngresso?: Date
  status?: 'ativo' | 'inativo'
}

interface EquipeMembersModalProps {
  isOpen: boolean
  onClose: () => void
  equipe: Equipe & {
    membros?: EquipeMember[]
  }
}

export function EquipeMembersModal({ isOpen, onClose, equipe }: EquipeMembersModalProps) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativo':
        return 'green'
      case 'inativo':
        return 'red'
      default:
        return 'gray'
    }
  }

  // Mock data se não houver membros
  const mockMembers: EquipeMember[] = [
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao.silva@empresa.com',
      cargo: 'Desenvolvedor Senior',
      avatar: '',
      dataIngresso: new Date(2023, 0, 15),
      status: 'ativo',
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria.santos@empresa.com',
      cargo: 'Designer UX/UI',
      avatar: '',
      dataIngresso: new Date(2023, 2, 10),
      status: 'ativo',
    },
    {
      id: '3',
      nome: 'Pedro Costa',
      email: 'pedro.costa@empresa.com',
      cargo: 'Analista de Sistemas',
      avatar: '',
      dataIngresso: new Date(2023, 1, 20),
      status: 'ativo',
    },
  ]

  const membros = equipe.membros && equipe.membros.length > 0 ? equipe.membros : mockMembers

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={FaUsers} color="blue.500" />
            <VStack align="start" spacing={0}>
              <Text>Membros da Equipe</Text>
              <Text fontSize="sm" fontWeight="normal" color="gray.600">
                {equipe.nome} • {membros.length} {membros.length === 1 ? 'membro' : 'membros'}
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {membros.length === 0 ? (
              <Box textAlign="center" py={8}>
                <Icon as={FaUsers} boxSize={12} color="gray.400" mb={4} />
                <Text color="gray.500">Nenhum membro encontrado nesta equipe</Text>
              </Box>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {membros.map((membro, index) => (
                  <Card
                    key={membro.id}
                    bg={cardBg}
                    border="1px"
                    borderColor={borderColor}
                    _hover={{ borderColor: 'blue.300' }}
                    transition="all 0.2s"
                  >
                    <CardBody>
                      <VStack spacing={3} align="start">
                        <HStack spacing={3} w="full">
                          <Avatar
                            name={membro.nome}
                            src={membro.avatar}
                            size="md"
                          />
                          <VStack align="start" spacing={1} flex={1}>
                            <HStack spacing={2} w="full">
                              <Text fontWeight="bold" fontSize="md" noOfLines={1}>
                                {membro.nome}
                              </Text>
                              <Badge
                                colorScheme={getStatusColor(membro.status || 'ativo')}
                                size="sm"
                              >
                                {membro.status || 'Ativo'}
                              </Badge>
                            </HStack>
                            {membro.cargo && (
                              <Text fontSize="sm" color="gray.600" noOfLines={1}>
                                {membro.cargo}
                              </Text>
                            )}
                          </VStack>
                        </HStack>

                        <Divider />

                        <VStack spacing={2} align="start" w="full">
                          {membro.email && (
                            <HStack spacing={2} fontSize="sm">
                              <Icon as={FaEnvelope} color="gray.500" boxSize={3} />
                              <Text color="gray.600" noOfLines={1}>
                                {membro.email}
                              </Text>
                            </HStack>
                          )}
                          
                          {membro.telefone && (
                            <HStack spacing={2} fontSize="sm">
                              <Icon as={FaPhone} color="gray.500" boxSize={3} />
                              <Text color="gray.600">
                                {membro.telefone}
                              </Text>
                            </HStack>
                          )}
                          
                          {membro.dataIngresso && (
                            <HStack spacing={2} fontSize="sm">
                              <Icon as={FaCalendarAlt} color="gray.500" boxSize={3} />
                              <Text color="gray.600">
                                Desde {formatDate(membro.dataIngresso)}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Fechar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
