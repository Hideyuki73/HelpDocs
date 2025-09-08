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
  Box,
  Text,
  HStack,
} from '@chakra-ui/react'
import { useState, useRef } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase'
import { FaUpload, FaFile } from 'react-icons/fa'
import { useDocumentos } from '../hooks/useDocumentos'

interface Equipe {
  id: string
  nome: string
}

interface UploadDocumentoModalProps {
  isOpen: boolean
  onClose: () => void
  equipes: Equipe[]
  onSuccess: () => void
}

export function UploadDocumentoModal({ isOpen, onClose, equipes, onSuccess }: UploadDocumentoModalProps) {
  const [user] = useAuthState(auth)
  const toast = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    equipeId: '',
  })

  const { criar, loading } = useDocumentos()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!formData.titulo) {
        setFormData({ ...formData, titulo: file.name.split('.')[0] })
      }
    }
  }

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.descricao || !formData.equipeId || !selectedFile) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos e selecione um arquivo',
        status: 'error',
        duration: 3000,
      })
      return
    }

    try {
      await criar({
        ...formData,
        tipo: 'upload',
        criadoPor: user?.uid || '',
        nomeArquivo: selectedFile.name,
        tamanhoArquivo: selectedFile.size,
      })

      toast({
        title: 'Sucesso',
        description: 'Arquivo enviado com sucesso',
        status: 'success',
        duration: 3000,
      })

      handleClose()
      onSuccess()
    } catch {
      toast({
        title: 'Erro',
        description: 'Erro ao fazer upload do arquivo',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const handleClose = () => {
    setFormData({ titulo: '', descricao: '', equipeId: '' })
    setSelectedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClose()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload de Documento</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Arquivo</FormLabel>
              <Box
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="md"
                p={6}
                textAlign="center"
                cursor="pointer"
                _hover={{ borderColor: 'blue.400', bg: 'gray.50' }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Input
                  ref={fileInputRef}
                  type="file"
                  display="none"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.md"
                />

                {selectedFile ? (
                  <VStack spacing={2}>
                    <FaFile
                      size={24}
                      color="blue"
                    />
                    <Text fontWeight="bold">{selectedFile.name}</Text>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                    >
                      {formatFileSize(selectedFile.size)}
                    </Text>
                  </VStack>
                ) : (
                  <VStack spacing={2}>
                    <FaUpload
                      size={24}
                      color="gray"
                    />
                    <Text>Clique para selecionar um arquivo</Text>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                    >
                      PDF, DOC, DOCX, TXT, MD
                    </Text>
                  </VStack>
                )}
              </Box>
            </FormControl>

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
            colorScheme="green"
            onClick={handleSubmit}
            isLoading={loading}
            leftIcon={<FaUpload />}
          >
            Fazer Upload
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
