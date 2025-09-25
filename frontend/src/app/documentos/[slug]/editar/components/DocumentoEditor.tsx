import {
  Container,
  Grid,
  GridItem,
  Box,
  Heading,
  Button,
  VStack,
  HStack,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Badge,
  Text,
} from '@chakra-ui/react'
import { FaSave, FaArrowLeft, FaRobot } from 'react-icons/fa'
import { Documento, DocumentoFormData } from '../types/documento'
import { User } from 'firebase/auth'
import { ChatIA } from '@/app/documentos/components/ChatIA'

interface DocumentoEditorProps {
  documento: Documento
  formData: DocumentoFormData
  saving: boolean
  showChat: boolean
  user: User | null
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onSalvar: () => void
  onPublicar: () => void
  onToggleChat: () => void
  onVoltar: () => void
}

export function DocumentoEditor({
  documento,
  formData,
  saving,
  showChat,
  user,
  onFormChange,
  onSalvar,
  onPublicar,
  onToggleChat,
  onVoltar,
}: DocumentoEditorProps) {
  return (
    <Container
      maxW="full"
      py={4}
    >
      <Grid
        templateColumns="1fr 400px"
        gap={6}
        h="calc(100vh - 120px)"
      >
        {/* Editor Principal */}
        <GridItem>
          <VStack
            spacing={4}
            align="stretch"
            h="full"
          >
            {/* Header */}
            <HStack justify="space-between">
              <HStack>
                <Button
                  leftIcon={<FaArrowLeft />}
                  onClick={onVoltar}
                  variant="ghost"
                >
                  Voltar
                </Button>
                <Badge colorScheme={documento.status === 'publicado' ? 'green' : 'yellow'}>{documento.status}</Badge>
                <Text
                  fontSize="sm"
                  color="gray.600"
                >
                  Versão {documento.versao}
                </Text>
              </HStack>

              <HStack>
                <Button
                  leftIcon={<FaRobot />}
                  onClick={onToggleChat}
                  colorScheme={showChat ? 'blue' : 'gray'}
                  variant={showChat ? 'solid' : 'outline'}
                >
                  {showChat ? 'Ocultar' : 'Mostrar'} IA
                </Button>
                <Button
                  leftIcon={<FaSave />}
                  onClick={onSalvar}
                  isLoading={saving}
                  loadingText="Salvando..."
                  colorScheme="blue"
                  variant="outline"
                >
                  Salvar
                </Button>
                {documento.status !== 'publicado' && (
                  <Button
                    onClick={onPublicar}
                    isLoading={saving}
                    loadingText="Publicando..."
                    colorScheme="green"
                  >
                    Publicar
                  </Button>
                )}
              </HStack>
            </HStack>

            {/* Formulário de Edição */}
            <VStack
              spacing={4}
              align="stretch"
              flex={1}
            >
              <FormControl>
                <FormLabel>Título</FormLabel>
                <Input
                  name="titulo"
                  value={formData.titulo}
                  onChange={onFormChange}
                  size="lg"
                  fontWeight="bold"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Descrição</FormLabel>
                <Textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={onFormChange}
                  rows={2}
                />
              </FormControl>

              <FormControl flex={1}>
                <FormLabel>Conteúdo</FormLabel>
                <Textarea
                  name="conteudo"
                  value={formData.conteudo}
                  onChange={onFormChange}
                  placeholder="Digite o conteúdo do documento aqui..."
                  resize="none"
                  h="full"
                  fontFamily="mono"
                />
              </FormControl>
            </VStack>
          </VStack>
        </GridItem>

        {/* Chat IA */}
        {showChat && (
          <GridItem>
            <Box
              h="full"
              border="1px"
              borderColor="gray.200"
              borderRadius="md"
            >
              <ChatIA
                contextoDocumento={`Título: ${formData.titulo}\nDescrição: ${formData.descricao}\nConteúdo: ${formData.conteudo}`}
                user={user ?? null}
              />
            </Box>
          </GridItem>
        )}
      </Grid>
    </Container>
  )
}
