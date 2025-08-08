'use client'

import { Box, Heading, Text, Toast, useToast } from '@chakra-ui/react'
import FormRegistroEmpresa from '../../components/form/FormRegistroEmpresa'
import FormEmpresa from '../../components/form/FormRegistroEmpresa'
import { criarEmpresaClient } from '@/action/empresa'

export default function RegisterEmpresaPage() {
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

      <FormEmpresa
        onSubmit={async (values) => {
          const response = await criarEmpresaClient(values)

          if (response) {
            console.log(response)
          }
        }}
      />
    </Box>
  )
}
