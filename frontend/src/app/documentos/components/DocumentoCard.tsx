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
} from '@chakra-ui/react'
import { FaEdit, FaTrash, FaEye, FaEllipsisV, FaFile, FaUpload } from 'react-icons/fa'
import { Documento } from '@/action/documento'

interface DocumentoCardProps {
  documento: Documento
  onEdit: (id: string, dados: any, usuarioId: string) => void
  onDelete: (id: string, usuarioId: string) => void
  onAtribuir: (documento: Documento) => void
  onViewDetails: (documento: Documento) => void
}

export function DocumentoCard({ documento, onEdit, onDelete, onAtribuir, onViewDetails }: DocumentoCardProps) {
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

  return (
    <Card
      bg={cardBg}
      borderColor={borderColor}
      borderWidth="1px"
      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
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
                icon={<FaEye />}
                onClick={() => onViewDetails(documento)}
              >
                Ver Detalhes
              </MenuItem>
              <MenuItem
                icon={<FaEdit />}
                onClick={() => onEdit(documento.id, {}, 'user-id')}
              >
                Editar
              </MenuItem>
              <MenuItem onClick={() => onAtribuir(documento)}>Atribuir à Equipe</MenuItem>
              <MenuItem
                icon={<FaTrash />}
                onClick={() => onDelete(documento.id, 'user-id')}
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
          spacing={3}
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
            onClick={() => onViewDetails(documento)}
          >
            Ver Documento
          </Button>
        </VStack>
      </CardBody>
    </Card>
  )
}
