'use client'

import { Box, Button, Heading, Stack, Text, VStack, SimpleGrid, Icon } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { PageLayout } from './components/layout/PageLayout'
import { FaRobot, FaLock, FaUsers, FaComments, FaChartLine } from 'react-icons/fa'

export default function HomePage() {
  const router = useRouter()

  return (
    <PageLayout title="Bem-vindo ao HelpDocs">
      <VStack spacing={10} align="center" mt={8}>
        <Text fontSize="xl" textAlign="center" maxW="800px">
          Uma plataforma inteligente para documentação de software. Com suporte de IA, colaboração em equipe e segurança, você nunca mais vai esquecer uma etapa.
        </Text>

        <Stack direction={{ base: 'column', md: 'row' }} spacing={6}>
          <Button colorScheme="teal" size="lg" onClick={() => router.push('user/login')}>
            Entrar
          </Button>
          <Button
  variant="outline"
  colorScheme="teal"
  size="lg"
  onClick={() => router.push('/user/register')}
>
  Criar Conta
</Button>

        </Stack>

        <Box mt={10} w="100%">
          <Heading size="md" mb={6} textAlign="center">
            Funcionalidades Principais
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
            <Feature
              icon={FaRobot}
              title="Documentação com IA"
              description="Crie e edite documentos com sugestões inteligentes, correções automáticas e análise de qualidade."
            />
            <Feature
              icon={FaLock}
              title="Segurança e Criptografia"
              description="Proteja seus arquivos com autenticação segura e criptografia de ponta a ponta."
            />
            <Feature
              icon={FaUsers}
              title="Gestão de Equipes"
              description="Adicione membros, defina permissões e organize sua equipe com eficiência."
            />
            <Feature
              icon={FaComments}
              title="Chat Interno"
              description="Comunique-se com sua equipe diretamente na plataforma, sem depender de apps externos."
            />
            <Feature
              icon={FaChartLine}
              title="Acompanhamento de Progresso"
              description="Visualize o andamento das etapas do projeto e mantenha tudo sob controle."
            />
          </SimpleGrid>
        </Box>

        <Box mt={16} textAlign="center">
          <Heading size="md" mb={4}>Para quem é o HelpDocs?</Heading>
          <Text maxW="700px" mx="auto">
            Desenvolvedores, gerentes de projeto, analistas de requisitos, product owners e profissionais de UX que desejam uma documentação mais eficiente, organizada e colaborativa.
          </Text>
        </Box>

        <Box mt={16} textAlign="center">
          <Heading size="md" mb={4}>Como funciona?</Heading>
          <Text maxW="700px" mx="auto">
            Após criar sua conta, você pode cadastrar sua empresa, montar sua equipe, criar documentos e deixar que a IA te ajude a manter tudo claro, completo e bem estruturado.
          </Text>
        </Box>
      </VStack>
    </PageLayout>
  )
}

interface FeatureProps {
  icon: any
  title: string
  description: string
}

function Feature({ icon, title, description }: FeatureProps) {
  return (
    <Stack direction="row" spacing={4} align="start">
      <Icon as={icon} boxSize={6} color="teal.500" />
      <Box>
        <Text fontWeight="bold">{title}</Text>
        <Text>{description}</Text>
      </Box>
    </Stack>
  )
}
