'use client'

import { Box, Heading, Spinner, Text, VStack, Select } from '@chakra-ui/react'
import { useEquipes } from '../hooks/useEquipes'
import { ChatEquipe } from '../components/ChatEquipe'
import { useEffect, useState } from 'react'
import { Equipe } from '../types'

export default function EquipeChatPage() {
  const [equipeSelecionada, setEquipeSelecionada] = useState<Equipe | null>(null)
  const { equipes, carregarEquipes, loading: loadingEquipes } = useEquipes()

  useEffect(() => {
    carregarEquipes()
  }, [carregarEquipes])

  const handleEquipeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const equipeId = event.target.value
    const equipe = equipes.find((e) => e.id === equipeId) || null
    setEquipeSelecionada(equipe)
  }
  if (loadingEquipes && equipes.length === 0) {
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
  if (!equipeSelecionada || equipes.length === 0) {
    return (
      <Box
        maxW="600px"
        mx="auto"
        mt={20}
        p={8}
        borderWidth={1}
        borderRadius="2xl"
        boxShadow="lg"
        bg="white"
      >
        <VStack spacing={6}>
          <Heading
            as="h2"
            size="lg"
          >
            Selecione uma Equipe
          </Heading>
          {equipes.length === 0 ? (
            <Text>Nenhuma equipe encontrada. Por favor, crie uma equipe primeiro.</Text>
          ) : (
            <>
              <Text>Escolha uma equipe para iniciar o chat.</Text>
              <Select
                placeholder="Selecione uma equipe"
                onChange={handleEquipeChange}
              >
                {equipes.map((equipe) => (
                  <option
                    key={equipe.id}
                    value={equipe.id}
                  >
                    {equipe.nome}
                  </option>
                ))}
              </Select>
            </>
          )}
        </VStack>
      </Box>
    )
  }

  return (
    <Box
      maxW="1200px"
      mx="auto"
      mt={16}
      p={8}
      borderWidth={1}
      borderRadius="2xl"
      boxShadow="lg"
      bg="white"
    >
      <ChatEquipe
        equipeId={equipeSelecionada.id}
        equipeNome={equipeSelecionada.nome}
      />
    </Box>
  )
}
