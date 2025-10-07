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
  Tooltip,
  Progress,
  useColorModeValue,
  Flex,
  Spacer,
  Icon,
  Divider,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Image,
} from '@chakra-ui/react'
import {
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFile,
  FaEllipsisV,
  FaEdit,
  FaTrash,
  FaEye,
  FaDownload,
  FaShare,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaUser,
  FaUsers,
  FaHeart,
  FaComment,
} from 'react-icons/fa'
import { Documento } from '@/action/documento'

interface EnhancedDocumentoCardProps {
  documento: Documento & {
    autor?: {
      id: string
      nome: string
      avatar?: string
    }
    equipe?: {
      id: string
      nome: string
    }
    stats?: {
      visualizacoes: number
      downloads: number
      comentarios: number
      likes: number
    }
    tags?: string[]
    thumbnail?: string
  }
  onEdit?: (documento: Documento) => void
  onDelete?: (id: string) => void
  onView?: (documento: Documento) => void
  onDownload?: (documento: Documento) => void
  onShare?: (documento: Documento) => void
  onAtribuir?: (documento: Documento) => void
  canEdit?: boolean
  canDelete?: boolean
}

export function EnhancedDocumentoCard({
  documento,
  onEdit,
  onDelete,
  onView,
  onDownload,
  onShare,
  onAtribuir,
  canEdit = false,
  canDelete = false,
}: EnhancedDocumentoCardProps) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'aprovado':
        return 'green'
      case 'pendente':
        return 'orange'
      case 'rejeitado':
        return 'red'
      case 'rascunho':
        return 'gray'
      default:
        return 'blue'
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo?.toLowerCase()) {
      case 'criado':
        return 'blue'
      case 'upload':
        return 'purple'
      default:
        return 'gray'
    }
  }

  const getFileIcon = (nomeArquivo?: string, tipo?: string) => {
    if (tipo === 'criado') return FaFileAlt
    
    if (!nomeArquivo) return FaFile
    
    const extension = nomeArquivo.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf':
        return FaFilePdf
      case 'doc':
      case 'docx':
        return FaFileWord
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return FaFileImage
      default:
        return FaFile
    }
  }

  const getFileIconColor = (nomeArquivo?: string, tipo?: string) => {
    if (tipo === 'criado') return 'blue.500'
    
    if (!nomeArquivo) return 'gray.500'
    
    const extension = nomeArquivo.split('.').pop()?.toLowerCase()
    
    switch (extension) {
      case 'pdf':
        return 'red.500'
      case 'doc':
      case 'docx':
        return 'blue.600'
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'green.500'
      default:
        return 'gray.500'
    }
  }

  return (
    <Card
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
      _hover={{
        borderColor: 'green.300',
        boxShadow: 'lg',
        transform: 'translateY(-2px)',
      }}
      transition="all 0.2s"
      cursor="pointer"
      onClick={() => onView?.(documento)}
    >
      <CardHeader pb={2}>
        <Flex align="start">
          <HStack spacing={3} flex={1}>
            <Icon
              as={getFileIcon(documento.nomeArquivo, documento.tipo)}
              color={getFileIconColor(documento.nomeArquivo, documento.tipo)}
              boxSize={6}
            />
            <VStack align="start" spacing={1} flex={1}>
              <HStack spacing={2} w="full">
                <Text fontWeight="bold" fontSize="md" noOfLines={1} flex={1}>
                  {documento.titulo}
                </Text>
                <Badge colorScheme={getStatusColor(documento.status || 'pendente')} size="sm">
                  {documento.status || 'Pendente'}
                </Badge>
              </HStack>
              <HStack spacing={2} fontSize="xs" color="gray.600">
                <Badge colorScheme={getTipoColor(documento.tipo)} size="sm" variant="outline">
                  {documento.tipo === 'criado' ? 'Criado' : 'Upload'}
                </Badge>
                <Text>•</Text>
                <Text>{formatDate(documento.dataCriacao)}</Text>
              </HStack>
            </VStack>
          </HStack>
          
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<FaEllipsisV />}
              variant="ghost"
              size="sm"
              onClick={(e) => e.stopPropagation()}
            />
            <MenuList>
              <MenuItem
                icon={<FaEye />}
                onClick={(e) => {
                  e.stopPropagation()
                  onView?.(documento)
                }}
              >
                Visualizar
              </MenuItem>
              {documento.tipo === 'upload' && (
                <MenuItem
                  icon={<FaDownload />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDownload?.(documento)
                  }}
                >
                  Download
                </MenuItem>
              )}
              <MenuItem
                icon={<FaShare />}
                onClick={(e) => {
                  e.stopPropagation()
                  onShare?.(documento)
                }}
              >
                Compartilhar
              </MenuItem>
              {canEdit && (
                <MenuItem
                  icon={<FaEdit />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.(documento)
                  }}
                >
                  Editar
                </MenuItem>
              )}
              {onAtribuir && (
                <MenuItem
                  icon={<FaUsers />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onAtribuir?.(documento)
                  }}
                >
                  Atribuir à equipe
                </MenuItem>
              )}
              {canDelete && (
                <MenuItem
                  icon={<FaTrash />}
                  color="red.500"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.(documento.id)
                  }}
                >
                  Excluir
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </Flex>
      </CardHeader>

      <CardBody pt={0}>
        <VStack spacing={4} align="stretch">
          {/* Thumbnail ou Preview */}
          {documento.thumbnail && (
            <Box>
              <Image
                src={documento.thumbnail}
                alt={documento.titulo}
                borderRadius="md"
                maxH="120px"
                w="full"
                objectFit="cover"
                fallback={
                  <Box
                    h="120px"
                    bg="gray.100"
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon
                      as={getFileIcon(documento.nomeArquivo, documento.tipo)}
                      color="gray.400"
                      boxSize={8}
                    />
                  </Box>
                }
              />
            </Box>
          )}

          {/* Descrição */}
          {documento.descricao && (
            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              {documento.descricao}
            </Text>
          )}

          <Divider />

          {/* Informações do Arquivo */}
          <VStack spacing={2} align="stretch">
            {documento.autor && (
              <HStack spacing={2} fontSize="sm">
                <Icon as={FaUser} color="gray.500" boxSize={3} />
                <Avatar size="xs" name={documento.autor.nome} src={documento.autor.avatar} />
                <Text color="gray.600" noOfLines={1}>
                  {documento.autor.nome}
                </Text>
              </HStack>
            )}

            {documento.equipe && (
              <HStack spacing={2} fontSize="sm">
                <Icon as={FaUsers} color="gray.500" boxSize={3} />
                <Text color="gray.600" noOfLines={1}>
                  {documento.equipe.nome}
                </Text>
              </HStack>
            )}

            {documento.tamanhoArquivo && (
              <HStack spacing={2} fontSize="sm">
                <Icon as={FaFileAlt} color="gray.500" boxSize={3} />
                <Text color="gray.600">
                  {formatFileSize(documento.tamanhoArquivo)}
                </Text>
              </HStack>
            )}
          </VStack>

          {/* Tags */}
          {documento.tags && documento.tags.length > 0 && (
            <Box>
              <Text fontSize="xs" color="gray.600" mb={2}>
                Tags:
              </Text>
              <Wrap spacing={1}>
                {documento.tags.slice(0, 3).map((tag, index) => (
                  <WrapItem key={index}>
                    <Tag size="sm" colorScheme="blue" variant="subtle">
                      <TagLabel>{tag}</TagLabel>
                    </Tag>
                  </WrapItem>
                ))}
                {documento.tags.length > 3 && (
                  <WrapItem>
                    <Tag size="sm" colorScheme="gray" variant="subtle">
                      <TagLabel>+{documento.tags.length - 3}</TagLabel>
                    </Tag>
                  </WrapItem>
                )}
              </Wrap>
            </Box>
          )}

          {/* Estatísticas */}
          {documento.stats && (
            <HStack spacing={4} fontSize="xs" color="gray.500" justify="space-between">
              <HStack spacing={1}>
                <Icon as={FaEye} />
                <Text>{documento.stats.visualizacoes}</Text>
              </HStack>
              {documento.tipo === 'upload' && (
                <HStack spacing={1}>
                  <Icon as={FaDownload} />
                  <Text>{documento.stats.downloads}</Text>
                </HStack>
              )}
              <HStack spacing={1}>
                <Icon as={FaComment} />
                <Text>{documento.stats.comentarios}</Text>
              </HStack>
              <HStack spacing={1}>
                <Icon as={FaHeart} />
                <Text>{documento.stats.likes}</Text>
              </HStack>
            </HStack>
          )}

          {/* Última Atualização */}
          {documento.dataAtualizacao && (
            <HStack spacing={2} fontSize="xs" color="gray.500">
              <Icon as={FaClock} boxSize={3} />
              <Text>
                Atualizado em {formatDate(documento.dataAtualizacao)}
              </Text>
            </HStack>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
