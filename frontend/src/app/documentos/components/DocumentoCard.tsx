'use client'

import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  VStack,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
  Box,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { FaEdit, FaTrash, FaEye, FaEllipsisV, FaFile, FaUpload, FaUsers } from 'react-icons/fa'
import { redirect } from 'next/navigation'
import { Documento } from '@/action/documento'
import { CircularProgress } from './CircularProgress'
import { EquipeResponsavel } from './EquipeResponsavel'

interface DocumentoCardProps {
  documento: Documento
  onEdit: (id: string, dados: any, usuarioId: string) => void
  onDelete: (id: string) => void
  onAtribuir: (documento: Documento) => void
}

export function DocumentoCard({ documento, onEdit, onDelete, onAtribuir }: DocumentoCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'publicado':
        return 'green'
      case 'rascunho':
        return 'yellow'
      case 'arquivado':
        return 'gray'
      default:
        return 'blue'
    }
  }

  const getTipoIcon = (tipo: string) => {
    return tipo === 'upload' ? <FaUpload /> : <FaFile />
  }

  const renderEquipeInfo = () => {
    if (!documento.equipeId) {
      return (
        <Alert
          status="warning"
          size="sm"
          borderRadius="md"
        >
          <AlertIcon boxSize={3} />
          <Text fontSize="xs">Sem equipe atribuída</Text>
        </Alert>
      )
    }

    return (
      <>
        {documento.equipeId ? (
          <EquipeResponsavel
            equipeId={documento.equipeId}
            onEquipeChange={(equipe) => {
              // Callback opcional
            }}
          />
        ) : (
          <Alert
            status="warning"
            size="sm"
            borderRadius="md"
          >
            <AlertIcon boxSize={3} />
            <Text fontSize="xs">Sem equipe atribuída</Text>
          </Alert>
        )}
      </>
    )
  }

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      h="fit-content"
    >
      <CardHeader pb={2}>
        <HStack justify="space-between">
          <HStack>
            {getTipoIcon(documento.tipo)}
            <Badge colorScheme={getStatusColor(documento.status)}>{documento.status}</Badge>
          </HStack>
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant="ghost"
              size="sm"
            />
            <MenuList>
              <MenuItem
                icon={<FaEdit />}
                onClick={() => onEdit(documento.id, {}, 'user-id')}
              >
                Editar
              </MenuItem>
              <MenuItem
                icon={<FaUsers />}
                onClick={() => onAtribuir(documento)}
              >
                Atribuir à Equipe
              </MenuItem>
              <MenuItem
                icon={<FaTrash />}
                onClick={() => onDelete(documento.id)}
                color="red.500"
              >
                Excluir
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </CardHeader>

      <CardBody pt={0}>
        <VStack
          align="start"
          spacing={4}
        >
          <Box>
            <Heading
              size="md"
              mb={2}
              noOfLines={2}
            >
              {documento.titulo}
            </Heading>
            <Text
              color="gray.600"
              fontSize="sm"
              noOfLines={3}
            >
              {documento.descricao}
            </Text>
          </Box>

          {documento.nomeArquivo && (
            <Badge
              colorScheme="purple"
              variant="subtle"
            >
              {documento.nomeArquivo}
            </Badge>
          )}

          {/* Informações da Equipe */}
          {renderEquipeInfo()}

          {documento.checklist && documento.checklist.length > 0 && (
            <HStack
              justify="space-between"
              align="center"
              w="full"
            >
              <VStack
                align="start"
                spacing={1}
                flex={1}
              >
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  color="gray.600"
                >
                  Progresso da Checklist:
                </Text>
                <Badge
                  colorScheme="purple"
                  variant="outline"
                >
                  {documento.checklist.filter((item) => item.concluido).length}/{documento.checklist.length} objetivos
                </Badge>
              </VStack>
              <CircularProgress
                value={(documento.checklist.filter((item) => item.concluido).length / documento.checklist.length) * 100}
                size={50}
                label={`${documento.checklist.filter((item) => item.concluido).length} de ${
                  documento.checklist.length
                } objetivos concluídos`}
              />
            </HStack>
          )}

          <VStack
            align="start"
            spacing={1}
            fontSize="xs"
            color="gray.500"
            w="full"
          >
            <Text>Versão {documento.versao}</Text>
            <Text>Criado em {new Date(documento.dataCriacao).toLocaleDateString()}</Text>
            {documento.dataAtualizacao && (
              <Text>Atualizado em {new Date(documento.dataAtualizacao).toLocaleDateString()}</Text>
            )}
          </VStack>

          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            w="full"
            onClick={() => redirect(`/documentos/${documento.id}/editar`)}
            leftIcon={<FaEye />}
          >
            Ver Documento
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}
