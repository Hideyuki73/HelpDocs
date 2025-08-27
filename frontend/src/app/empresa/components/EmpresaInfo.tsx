import { Box, Heading, Text, VStack } from '@chakra-ui/react'

interface EmpresaInfoProps {
  empresa: {
    nome: string
    telefone: string
    cnpj: string
    email: string
    endereco: string
  }
}

export default function EmpresaInfo({ empresa }: EmpresaInfoProps) {
  return (
    <Box p={4} borderWidth={1} borderRadius="lg" bg="gray.50">
      <VStack align="start" spacing={3}>
        <Heading size="md">Dados importantes</Heading>
        <Text><b>Telefone:</b> {empresa.telefone}</Text>
        <Text><b>CNPJ:</b> {empresa.cnpj}</Text>
        <Text><b>E-mail:</b> {empresa.email}</Text>
        <Text><b>Endereço:</b> {empresa.endereco}</Text>
      </VStack>
    </Box>
  )
}

