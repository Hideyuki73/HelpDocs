'use client'

import {
  Box,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  AvatarGroup,
  Tooltip,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Flex,
  Spacer,
  Icon,
  Divider,
} from '@chakra-ui/react'
import {
  FaUsers,
  FaFileAlt,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaEye,
  FaClock,
  FaCheckCircle,
  FaCalendarAlt,
} from 'react-icons/fa'
import { Equipe } from '@/app/equipes/types'

interface EnhancedEquipeCardProps {
  equipe: Equipe & {
    membros?: Array<{
      id: string
      nome: string
      avatar?: string
      cargo?: string
    }>
    documentos?: {
      total: number
      aprovados: number
      pendentes: number
    }
    atividade?: {
      ultimaAtividade: Date
      documentosRecentes: number
    }
  }
  onEdit?: (equipe: Equipe) => void
  onDelete?: (id: string) => void
  onViewDetails?: (equipe: Equipe) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function EnhancedEquipeCard({
  equipe,
  onEdit,
  onDelete,
  onViewDetails,
  canEdit = false,
  canDelete = false,
}: EnhancedEquipeCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Hoje'
    if (diffInDays === 1) return 'Ontem'
    if (diffInDays < 7) return `${diffInDays} dias atrás`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} semanas atrás`
    return `${Math.floor(diffInDays / 30)} meses atrás`
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'ativa':
        return 'green'
      case 'inativa':
        return 'red'
      case 'pausada':
        return 'orange'
      default:
        return 'gray'
    }
  }

  const documentosProgress = equipe.documentos?.total
    ? (equipe.documentos.aprovados / equipe.documentos.total) * 100
    : 0

  return (
    <Card
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      _hover={{
        borderColor: 'blue.300',
        boxShadow: 'lg',
        transform: 'translateY(-2px)',
      }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => onViewDetails?.(equipe)}
    >
      <CardHeader pb={2}>
        <Flex align="start">
          <VStack
            align="start"
            spacing={1}
            flex={1}
          >
            <HStack spacing={2}>
              <Text
                fontWeight="bold"
                fontSize="lg"
                noOfLines={1}
              >
                {equipe.nome}
              </Text>
            </HStack>
          </VStack>

          {(canEdit || canDelete) && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FaEllipsisV />}
                variant="ghost"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              />
              <MenuList>
                {canEdit && (
                  <MenuItem
                    icon={<FaEdit />}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit?.(equipe)
                    }}
                  >
                    Editar
                  </MenuItem>
                )}
                <MenuItem
                  icon={<FaEye />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewDetails?.(equipe)
                  }}
                >
                  Ver detalhes
                </MenuItem>
                {canDelete && (
                  <MenuItem
                    icon={<FaTrash />}
                    color="red.500"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete?.(equipe.id)
                    }}
                  >
                    Excluir
                  </MenuItem>
                )}
              </MenuList>
            </Menu>
          )}
        </Flex>
      </CardHeader>

      <CardBody pt={0}>
        <VStack
          spacing={4}
          align="stretch"
        >
          {/* Estatísticas */}
          <HStack
            spacing={4}
            justify="space-between"
          >
            <Stat size="sm">
              <StatLabel>
                <HStack spacing={1}>
                  <Icon
                    as={FaUsers}
                    boxSize={3}
                    color="blue.500"
                  />
                  <Text fontSize="xs">Membros</Text>
                </HStack>
              </StatLabel>
              <StatNumber fontSize="lg">{equipe.membros?.length || 0}</StatNumber>
            </Stat>

            <Stat size="sm">
              <StatLabel>
                <HStack spacing={1}>
                  <Icon
                    as={FaFileAlt}
                    boxSize={3}
                    color="green.500"
                  />
                  <Text fontSize="xs">Documentos</Text>
                </HStack>
              </StatLabel>
              <StatNumber fontSize="lg">{equipe.documentos?.total || 0}</StatNumber>
              <StatHelpText fontSize="xs">{equipe.documentos?.aprovados || 0} aprovados</StatHelpText>
            </Stat>
          </HStack>

          {/* Progress de Documentos Aprovados */}
          {equipe.documentos && equipe.documentos.total > 0 && (
            <Box>
              <HStack
                justify="space-between"
                mb={1}
              >
                <Text
                  fontSize="xs"
                  color="gray.600"
                >
                  Progresso de Aprovação
                </Text>
                <Text
                  fontSize="xs"
                  color="gray.600"
                >
                  {Math.round(documentosProgress)}%
                </Text>
              </HStack>
              <Progress
                value={documentosProgress}
                size="sm"
                colorScheme="green"
                borderRadius="full"
              />
            </Box>
          )}

          {/* Membros
          {equipe.membros && equipe.membros.length > 0 && (
            <Box>
              <Text
                fontSize="xs"
                color="gray.600"
                mb={2}
              >
                Membros da equipe:
              </Text>
              <AvatarGroup
                size="sm"
                max={4}
              >
                {equipe.membros.map((membro) => (
                  <Tooltip
                    key={membro.id}
                    label={`${membro.nome} - ${membro.cargo || 'Membro'}`}
                  >
                    <Avatar
                      name={membro.nome}
                      src={membro.avatar}
                      size="sm"
                    />
                  </Tooltip>
                ))}
              </AvatarGroup>
            </Box>
          )} */}

          {/* Última Atividade */}
          {equipe.atividade?.ultimaAtividade && (
            <HStack
              spacing={2}
              fontSize="xs"
              color="gray.500"
            >
              <Icon
                as={FaClock}
                boxSize={3}
              />
              <Text>Última atividade: {formatTimeAgo(equipe.atividade.ultimaAtividade)}</Text>
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
