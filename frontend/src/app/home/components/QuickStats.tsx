'use client'

import {
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Box,
  Icon,
  HStack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  FaUsers,
  FaFileAlt,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from 'react-icons/fa'

interface QuickStatsProps {
  statsEquipes?: {
    totalEquipes: number
    equipesAtivas: number
    membrosTotal: number
  }
  statsDocumentos?: {
    totalDocumentos: number
    documentosAprovados: number
    documentosPendentes: number
    documentosRejeitados: number
  }
}

export function QuickStats({ statsEquipes, statsDocumentos }: QuickStatsProps) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const stats = [
    {
      label: 'Total de Equipes',
      value: statsEquipes?.totalEquipes || 0,
      helpText: 'Equipes ativas',
      icon: FaUsers,
      color: 'blue.500',
      trend: 'increase',
    },
    {
      label: 'Total de Documentos',
      value: statsDocumentos?.totalDocumentos || 0,
      helpText: 'Documentos no sistema',
      icon: FaFileAlt,
      color: 'green.500',
      trend: 'increase',
    },
    {
      label: 'Documentos Pendentes',
      value: statsDocumentos?.documentosPendentes || 0,
      helpText: 'Aguardando revisão',
      icon: FaClock,
      color: 'orange.500',
      trend: 'decrease',
    },
    {
      label: 'Documentos Aprovados',
      value: statsDocumentos?.documentosAprovados || 0,
      helpText: 'Este mês',
      icon: FaCheckCircle,
      color: 'purple.500',
      trend: 'increase',
    },
  ]

  return (
    <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
      {stats.map((stat, index) => (
        <Box
          key={index}
          bg={cardBg}
          p={6}
          borderRadius="lg"
          border="1px"
          borderColor={borderColor}
          boxShadow="sm"
          _hover={{
            boxShadow: 'md',
            transform: 'translateY(-2px)',
          }}
          transition="all 0.2s"
        >
          <Stat>
            <StatLabel>
              <HStack spacing={2}>
                <Icon as={stat.icon} color={stat.color} boxSize={4} />
                <Text fontSize="sm" fontWeight="medium">
                  {stat.label}
                </Text>
              </HStack>
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" mt={2}>
              {stat.value}
            </StatNumber>
            <StatHelpText mt={1}>
              <StatArrow type={stat.trend as 'increase' | 'decrease'} />
              {stat.helpText}
            </StatHelpText>
          </Stat>
        </Box>
      ))}
    </SimpleGrid>
  )
}
