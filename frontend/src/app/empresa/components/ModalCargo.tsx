import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  Box,
  Text,
  Select,
  Button
} from '@chakra-ui/react'
import { Membro, CARGOS_DISPONIVEIS } from '../types'

interface ModalCargoProps {
  isOpen: boolean
  onClose: () => void
  membroSelecionado: Membro | null
  cargoSelecionado: string
  setCargoSelecionado: (cargo: string) => void
  onAtualizarCargo: () => void
  loadingCargo: boolean
}

export default function ModalCargo({
  isOpen,
  onClose,
  membroSelecionado,
  cargoSelecionado,
  setCargoSelecionado,
  onAtualizarCargo,
  loadingCargo
}: ModalCargoProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {membroSelecionado?.cargo ? 'Alterar Cargo' : 'Atribuir Cargo'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontWeight="bold">Funcionário:</Text>
              <Text>{membroSelecionado?.nome}</Text>
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={2}>Cargo:</Text>
              <Select
                value={cargoSelecionado}
                onChange={(e) => setCargoSelecionado(e.target.value)}
                placeholder="Selecione um cargo"
              >
                {CARGOS_DISPONIVEIS.map(cargo => (
                  <option key={cargo} value={cargo}>{cargo}</option>
                ))}
              </Select>
            </Box>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="blue"
            onClick={onAtualizarCargo}
            isLoading={loadingCargo}
            isDisabled={!cargoSelecionado}
          >
            {membroSelecionado?.cargo ? 'Alterar' : 'Atribuir'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

