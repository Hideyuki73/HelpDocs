'use client'

import { Box, Heading, Spinner, Text } from '@chakra-ui/react'
import { useParams } from 'next/navigation'
import { useEquipes } from '../../hooks/useEquipes'
import { ChatEquipe } from '../../components/ChatEquipe'

export default function EquipeChatPage() {
  const params = useParams()
  const equipeId = params.id as string

  const { equipes, loading } = useEquipes()
  const equipe = equipes.find((e) => e.id === equipeId)

  if (loading) {
    return (
      <Spinner
        size="xl"
        thickness="4px"
        color="teal.500"
        display="block"
        mx="auto"
        mt={20}
      />
    )
  }

  if (!equipe) {
    return (
      <Text
        textAlign="center"
        mt={10}
      >
        Equipe não encontrada.
      </Text>
    )
  }

  return (
    <Box
      maxW="900px"
      mx="auto"
      mt={16}
      p={8}
      borderWidth={1}
      borderRadius="2xl"
      boxShadow="lg"
      bg="white"
    >
      <Heading
        size="lg"
        mb={6}
        textAlign="center"
      >
        Chat da Equipe: {equipe.nome}
      </Heading>
      <ChatEquipe
        equipeId={equipeId}
        equipeNome={equipe.nome}
      />
    </Box>
  )
}
