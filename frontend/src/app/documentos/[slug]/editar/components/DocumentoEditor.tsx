'use client'

import {
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Badge,
  Text,
  Button,
} from '@chakra-ui/react'
import { FaSave, FaArrowLeft, FaRobot } from 'react-icons/fa'
import { Documento, DocumentoFormData } from '../types/documento'
import { User } from 'firebase/auth'
import { ChatIA } from './ChatIA'

interface DocumentoEditorProps {
  documento: Documento
  formData: DocumentoFormData
  saving: boolean
  showChat: boolean
  user?: User | null
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
        templateColumns={showChat ? '1fr minmax(350px, 400px)' : '1fr'}
        gap={6}
        h="calc(100vh - 80px)"
      >
        {/* Editor */}
        <GridItem>
          <VStack
            spacing={4}
            align="stretch"
            h="full"
          >
            {/* Header fixo */}
            <HStack
              justify="space-between"
              position="sticky"
              top="0"
              bg="white"
              zIndex={1}
              p={2}
              borderBottom="1px solid"
              borderColor="gray.200"
            >
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

            {/* Form */}
            <VStack
              spacing={4}
              align="stretch"
              flex={1}
              overflow="auto"
              p={2}
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
                  bg="gray.50"
                  _focus={{ bg: 'white', borderColor: 'blue.300' }}
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
                  bg="gray.50"
                  _focus={{ bg: 'white', borderColor: 'blue.300' }}
                />
              </FormControl>
            </VStack>
          </VStack>
        </GridItem>

        {/* Chat IA */}
        {showChat && (
          <GridItem>
            <ChatIA
              contextoDocumento={`Título: ${formData.titulo}\nDescrição: ${formData.descricao}\nConteúdo: ${formData.conteudo}`}
              user={user ?? null}
            />
          </GridItem>
        )}
      </Grid>
    </Container>
  )
}
