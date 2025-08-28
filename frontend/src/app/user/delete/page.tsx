'use client'

import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Button, 
  Alert, 
  AlertIcon, 
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react'
import { useAuth } from '../hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteAccountPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isDeleting, setIsDeleting] = useState(false)
  const bg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")

  if (!user) {
    router.push('/user/login')
    return null
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      // Aqui você implementaria a lógica para deletar a conta
      // Por exemplo, chamar uma API para deletar o usuário
      console.log('Deletando conta do usuário:', user.id)
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Fazer logout após deletar
      await logout()
      
      // Redirecionar para home
      router.push('/')
    } catch (error) {
      console.error('Erro ao deletar conta:', error)
    } finally {
      setIsDeleting(false)
      onClose()
    }
  }

  return (
    <Box
      maxW="600px"
      mx="auto"
      mt={20}
      p={8}
      borderWidth={1}
      borderRadius="xl"
      boxShadow="lg"
      bg={bg}
      borderColor={borderColor}
    >
      <VStack spacing={6} align="center">
        <Heading size="lg" color="red.500">Deletar Conta</Heading>
        
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Text>
            Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
          </Text>
        </Alert>

        <VStack spacing={4} align="start" w="100%">
          <Text fontWeight="bold">Dados que serão removidos:</Text>
          <VStack align="start" pl={4} spacing={2}>
            <Text>• Informações pessoais (nome, email)</Text>
            <Text>• Histórico de atividades</Text>
            <Text>• Associações com empresas</Text>
            <Text>• Documentos criados</Text>
          </VStack>
        </VStack>

        <VStack spacing={4} w="100%">
          <Button
            colorScheme="gray"
            size="lg"
            w="100%"
            onClick={() => router.push('/user')}
          >
            Cancelar
          </Button>
          
          <Button
            colorScheme="red"
            size="lg"
            w="100%"
            onClick={onOpen}
          >
            Deletar Minha Conta
          </Button>
        </VStack>
      </VStack>

      {/* Modal de confirmação */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar Deleção</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Tem certeza que deseja deletar sua conta permanentemente?
            </Text>
            <Text mt={2} fontSize="sm" color="red.600" fontWeight="bold">
              Esta ação não pode ser desfeita!
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteAccount}
              isLoading={isDeleting}
            >
              Deletar Conta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

