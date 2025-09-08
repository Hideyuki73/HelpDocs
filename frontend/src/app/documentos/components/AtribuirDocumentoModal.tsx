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
  Select,
  useToast,
  Text,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { atribuirDocumentoAEquipe } from '@/action/documento'
import { listarEquipesPorUsuario } from '@/action/equipe'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase'

interface Documento {
  id: string
  titulo: string
  equipeId: string
}

interface Equipe {
  id: string
  nome: string
}

interface AtribuirDocumentoModalProps {
  isOpen: boolean
  onClose: () => void
  documento: Documento | null
  onSuccess: () => void
}

export function AtribuirDocumentoModal({ isOpen, onClose, documento, onSuccess }: AtribuirDocumentoModalProps) {
  const [user] = useAuthState(auth)
  const toast = useToast()
  const [equipeSelecionada, setEquipeSelecionada] = useState<string>('')
  const [equipesDisponiveis, setEquipesDisponiveis] = useState<Equipe[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      const carregarEquipes = async () => {
        try {
          const equipes = await listarEquipesPorUsuario(user.uid)
          setEquipesDisponiveis(equipes)
          if (documento?.equipeId) {
            setEquipeSelecionada(documento.equipeId)
          } else if (equipes.length > 0) {
            setEquipeSelecionada(equipes[0].id)
          }
        } catch (error) {
          console.error('Erro ao carregar equipes:', error)
          toast({
            title: 'Erro ao carregar equipes.',
            description: 'Não foi possível carregar a lista de equipes.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      }
      carregarEquipes()
    }
  }, [isOpen, user, documento, toast])

  const handleSubmit = async () => {
    if (!documento || !equipeSelecionada || !user) return

    setIsLoading(true)
    try {
      await atribuirDocumentoAEquipe(documento.id, equipeSelecionada, user.uid)
      toast({
        title: 'Documento atribuído.',
        description: `Documento "${documento.titulo}" atribuído com sucesso à equipe.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Erro ao atribuir documento:', error)
      toast({
        title: 'Erro ao atribuir documento.',
        description: 'Não foi possível atribuir o documento à equipe selecionada.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Atribuir Documento à Equipe</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {documento ? (
            <>
              <Text mb={4}>Atribuindo "{documento.titulo}" a uma equipe.</Text>
              <FormControl
                id="equipe"
                mb={4}
              >
                <FormLabel>Equipe</FormLabel>
                <Select
                  placeholder="Selecione uma equipe"
                  value={equipeSelecionada}
                  onChange={(e) => setEquipeSelecionada(e.target.value)}
                >
                  {equipesDisponiveis.map((equipe) => (
                    <option
                      key={equipe.id}
                      value={equipe.id}
                    >
                      {equipe.nome}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </>
          ) : (
            <Text>Nenhum documento selecionado.</Text>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            colorScheme="blue"
            ml={3}
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Atribuir
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
