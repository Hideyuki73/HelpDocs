'use client'

import { Box, VStack, Heading, Text, Button, useColorModeValue } from '@chakra-ui/react'
import { useAuth } from './hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function UserPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="100vh"
      >
        <Text>Carregando...</Text>
      </Box>
    )
  }

  if (!user) {
    router.push('/user/login')
    return null
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
      <VStack
        spacing={6}
        align="center"
      >
        <Heading size="lg">Perfil do Usuário</Heading>

        <VStack
          spacing={4}
          align="start"
          w="100%"
        >
          <Box>
            <Text fontWeight="bold">Nome:</Text>
            <Text>{user.nome}</Text>
          </Box>

          <Box>
            <Text fontWeight="bold">E-mail:</Text>
            <Text>{user.email}</Text>
          </Box>

          {user.cargo && (
            <Box>
              <Text fontWeight="bold">Cargo:</Text>
              <Text>{user.cargo}</Text>
            </Box>
          )}
        </VStack>

        <VStack
          spacing={4}
          w="100%"
        >
          <Button
            colorScheme="blue"
            size="lg"
            w="100%"
            onClick={() => router.push('/empresa-selection')}
          >
            Ir para Empresas
          </Button>
        </VStack>
      </VStack>
    </Box>
  )
}
