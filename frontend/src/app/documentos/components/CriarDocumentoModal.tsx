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
} from '@chakra-ui/react'
import { useState } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase'

interface Equipe {
  id: string
  nome: string
}

interface CriarDocumentoModalProps {
  isOpen: boolean
  onClose: () => void
  equipes: Equipe[]
  onSuccess: () => void
}

export function CriarDocumentoModal({ isOpen, onClose, equipes, onSuccess }: CriarDocumentoModalProps) {
  const [user] = useAuthState(auth)
  const toast = useToast()
  const [loading, setLoading] = useState(false)
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
      setLoading(true)
      
      const response = await fetch('/api/documentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tipo: 'criado',
          criadoPor: user?.uid,
          empresaId: 'empresa-id', // Você precisará obter o ID da empresa do usuário
        }),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Documento criado com sucesso',
          status: 'success',
          duration: 3000,
        })
        
        setFormData({
          titulo: '',
          descricao: '',
          equipeId: '',
          conteudo: '',
        })
        
        onClose()
        onSuccess()
      } else {
        throw new Error('Erro ao criar documento')
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar documento',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      titulo: '',
      descricao: '',
      equipeId: '',
      conteudo: '',
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Criar Novo Documento</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Título</FormLabel>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Digite o título do documento"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Descrição</FormLabel>
              <Textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Digite uma descrição para o documento"
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
                {equipes.map(equipe => (
                  <option key={equipe.id} value={equipe.id}>
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
                placeholder="Digite o conteúdo inicial do documento"
                rows={6}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={loading}
            loadingText="Criando..."
          >
            Criar Documento
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
