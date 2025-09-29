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
  Select,
  Checkbox,
  CheckboxGroup,
  Spinner,
} from '@chakra-ui/react'
import { Equipe, EquipeFormData } from '../types'
import { useDocumentos } from '../hooks/useDocumentos'
import { useEquipes } from '../hooks/useEquipes'

interface ModalEditarEquipeProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (equipeId: string, data: Partial<EquipeFormData>) => Promise<void>
  equipe: Equipe | null
}

export function ModalEditarEquipe({ isOpen, onClose, onSubmit, equipe }: ModalEditarEquipeProps) {
  const [formData, setFormData] = useState<Partial<EquipeFormData>>({ nome: '', documentoId: '' })
  const [selectedMembros, setSelectedMembros] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { documentos, loading: loadingDocs } = useDocumentos()
  const { membrosEmpresa, adicionarMembro, removerMembro, loadingMembros } = useEquipes()
  const toast = useToast()

  useEffect(() => {
    if (equipe) {
      setFormData({
        nome: equipe.nome,
        documentoId: equipe.documentoId || '',
      })
      setSelectedMembros(equipe.membros || [])
    }
  }, [equipe])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!equipe) return

    if (!formData.nome?.trim()) {
      toast({ title: 'Nome obrigatório', status: 'warning' })
      return
    }

    setIsSubmitting(true)
    try {
      const submitData: Partial<EquipeFormData> = {
        nome: formData.nome.trim(),
        documentoId: formData.documentoId?.trim(),
      }
      await onSubmit(equipe.id, submitData)

      // 🔹 Atualizar membros: compara seleção com os atuais
      const novos = selectedMembros.filter((id) => !equipe.membros.includes(id))
      const removidos = equipe.membros.filter((id) => !selectedMembros.includes(id))

      if (novos.length) await adicionarMembro(equipe.id, novos)
      for (const rem of removidos) {
        await removerMembro(equipe.id, rem)
      }

      toast({ title: 'Equipe atualizada', status: 'success' })
      handleClose()
    } catch (err: any) {
      toast({ title: 'Erro ao atualizar equipe', description: err.message, status: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({ nome: '', documentoId: '' })
    setSelectedMembros([])
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
    >
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Editar Equipe</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack
              spacing={4}
              align="stretch"
            >
              <FormControl isRequired>
                <FormLabel>Nome da Equipe</FormLabel>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData((p) => ({ ...p, nome: e.target.value }))}
                  placeholder="Digite o nome da equipe"
                  disabled={isSubmitting}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Documento associado (Opcional)</FormLabel>
                <Select
                  placeholder={loadingDocs ? 'Carregando...' : 'Selecione'}
                  value={formData.documentoId}
                  onChange={(e) => setFormData((p) => ({ ...p, documentoId: e.target.value }))}
                  disabled={isSubmitting || loadingDocs}
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
              </FormControl>

              <FormControl>
                <FormLabel>Membros da equipe</FormLabel>
                {loadingMembros ? (
                  <Spinner />
                ) : (
                  <CheckboxGroup
                    value={selectedMembros}
                    onChange={(v) => setSelectedMembros(v as string[])}
                  >
                    <VStack align="start">
                      {membrosEmpresa.map((m) => (
                        <Checkbox
                          key={m.id}
                          value={m.id}
                        >
                          {m.nome} • {m.cargo}
                        </Checkbox>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                )}
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
              type="submit"
              isLoading={isSubmitting}
            >
              Salvar
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
