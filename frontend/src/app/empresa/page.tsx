'use client'

import { useEffect, useState } from 'react'
import { Box, Heading, Text, VStack, Spinner, Button } from '@chakra-ui/react'
import { getMinhaEmpresa, gerarConvite } from '@/action/empresa'

export default function EmpresaPage() {
  const [empresa, setEmpresa] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [convite, setConvite] = useState<string | null>(null)

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        const data = await getMinhaEmpresa()
        setEmpresa(data)
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

  if (loading) return <Spinner />

  if (!empresa) return <Text>Nenhuma empresa associada.</Text>

  return (
    <Box
      p={8}
      maxW="600px"
      mx="auto"
    >
      <Heading mb={4}>{empresa.nome}</Heading>
      <Text>
        <b>CNPJ:</b> {empresa.cnpj}
      </Text>
      <Text>
        <b>Email:</b> {empresa.email}
      </Text>
      <Text>
        <b>Telefone:</b> {empresa.telefone}
      </Text>
      <Text>
        <b>Endereço:</b> {empresa.endereco}
      </Text>

      <VStack
        align="start"
        mt={6}
      >
        <Heading size="sm">Membros</Heading>
        {empresa.membros?.length ? (
          empresa.membros.map((m: string) => <Text key={m}>{m}</Text>)
        ) : (
          <Text>Nenhum membro ainda</Text>
        )}
      </VStack>

      <Button
        mt={6}
        colorScheme="teal"
        onClick={handleGerarConvite}
      >
        Gerar código de convite
      </Button>
      {convite && (
        <Text mt={2}>
          Convite: <b>{convite}</b>
        </Text>
      )}
    </Box>
  )
}
