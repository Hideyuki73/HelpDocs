'use client'

import { useState } from 'react'
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
  Text,
  Box,
  Select,
} from '@chakra-ui/react'
import { EquipeFormData } from '../types'
import { useDocumentos } from '../hooks/useDocumentos'

interface ModalCriarEquipeProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: EquipeFormData) => Promise<void>
}

export function ModalCriarEquipe({ isOpen, onClose, onSubmit }: ModalCriarEquipeProps) {
  const [formData, setFormData] = useState<EquipeFormData>({
    nome: '',
    documentoId: '',
    membros: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { documentos, loading } = useDocumentos()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim()) {
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
      const submitData = {
        nome: formData.nome.trim(),
        ...(formData.documentoId?.trim() && { documentoId: formData.documentoId.trim() }),
      }

      await onSubmit(submitData)
      toast({
        title: 'Equipe criada',
        description: 'A equipe foi criada com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      handleClose()
    } catch (error: any) {
      toast({
        title: 'Erro ao criar equipe',
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
      documentoId: '',
      membros: [],
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
    >
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Criar Nova Equipe</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Nome da Equipe</FormLabel>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                  placeholder="Digite o nome da equipe"
                  disabled={isSubmitting}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Documento associado (Opcional)</FormLabel>
                <Select
                  placeholder={loading ? 'Carregando documentos...' : 'Selecione um documento'}
                  value={formData.documentoId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, documentoId: e.target.value }))}
                  disabled={isSubmitting || loading}
                >
                  {documentos.map((doc) => (
                    <option
                      key={doc.id}
                      value={doc.id}
                    >
                      {doc.titulo}
                    </option>
                  ))}
                </Select>
                <Text
                  fontSize="sm"
                  color="gray.500"
                  mt={1}
                >
                  Você pode associar um documento específico a esta equipe
                </Text>
              </FormControl>
              <Box
                p={3}
                bg="blue.50"
                borderRadius="md"
                borderLeft="4px solid"
                borderLeftColor="blue.500"
                w="full"
              >
                <Text
                  fontSize="sm"
                  color="blue.700"
                >
                  <strong>Dica:</strong> Após criar a equipe, você poderá adicionar membros através do menu de ações.
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={isSubmitting}
              loadingText="Criando..."
            >
              Criar Equipe
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
