'use client'

import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  VStack,
  useToast,
  Text,
  Box,
  Checkbox,
  CheckboxGroup,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react'
import { Equipe } from '../types'
import { listarFuncionarios } from '@/action/funcionario'

interface Funcionario {
  id: string
  nome: string
  email: string
  cargo: string
}

interface ModalAdicionarMembroProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (equipeId: string, membros: string[]) => Promise<void>
  equipe: Equipe | null
}

export function ModalAdicionarMembro({ isOpen, onClose, onSubmit, equipe }: ModalAdicionarMembroProps) {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([])
  const [selectedMembros, setSelectedMembros] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (isOpen) {
      carregarFuncionarios()
    }
  }, [isOpen])

  const carregarFuncionarios = async () => {
    setIsLoading(true)
    try {
      const funcionariosList = await listarFuncionarios()
      // Filtra funcionários que não são membros da equipe atual
      const funcionariosDisponiveis = funcionariosList.filter(
        (func: Funcionario) => !equipe?.membros.includes(func.id)
      )
      setFuncionarios(funcionariosDisponiveis)
    } catch (error: any) {
      console.error('Erro ao carregar funcionários:', error)
      toast({
        title: 'Erro ao carregar funcionários',
        description: error.message || 'Ocorreu um erro inesperado.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!equipe) return
    
    if (selectedMembros.length === 0) {
      toast({
        title: 'Selecione pelo menos um membro',
        description: 'Por favor, selecione pelo menos um funcionário para adicionar à equipe.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(equipe.id, selectedMembros)
      toast({
        title: 'Membros adicionados',
        description: `${selectedMembros.length} membro(s) adicionado(s) com sucesso.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      handleClose()
    } catch (error: any) {
      toast({
        title: 'Erro ao adicionar membros',
        description: error.message || 'Ocorreu um erro inesperado.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedMembros([])
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Adicionar Membros à Equipe</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="md" fontWeight="medium">
                Equipe: <strong>{equipe?.nome}</strong>
              </Text>
              
              <Text fontSize="sm" color="gray.600">
                Membros atuais: {equipe?.membros.length || 0}
              </Text>

              <FormControl>
                <FormLabel>Selecione os funcionários para adicionar:</FormLabel>
                
                {isLoading ? (
                  <Box textAlign="center" py={4}>
                    <Spinner size="md" />
                    <Text mt={2} fontSize="sm" color="gray.500">
                      Carregando funcionários...
                    </Text>
                  </Box>
                ) : funcionarios.length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    Todos os funcionários já são membros desta equipe ou não há funcionários disponíveis.
                  </Alert>
                ) : (
                  <CheckboxGroup
                    value={selectedMembros}
                    onChange={(values) => setSelectedMembros(values as string[])}
                  >
                    <VStack align="stretch" spacing={2} maxH="300px" overflowY="auto">
                      {funcionarios.map((funcionario) => (
                        <Box
                          key={funcionario.id}
                          p={3}
                          borderWidth={1}
                          borderRadius="md"
                          _hover={{ bg: 'gray.50' }}
                        >
                          <Checkbox value={funcionario.id}>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">{funcionario.nome}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {funcionario.email} • {funcionario.cargo}
                              </Text>
                            </VStack>
                          </Checkbox>
                        </Box>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                )}
              </FormControl>

              {selectedMembros.length > 0 && (
                <Box p={3} bg="blue.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="blue.500">
                  <Text fontSize="sm" color="blue.700">
                    <strong>{selectedMembros.length}</strong> membro(s) selecionado(s) para adicionar à equipe.
                  </Text>
                </Box>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              colorScheme="blue" 
              type="submit"
              isLoading={isSubmitting}
              loadingText="Adicionando..."
              disabled={selectedMembros.length === 0 || isLoading}
            >
              Adicionar Membros
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

