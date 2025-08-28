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

interface ModalDeleteEmpresaProps {
  isOpen: boolean
  onClose: () => void
  empresa: { nome: string } | null
  onDeleteEmpresa: () => void
  loadingDeleteEmpresa: boolean
}

export default function ModalDeleteEmpresa({
  isOpen,
  onClose,
  empresa,
  onDeleteEmpresa,
  loadingDeleteEmpresa
}: ModalDeleteEmpresaProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirmar Deleção da Empresa</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Tem certeza que deseja deletar a empresa <strong>{empresa?.nome}</strong>?
          </Text>
          <Text mt={2} fontSize="sm" color="red.600" fontWeight="bold">
            ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
          </Text>
          <Text mt={2} fontSize="sm" color="gray.600">
            • Todos os funcionários serão removidos da empresa
          </Text>
          <Text fontSize="sm" color="gray.600">
            • Todos os dados da empresa serão perdidos permanentemente
          </Text>
          <Text fontSize="sm" color="gray.600">
            • Esta ação não pode ser desfeita
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="red"
            onClick={onDeleteEmpresa}
            isLoading={loadingDeleteEmpresa}
          >
            Deletar Empresa
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

