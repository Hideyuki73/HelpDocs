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
  Avatar,
  AvatarGroup,
  Tooltip,
  Spinner,
  Alert,
  AlertIcon,
  Progress,
} from '@chakra-ui/react'
import { FaEdit, FaTrash, FaEye, FaEllipsisV, FaFile, FaUpload, FaUsers, FaUser, FaCrown } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { redirect } from 'next/navigation'
import { Documento } from '@/action/documento'
import { obterEquipePorId, Equipe } from '@/action/equipe'
import { CircularProgress } from './CircularProgress'

interface DocumentoCardProps {
  documento: Documento
  onEdit: (id: string, dados: any, usuarioId: string) => void
  onDelete: (id: string) => void
  onAtribuir: (documento: Documento) => void
}

export function DocumentoCard({ documento, onEdit, onDelete, onAtribuir }: DocumentoCardProps) {
  const [equipe, setEquipe] = useState<Equipe | null>(null)
  const [loadingEquipe, setLoadingEquipe] = useState(false)
  const [equipeError, setEquipeError] = useState(false)

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    if (documento.equipeId) {
      carregarEquipe()
    }
  }, [documento.equipeId])

  const carregarEquipe = async () => {
    setLoadingEquipe(true)
    setEquipeError(false)
    try {
      const equipeData = await obterEquipePorId(documento.equipeId)
      setEquipe(equipeData)
    } catch (error) {
      console.error('Erro ao carregar equipe:', error)
      setEquipeError(true)
    } finally {
      setLoadingEquipe(false)
    }
  }

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

    if (loadingEquipe) {
      return (
        <HStack spacing={2}>
          <Spinner size="xs" />
          <Text
            fontSize="xs"
            color="gray.500"
          >
            Carregando equipe...
          </Text>
        </HStack>
      )
    }

    if (equipeError || !equipe) {
      return (
        <Alert
          status="error"
          size="sm"
          borderRadius="md"
        >
          <AlertIcon boxSize={3} />
          <Text fontSize="xs">Erro ao carregar equipe</Text>
        </Alert>
      )
    }

    return (
      <VStack
        align="start"
        spacing={2}
        w="full"
      >
        <HStack
          spacing={2}
          w="full"
        >
          <FaUsers
            size="12px"
            color="blue"
          />
          <Text
            fontSize="xs"
            fontWeight="semibold"
            color="blue.600"
          >
            Equipe Responsável:
          </Text>
        </HStack>

        <Box
          bg="blue.50"
          p={2}
          borderRadius="md"
          w="full"
          border="1px solid"
          borderColor="blue.200"
        >
          <VStack
            align="start"
            spacing={2}
          >
            <HStack
              justify="space-between"
              w="full"
            >
              <Text
                fontSize="sm"
                fontWeight="bold"
                color="blue.700"
              >
                {equipe.nome}
              </Text>
              <Badge
                colorScheme="blue"
                size="sm"
              >
                {equipe.membros.length} membros
              </Badge>
            </HStack>

            {/* Avatars dos membros */}
            <HStack spacing={1}>
              <AvatarGroup
                size="xs"
                max={3}
              >
                {equipe.membros.slice(0, 3).map((membroId, index) => (
                  <Tooltip
                    key={membroId}
                    label={`Membro ${index + 1}`}
                  >
                    <Avatar
                      size="xs"
                      name={`Membro ${index + 1}`}
                      bg="blue.500"
                      icon={<FaUser />}
                    />
                  </Tooltip>
                ))}
              </AvatarGroup>

              {equipe.membros.length > 3 && (
                <Text
                  fontSize="xs"
                  color="gray.600"
                >
                  +{equipe.membros.length - 3} mais
                </Text>
              )}
            </HStack>

            {/* Criador da equipe */}
            <HStack spacing={1}>
              <FaCrown
                size="10px"
                color="gold"
              />
              <Text
                fontSize="xs"
                color="gray.600"
              >
                Criador: {equipe.criadorId}
              </Text>
            </HStack>
          </VStack>
        </Box>
      </VStack>
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
