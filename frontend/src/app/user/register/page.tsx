'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
import FormRegistro from '../../components/form/FormRegistro'

export default function RegisterPage() {
  return (
    <Box maxW="600px" mx="auto" mt={20} p={8} borderWidth={1} borderRadius="lg" boxShadow="md">
      <Heading mb={4} textAlign="center">Criar Conta</Heading>
      <Text mb={6} textAlign="center" color="gray.600">
        Preencha os dados abaixo para começar a usar o HelpDocs.
      </Text>

      <FormRegistro trocarTela={() => {
        // aqui você pode redirecionar para login se quiser, ex:
        // router.push('/user/login')
        console.log('trocar tela')
      }} />
    </Box>
  )
}
