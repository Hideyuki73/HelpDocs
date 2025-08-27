import { Box, Heading, Text, VStack, Spinner, Button } from '@chakra-ui/react'
import { UsuarioLogado } from '@/action/auth'
import MembroCard from './MembroCard'
import ConviteBox from './ConviteBox'

interface Membro {
  id: string
  nome?: string
  email?: string
  cargo?: string
}

interface MembrosSectionProps {
  membros: Membro[]
  loadingMembros: boolean
  usuarioLogado: UsuarioLogado | null
  isAdmin: boolean
  convite: string | null
  onAbrirModalCargo: (membro: Membro) => void
  onAbrirModalExpulsar: (membro: Membro) => void
  onGerarConvite: () => void
}

export default function MembrosSection({
  membros,
  loadingMembros,
  usuarioLogado,
  isAdmin,
  convite,
  onAbrirModalCargo,
  onAbrirModalExpulsar,
  onGerarConvite
}: MembrosSectionProps) {
  return (
    <Box p={4} borderWidth={1} borderRadius="lg" bg="gray.50">
      <VStack align="stretch" spacing={3}>
        <Heading size="md">Membros ({membros.length})</Heading>
        
        {loadingMembros ? (
          <Box textAlign="center" py={4}>
            <Spinner size="md" />
            <Text mt={2} fontSize="sm">Carregando membros...</Text>
          </Box>
        ) : membros.length > 0 ? (
          membros.map((membro: Membro) => (
            <MembroCard
              key={membro.id}
              membro={membro}
              usuarioLogado={usuarioLogado}
              isAdmin={isAdmin}
              onAbrirModalCargo={onAbrirModalCargo}
              onAbrirModalExpulsar={onAbrirModalExpulsar}
            />
          ))
        ) : (
          <Text>Nenhum membro ainda</Text>
        )}
        
        <Button colorScheme="teal" onClick={onGerarConvite} mt={4}>
          Gerar código de convite
        </Button>
        
        {convite && <ConviteBox convite={convite} />}
      </VStack>
    </Box>
  )
}

