'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Button,
} from '@chakra-ui/react'

interface ModalSairEmpresaProps {
  isOpen: boolean
  onClose: () => void
  onSair: () => void
  loadingSair: boolean
  nomeEmpresa?: string
}

export default function ModalSairEmpresa({ isOpen, onClose, onSair, loadingSair, nomeEmpresa }: ModalSairEmpresaProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sair da Empresa</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Tem certeza que deseja sair da empresa <strong>{nomeEmpresa}</strong>?
          </Text>
          <Text
            mt={2}
            fontSize="sm"
            color="gray.600"
          >
            Você perderá acesso às informações, equipes e cargos relacionados a esta empresa.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            colorScheme="red"
            onClick={onSair}
            isLoading={loadingSair}
          >
            Sair
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
