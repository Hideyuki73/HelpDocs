import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Button
} from '@chakra-ui/react'

interface Membro {
  id: string
  nome?: string
  email?: string
  cargo?: string
}

interface ModalExpulsarProps {
  isOpen: boolean
  onClose: () => void
  membroParaExpulsar: Membro | null
  onExpulsarFuncionario: () => void
  loadingExpulsao: boolean
}

export default function ModalExpulsar({
  isOpen,
  onClose,
  membroParaExpulsar,
  onExpulsarFuncionario,
  loadingExpulsao
}: ModalExpulsarProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirmar Expulsão</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Tem certeza que deseja expulsar <strong>{membroParaExpulsar?.nome}</strong> da empresa?
          </Text>
          <Text mt={2} fontSize="sm" color="gray.600">
            Esta ação não pode ser desfeita. O funcionário perderá acesso à empresa e seus dados de cargo serão removidos.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="red"
            onClick={onExpulsarFuncionario}
            isLoading={loadingExpulsao}
          >
            Expulsar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

