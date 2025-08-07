'use client'

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react'
import { useState } from 'react'

export default function RegisterPage() {
  const toast = useToast()
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = () => {
    // Aqui você pode integrar com API
    toast({
      title: 'Conta criada com sucesso!',
      description: `Bem-vindo, ${form.nome}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    })
  }

  return (
    <Box maxW="500px" mx="auto" mt={20} p={8} borderWidth={1} borderRadius="lg" boxShadow="md">
      <Heading mb={4} textAlign="center">Criar Conta</Heading>
      <Text mb={6} textAlign="center" color="gray.600">
        Preencha os dados abaixo para começar a usar o HelpDocs.
      </Text>

      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Nome</FormLabel>
          <Input name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome completo" />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="email@exemplo.com" />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Senha</FormLabel>
          <Input type="password" name="senha" value={form.senha} onChange={handleChange} placeholder="********" />
        </FormControl>

        <Button colorScheme="teal" width="100%" onClick={handleSubmit}>
          Criar Conta
        </Button>
      </VStack>
    </Box>
  )
}
