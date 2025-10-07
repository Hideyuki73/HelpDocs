'use client'

import {
  SimpleGrid,
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  Icon,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts'
import { FaChartPie, FaChartBar, FaChartLine, FaThinkPeaks } from 'react-icons/fa'

interface DashboardChartsProps {
  statsEquipes?: {
    totalEquipes: number
    equipesAtivas: number
    membrosTotal: number
    crescimentoMensal: number
  }
  statsDocumentos?: {
    totalDocumentos: number
    documentosAprovados: number
    documentosPendentes: number
    documentosRejeitados: number
    crescimentoMensal: number
    documentosPorTipo: Array<{ tipo: string; quantidade: number }>
    documentosPorMes: Array<{ mes: string; criados: number; aprovados: number }>
  }
}

export function DashboardCharts({ statsEquipes, statsDocumentos }: DashboardChartsProps) {
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Cores para os gráficos
  const colors = {
    primary: '#3182CE',
    secondary: '#38A169',
    accent: '#ED8936',
    danger: '#E53E3E',
    purple: '#805AD5',
  }

  // Dados mock se não houver dados reais
  const mockDocumentosPorTipo = [
    { tipo: 'Criados', quantidade: 45, color: colors.primary },
    { tipo: 'Uploads', quantidade: 32, color: colors.secondary },
  ]

  const mockDocumentosPorStatus = [
    { status: 'Aprovados', quantidade: 28, color: colors.secondary },
    { status: 'Pendentes', quantidade: 15, color: colors.accent },
    { status: 'Rejeitados', quantidade: 4, color: colors.danger },
  ]

  const mockDocumentosPorMes = [
    { mes: 'Jan', criados: 12, aprovados: 8 },
    { mes: 'Fev', criados: 15, aprovados: 12 },
    { mes: 'Mar', criados: 18, aprovados: 14 },
    { mes: 'Abr', criados: 22, aprovados: 18 },
    { mes: 'Mai', criados: 25, aprovados: 20 },
    { mes: 'Jun', criados: 28, aprovados: 24 },
  ]

  const documentosPorTipo = statsDocumentos?.documentosPorTipo || mockDocumentosPorTipo
  const documentosPorMes = statsDocumentos?.documentosPorMes || mockDocumentosPorMes

  const documentosPorStatus = [
    {
      status: 'Aprovados',
      quantidade: statsDocumentos?.documentosAprovados || 28,
      color: colors.secondary,
    },
    {
      status: 'Pendentes',
      quantidade: statsDocumentos?.documentosPendentes || 15,
      color: colors.accent,
    },
    {
      status: 'Rejeitados',
      quantidade: statsDocumentos?.documentosRejeitados || 4,
      color: colors.danger,
    },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box
          bg={cardBg}
          p={3}
          border="1px"
          borderColor={borderColor}
          borderRadius="md"
          boxShadow="lg"
        >
          <Text
            fontWeight="bold"
            mb={1}
          >
            {label}
          </Text>
          {payload.map((entry: any, index: number) => (
            <Text
              key={index}
              color={entry.color}
              fontSize="sm"
            >
              {entry.name}: {entry.value}
            </Text>
          ))}
        </Box>
      )
    }
    return null
  }

  return (
    <VStack
      spacing={6}
      align="stretch"
    >
      <Heading size="md">Analytics e Relatórios</Heading>

      <SimpleGrid
        columns={{ base: 1, lg: 2 }}
        spacing={6}
      >
        {/* Gráfico de Barras - Documentos por Mês */}
        <Card
          bg={cardBg}
          border="1px"
          borderColor={borderColor}
        >
          <CardHeader>
            <HStack>
              <Icon
                as={FaChartBar}
                color="blue.500"
              />
              <VStack
                align="start"
                spacing={0}
              >
                <Heading size="sm">Documentos por Mês</Heading>
                <Text
                  fontSize="sm"
                  color="gray.600"
                >
                  Criação vs Aprovação
                </Text>
              </VStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <Box h="250px">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={documentosPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="criados"
                    fill={colors.primary}
                    name="Criados"
                  />
                  <Bar
                    dataKey="aprovados"
                    fill={colors.secondary}
                    name="Aprovados"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Gráfico de Pizza - Documentos por Status */}
        <Card
          bg={cardBg}
          border="1px"
          borderColor={borderColor}
        >
          <CardHeader>
            <HStack>
              <Icon
                as={FaChartPie}
                color="green.500"
              />
              <VStack
                align="start"
                spacing={0}
              >
                <Heading size="sm">Documentos por Status</Heading>
                <Text
                  fontSize="sm"
                  color="gray.600"
                >
                  Distribuição atual
                </Text>
              </VStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <Box h="250px">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={documentosPorStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="quantidade"
                    label={({ status, quantidade }) => `${status}: ${quantidade}`}
                  >
                    {documentosPorStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Gráfico de Área - Tendência de Crescimento */}
        <Card
          bg={cardBg}
          border="1px"
          borderColor={borderColor}
        >
          <CardHeader>
            <HStack>
              <Icon
                as={FaChartLine}
                color="purple.500"
              />
              <VStack
                align="start"
                spacing={0}
              >
                <Heading size="sm">Tendência de Crescimento</Heading>
                <Text
                  fontSize="sm"
                  color="gray.600"
                >
                  Últimos 6 meses
                </Text>
              </VStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <Box h="250px">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart data={documentosPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="criados"
                    stackId="1"
                    stroke={colors.primary}
                    fill={colors.primary}
                    fillOpacity={0.6}
                    name="Documentos Criados"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Métricas de Performance */}
        <Card
          bg={cardBg}
          border="1px"
          borderColor={borderColor}
        >
          <CardHeader>
            <HStack>
              <Icon
                as={FaThinkPeaks}
                color="orange.500"
              />
              <VStack
                align="start"
                spacing={0}
              >
                <Heading size="sm">Métricas de Performance</Heading>
                <Text
                  fontSize="sm"
                  color="gray.600"
                >
                  Indicadores chave
                </Text>
              </VStack>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack
              spacing={4}
              align="stretch"
            >
              <Box>
                <HStack
                  justify="space-between"
                  mb={2}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    Taxa de Aprovação
                  </Text>
                  <Text
                    fontSize="sm"
                    color="gray.600"
                  >
                    {statsDocumentos?.totalDocumentos
                      ? Math.round((statsDocumentos.documentosAprovados / statsDocumentos.totalDocumentos) * 100)
                      : 75}
                    %
                  </Text>
                </HStack>
                <Progress
                  value={
                    statsDocumentos?.totalDocumentos
                      ? (statsDocumentos.documentosAprovados / statsDocumentos.totalDocumentos) * 100
                      : 75
                  }
                  colorScheme="green"
                  size="sm"
                  borderRadius="full"
                />
              </Box>

              <Box>
                <HStack
                  justify="space-between"
                  mb={2}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    Documentos Pendentes
                  </Text>
                  <Text
                    fontSize="sm"
                    color="gray.600"
                  >
                    {statsDocumentos?.documentosPendentes || 15}
                  </Text>
                </HStack>
                <Progress
                  value={
                    statsDocumentos?.totalDocumentos
                      ? (statsDocumentos.documentosPendentes / statsDocumentos.totalDocumentos) * 100
                      : 25
                  }
                  colorScheme="orange"
                  size="sm"
                  borderRadius="full"
                />
              </Box>

              <SimpleGrid
                columns={2}
                spacing={4}
                mt={4}
              >
                <Stat size="sm">
                  <StatLabel fontSize="xs">Crescimento Mensal</StatLabel>
                  <StatNumber fontSize="lg">{statsDocumentos?.crescimentoMensal || 12}%</StatNumber>
                  <StatHelpText fontSize="xs">
                    <StatArrow type="increase" />
                    vs mês anterior
                  </StatHelpText>
                </Stat>

                <Stat size="sm">
                  <StatLabel fontSize="xs">Equipes Ativas</StatLabel>
                  <StatNumber fontSize="lg">{statsEquipes?.equipesAtivas || 8}</StatNumber>
                  <StatHelpText fontSize="xs">de {statsEquipes?.totalEquipes || 10} total</StatHelpText>
                </Stat>
              </SimpleGrid>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  )
}
