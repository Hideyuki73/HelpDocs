import { Container, VStack, HStack, Button, Box, Heading, Text } from '@chakra-ui/react'
import { FaArrowLeft } from 'react-icons/fa'
import { Documento } from '../types/documento'

interface DocumentoUploadViewerProps {
  documento: Documento
  onVoltar: () => void
}

export function DocumentoUploadViewer({ documento, onVoltar }: DocumentoUploadViewerProps) {
  return (
    <Container
      maxW="4xl"
      py={8}
    >
      <VStack
        spacing={6}
        align="stretch"
      >
        <HStack justify="space-between">
          <Button
            leftIcon={<FaArrowLeft />}
            onClick={onVoltar}
          >
            Voltar
          </Button>
        </HStack>

        <Box
          textAlign="center"
          py={12}
        >
          <Heading
            size="lg"
            mb={4}
          >
            Documento de Upload
          </Heading>
          <Text
            color="gray.600"
            mb={6}
          >
            Este documento foi enviado como arquivo e não pode ser editado diretamente.
          </Text>
          <Text
            fontSize="lg"
            fontWeight="bold"
          >
            {documento.titulo}
          </Text>
          <Text color="gray.600">{documento.descricao}</Text>
        </Box>
      </VStack>
    </Container>
  )
}
