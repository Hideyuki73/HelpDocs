'use client'

import { useEffect, useState } from 'react'
import { Box, Heading, Text, VStack, Spinner, Button, SimpleGrid, GridItem, StackDivider } from '@chakra-ui/react'
import { getMinhaEmpresa, gerarConvite } from '@/action/empresa'

interface Membro {
  uid: string
  nome?: string
  email?: string
}

export default function EmpresaPage() {
  const [empresa, setEmpresa] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [convite, setConvite] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const data = await getMinhaEmpresa()
        const membrosFormatados: Membro[] = data.membros.map((uid: string) => ({ uid }))
        setEmpresa({ ...data, membros: membrosFormatados })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchEmpresa()
  }, [])

  const handleGerarConvite = async () => {
    if (!empresa) return
    const { codigo } = await gerarConvite(empresa.id)
    setConvite(codigo)
  }

  if (loading) return <Spinner size="xl" thickness="4px" color="teal.500" display="block" mx="auto" mt={20} />

  if (!empresa) return <Text textAlign="center" mt={10}>Nenhuma empresa associada.</Text>

  return (
    <Box maxW="900px" mx="auto" mt={16} p={8} borderWidth={1} borderRadius="2xl" boxShadow="lg" bg="white">
      <Heading size="lg" mb={6} textAlign="center">{empresa.nome}</Heading>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Box de dados da empresa */}
        <Box p={4} borderWidth={1} borderRadius="lg" bg="gray.50">
          <VStack align="start" spacing={3}>
            <Heading size="md">Dados importantes</Heading>
            <Text><b>Telefone:</b> {empresa.telefone}</Text>
            <Text><b>CNPJ:</b> {empresa.cnpj}</Text>
            <Text><b>E-mail:</b> {empresa.email}</Text>
            <Text><b>Endereço:</b> {empresa.endereco}</Text>
          </VStack>
        </Box>

        {/* Box de membros */}
        <Box p={4} borderWidth={1} borderRadius="lg" bg="gray.50">
          <VStack align="stretch" spacing={3}>
            <Heading size="md">Membros</Heading>
            {empresa.membros?.length ? (
              empresa.membros.map((m: Membro, idx: number) => (
                <Box key={idx} p={2} borderWidth={1} borderRadius="md" bg="white">
                  <Text fontWeight="bold">{m.nome || m.uid}</Text>
                  {m.email && <Text fontSize="sm" color="gray.600">{m.email}</Text>}
                </Box>
              ))
            ) : (
              <Text>Nenhum membro ainda</Text>
            )}
            <Button colorScheme="teal" onClick={handleGerarConvite}>
              Gerar código de convite
            </Button>
            {convite && (
              <Box mt={2} p={2} bg="gray.100" borderRadius="md" textAlign="center">
                <Text><b>Código de convite:</b> {convite}</Text>
              </Box>
            )}
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  )
}
