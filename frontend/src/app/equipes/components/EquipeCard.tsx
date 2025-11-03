'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  useColorModeValue,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react'
import { Equipe } from '../types'
import { useAuth } from '@/app/user/hooks/useAuth'
import { FaBars, FaEdit, FaTrash, FaComment } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

interface EquipeCardProps {
  equipe: Equipe
  onDelete: (equipeId: string) => Promise<void>
  onEdit: (equipe: Equipe) => void
  onViewDetails: (equipe: Equipe) => void
}

export function EquipeCard({ equipe, onDelete, onEdit, onViewDetails }: EquipeCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isDeleting, setIsDeleting] = useState(false)
  const toast = useToast()

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  const isAdmin = user?.cargo === 'Administrador'
  const isGerente = user?.cargo === 'Gerente de Projetos'
  const canManage = isAdmin || isGerente
  const canDelete = isAdmin

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(equipe.id)
      toast({
        title: 'Equipe deletada',
        description: 'A equipe foi removida com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      onClose()
    } catch (error: any) {
      toast({
        title: 'Erro ao deletar equipe',
        description: error.message || 'Ocorreu um erro inesperado.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card
        bg={cardBg}
        borderColor={borderColor}
        borderWidth={1}
        borderRadius="lg"
        shadow="sm"
        _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
        transition="all 0.2s"
        cursor="pointer"
        onClick={() => onViewDetails(equipe)}
      >
        <CardHeader pb={2}>
          <HStack
            justify="space-between"
            align="start"
          >
            <VStack
              align="start"
              spacing={1}
              flex={1}
            >
              <Heading
                size="md"
                color={useColorModeValue('gray.800', 'white')}
              >
                {equipe.nome}
              </Heading>
              <HStack spacing={2}>
                <Badge
                  colorScheme="blue"
                  variant="subtle"
                >
                  {equipe.membros.length} {equipe.membros.length === 1 ? 'membro' : 'membros'}
                </Badge>
                {equipe.documentoId && (
                  <Badge
                    colorScheme="green"
                    variant="subtle"
                  >
                    Com documento
                  </Badge>
                )}
              </HStack>
            </VStack>

            {canManage && (
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FaBars />}
                  variant="ghost"
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <MenuList>
                  <MenuItem
                    icon={<FaEdit />}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit(equipe)
                    }}
                  >
                    Editar
                  </MenuItem>
                  <MenuItem
                    icon={<FaComment />}
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/equipes/chat?slug=${equipe.id}`)
                    }}
                  >
                    Abrir Chat
                  </MenuItem>
                  {canDelete && (
                    <MenuItem
                      icon={<FaTrash />}
                      color="red.500"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpen()
                      }}
                    >
                      Apagar equipe
                    </MenuItem>
                  )}
                </MenuList>
              </Menu>
            )}
          </HStack>
        </CardHeader>

        <CardBody pt={0}>
          <VStack
            align="start"
            spacing={2}
          >
            <Text
              fontSize="sm"
              color={textColor}
            >
              Criada em: {new Date(equipe.dataCadastro).toLocaleString('pt-BR')}
            </Text>

            {equipe.membros.length > 0 && (
              <Text
                fontSize="sm"
                color={textColor}
              >
                Membros: {equipe.membros.length} pessoa{equipe.membros.length !== 1 ? 's' : ''}
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>

      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={React.createRef()}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
            >
              Deletar Equipe
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack
                align="start"
                spacing={3}
              >
                <Text>
                  Tem certeza que deseja deletar a equipe <strong>{equipe.nome}</strong>?
                </Text>
                <Box
                  p={3}
                  bg="red.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderLeftColor="red.500"
                >
                  <Text
                    fontSize="sm"
                    color="red.700"
                  >
                    <strong>Atenção:</strong> Esta ação é irreversível. Todos os dados da equipe serão perdidos
                    permanentemente.
                  </Text>
                </Box>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                onClick={onClose}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={isDeleting}
                loadingText="Deletando..."
              >
                Apagar equipe
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}
