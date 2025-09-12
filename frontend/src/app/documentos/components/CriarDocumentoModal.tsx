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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  useToast,
  Portal,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase'
import { useDocumentos } from '../hooks/useDocumentos'
import { DocumentoParams } from '@/action/documento'

interface Equipe {
  id: string
  nome: string
}

interface CriarDocumentoModalProps {
  isOpen: boolean
  onClose: () => void
  equipes: Equipe[]
  onSubmit: (formData: DocumentoParams) => Promise<any>
}

export function CriarDocumentoModal({ isOpen, onClose, equipes, onSubmit }: CriarDocumentoModalProps) {
  const [user] = useAuthState(auth)
  const toast = useToast()
  const { criar, loading } = useDocumentos()
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    equipeId: '',
    conteudo: '',
  })

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.descricao || !formData.equipeId) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        status: 'error',
        duration: 3000,
      })
      return
    }

    try {
      await onSubmit({
        ...formData,
        tipo: 'criado',
        criadoPor: user?.uid || '',
      })

      toast({
        title: 'Sucesso',
        description: 'Documento criado com sucesso',
        status: 'success',
        duration: 3000,
      })

      handleClose()
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao criar documento',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleClose = () => {
    setFormData({ titulo: '', descricao: '', equipeId: '', conteudo: '' })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      motionPreset="scale"
    >
      <ModalOverlay zIndex={1400} />
      <ModalContent zIndex={1500}>
        <ModalHeader>Criar Novo Documento</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Título</FormLabel>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Descrição</FormLabel>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                rows={3}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Equipe</FormLabel>
              <Select
                value={formData.equipeId}
                onChange={(e) => setFormData({ ...formData, equipeId: e.target.value })}
                placeholder="Selecione a equipe responsável"
              >
                {equipes.map((equipe) => (
                  <option
                    key={equipe.id}
                    value={equipe.id}
                  >
                    {equipe.nome}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Conteúdo Inicial (opcional)</FormLabel>
              <Textarea
                value={formData.conteudo}
                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                rows={6}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
          >
            Criar Documento
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
