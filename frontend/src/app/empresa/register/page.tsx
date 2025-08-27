'use client'

import { Box, Heading, Text, useToast } from '@chakra-ui/react'
import FormEmpresa from '../../components/form/FormRegistroEmpresa'
import { criarEmpresaClient } from '@/action/empresa'
import { useRouter } from 'next/navigation'

export default function RegisterEmpresaPage() {
  const toast = useToast()
  const router = useRouter()

  const handleSubmit = async (values: any) => {
    try {
      const response = await criarEmpresaClient(values)
      console.log('Empresa criada:', response)

      // redireciona para a página correta
      router.push('/empresa')
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Erro ao criar empresa',
        description: err.message || 'Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Box
      maxW="600px"
      mx="auto"
      mt={20}
      p={8}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
    >
      <Heading
        mb={4}
        textAlign="center"
      >
        Cadastrar Empresa
      </Heading>
      <Text
        mb={6}
        textAlign="center"
        color="gray.600"
      >
        Preencha os dados abaixo para registrar sua empresa.
      </Text>

      <FormEmpresa onSubmit={handleSubmit} />
    </Box>
  )
}
