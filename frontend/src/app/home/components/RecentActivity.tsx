'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  Badge,
  Spacer,
  Card,
  CardHeader,
  CardBody,
  Heading,
  useColorModeValue,
  Avatar,
  Divider,
} from '@chakra-ui/react'
import { FaFileAlt, FaUsers, FaUpload, FaClock } from 'react-icons/fa'

interface ActivityItem {
  id: string
  type: 'documento' | 'equipe' | 'aprovacao' | 'upload'
  title: string
  description: string
  timestamp: Date
  user?: {
    nome: string
    avatar?: string
  }
  status?: 'success' | 'warning' | 'info' | 'error'
}

interface RecentActivityProps {
  activities?: ActivityItem[]
  loading?: boolean
}

export function RecentActivity({ activities = [], loading = false }: RecentActivityProps) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Mock data se não houver atividades
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'documento',
      title: 'Documento aprovado',
      description: 'Manual de Procedimentos foi aprovado',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min atrás
      user: { nome: 'João Silva' },
      status: 'success',
    },
    {
      id: '2',
      type: 'equipe',
      title: 'Nova equipe criada',
      description: 'Equipe de Desenvolvimento Frontend',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2h atrás
      user: { nome: 'Maria Santos' },
      status: 'info',
    },
    {
      id: '3',
      type: 'upload',
      title: 'Arquivo enviado',
      description: 'Relatório Mensal.pdf foi enviado',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4h atrás
      user: { nome: 'Pedro Costa' },
      status: 'info',
    },
    {
      id: '4',
      type: 'aprovacao',
      title: 'Documento pendente',
      description: 'Política de Segurança aguarda aprovação',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6h atrás
      user: { nome: 'Ana Oliveira' },
      status: 'warning',
    },
  ]

  const displayActivities = activities.length > 0 ? activities : mockActivities

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'documento':
        return FaFileAlt
      case 'equipe':
        return FaUsers
      case 'aprovacao':
        return FaClock
      case 'upload':
        return FaUpload
      default:
        return FaFileAlt
    }
  }

  const getActivityColor = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'green.500'
      case 'warning':
        return 'orange.500'
      case 'error':
        return 'red.500'
      case 'info':
      default:
        return 'blue.500'
    }
  }

  const getBadgeColorScheme = (status: ActivityItem['status']) => {
    switch (status) {
      case 'success':
        return 'green'
      case 'warning':
        return 'orange'
      case 'error':
        return 'red'
      case 'info':
      default:
        return 'blue'
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`

    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d atrás`
  }

  return (
    <Card
      bg={cardBg}
      border="1px"
      borderColor={borderColor}
    >
      <CardHeader>
        <HStack>
          <Icon
            as={FaClock}
            color="blue.500"
          />
          <Heading size="md">Atividade Recente</Heading>
        </HStack>
      </CardHeader>
      <CardBody>
        {loading ? (
          <VStack spacing={4}>
            <Text color="gray.500">Carregando atividades...</Text>
          </VStack>
        ) : (
          <VStack
            spacing={4}
            align="stretch"
          >
            {displayActivities.slice(0, 5).map((activity, index) => (
              <Box key={activity.id}>
                <HStack
                  spacing={3}
                  align="start"
                >
                  <Avatar
                    size="sm"
                    name={activity.user?.nome}
                    src={activity.user?.avatar}
                  />
                  <Box flex={1}>
                    <HStack
                      spacing={2}
                      mb={1}
                    >
                      <Icon
                        as={getActivityIcon(activity.type)}
                        color={getActivityColor(activity.status)}
                        boxSize={4}
                      />
                      <Text
                        fontWeight="medium"
                        fontSize="sm"
                      >
                        {activity.title}
                      </Text>
                      <Spacer />
                      <Badge
                        colorScheme={getBadgeColorScheme(activity.status)}
                        size="sm"
                      >
                        {formatTimeAgo(activity.timestamp)}
                      </Badge>
                    </HStack>
                    <Text
                      fontSize="sm"
                      color="gray.600"
                    >
                      {activity.description}
                    </Text>
                    {activity.user && (
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        mt={1}
                      >
                        por {activity.user.nome}
                      </Text>
                    )}
                  </Box>
                </HStack>
                {index < displayActivities.length - 1 && <Divider mt={4} />}
              </Box>
            ))}

            {displayActivities.length === 0 && (
              <Box
                textAlign="center"
                py={8}
              >
                <Icon
                  as={FaClock}
                  boxSize={8}
                  color="gray.400"
                  mb={2}
                />
                <Text color="gray.500">Nenhuma atividade recente</Text>
              </Box>
            )}
          </VStack>
        )}
      </CardBody>
    </Card>
  )
}
