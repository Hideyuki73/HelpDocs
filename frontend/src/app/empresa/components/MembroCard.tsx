import { Box, Text, Badge, Button, VStack } from '@chakra-ui/react'
import { UsuarioLogado } from '@/action/auth'
import { Membro } from '../types'

interface MembroCardProps {
  membro: Membro
  usuarioLogado: UsuarioLogado | null
  isAdmin: boolean
  onAbrirModalCargo: (membro: Membro) => void
  onAbrirModalExpulsar: (membro: Membro) => void
}

export default function MembroCard({ 
  membro, 
  usuarioLogado, 
  isAdmin, 
  onAbrirModalCargo, 
  onAbrirModalExpulsar 
}: MembroCardProps) {
  return (
    <Box p={3} borderWidth={1} borderRadius="md" bg="white">
      <Box display="flex" justifyContent="space-between" alignItems="start">
        <Box flex={1}>
          <Text fontWeight="bold">{membro.nome}</Text>
          {membro.email && (
            <Text fontSize="sm" color="gray.600">
              {membro.email}
            </Text>
          )}
          {membro.cargo && (
            <Badge colorScheme="blue" mt={1} fontSize="xs">
              {membro.cargo}
            </Badge>
          )}
        </Box>
        {isAdmin && (
          <VStack spacing={2}>
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={() => onAbrirModalCargo(membro)}
            >
              {membro.cargo ? 'Alterar Cargo' : 'Atribuir Cargo'}
            </Button>
            {membro.id !== usuarioLogado?.id && (
              <Button
                size="sm"
                colorScheme="red"
                variant="outline"
                onClick={() => onAbrirModalExpulsar(membro)}
              >
                Expulsar
              </Button>
            )}
          </VStack>
        )}
      </Box>
    </Box>
  )
}

