'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
import FormRegistroEmpresa from '../../components/form/FormRegistroEmpresa'
import FormEmpresa from '../../components/form/FormRegistroEmpresa'


export default function RegisterEmpresaPage() {
  return (
    <Box maxW="600px" mx="auto" mt={20} p={8} borderWidth={1} borderRadius="lg" boxShadow="md">
      <Heading mb={4} textAlign="center">Cadastrar Empresa</Heading>
      <Text mb={6} textAlign="center" color="gray.600">
        Preencha os dados abaixo para registrar sua empresa.
      </Text>

      <FormEmpresa
        onSubmit={async (values, actions) => {
          try {
            // Você pode fazer algo extra aqui, como mostrar notificação, redirecionar etc.
            console.log('Empresa cadastrada:', values)
            actions.resetForm()
            // Exemplo: router.push('/empresa/login') se tiver rota de login para empresa
          } catch (error) {
            console.error(error)
            actions.setErrors({ email: 'Erro ao cadastrar empresa' })
          } finally {
            actions.setSubmitting(false)
          }
        }}
      />
    </Box>
  )
}
