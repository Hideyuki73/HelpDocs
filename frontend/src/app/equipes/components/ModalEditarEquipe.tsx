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
  Input,
  VStack,
  useToast,
  Text
} from '@chakra-ui/react'
import { Equipe, EquipeFormData } from '../types'

interface ModalEditarEquipeProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (equipeId: string, data: Partial<EquipeFormData>) => Promise<void>
  equipe: Equipe | null
}

export function ModalEditarEquipe({ isOpen, onClose, onSubmit, equipe }: ModalEditarEquipeProps) {
  const [formData, setFormData] = useState<Partial<EquipeFormData>>({
    nome: '',
    documentoId: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (equipe) {
      setFormData({
        nome: equipe.nome,
        documentoId: equipe.documentoId || ''
      })
    }
  }, [equipe])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!equipe) return
    
    if (!formData.nome?.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome da equipe.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)
    try {
      const submitData: Partial<EquipeFormData> = {
        nome: formData.nome.trim(),
      }
      
      if (formData.documentoId?.trim()) {
        submitData.documentoId = formData.documentoId.trim()
      }
      
      await onSubmit(equipe.id, submitData)
      toast({
        title: 'Equipe atualizada',
        description: 'A equipe foi atualizada com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      handleClose()
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar equipe',
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
    setFormData({
      nome: '',
      documentoId: ''
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Editar Equipe</ModalHeader>
          <ModalCloseButton />
          
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nome da Equipe</FormLabel>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Digite o nome da equipe"
                  disabled={isSubmitting}
                />
              </FormControl>

              <FormControl>
                <FormLabel>ID do Documento (Opcional)</FormLabel>
                <Input
                  value={formData.documentoId}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentoId: e.target.value }))}
                  placeholder="ID do documento associado"
                  disabled={isSubmitting}
                />
                <Text fontSize="sm" color="gray.500" mt={1}>
                  Você pode associar um documento específico a esta equipe
                </Text>
              </FormControl>
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
              loadingText="Salvando..."
            >
              Salvar Alterações
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

