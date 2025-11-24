import { Box, Text } from '@chakra-ui/react'

interface ConviteBoxProps {
  convite: string
}

export default function ConviteBox({ convite }: ConviteBoxProps) {
  return (
    <Box
      mt={2}
      p={3}
      bg="green.100"
      borderRadius="md"
      textAlign="center"
      borderWidth={1}
      borderColor="green.300"
    >
      <Text
        fontSize="sm"
        color="green.700"
        mb={1}
      >
        Código de convite gerado:
      </Text>
      <Text
        fontWeight="bold"
        fontSize="lg"
        color="green.800"
      >
        {convite}
      </Text>
      <Text
        fontSize="xs"
        color="green.600"
        mt={1}
      >
        Compartilhe este código com novos membros
      </Text>
      <Text
        fontSize="xs"
        color="red.600"
      >
        O código expira em 5 minutos
      </Text>
    </Box>
  )
}
