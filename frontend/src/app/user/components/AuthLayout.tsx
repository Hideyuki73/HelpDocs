import { Box, VStack, Text, useColorModeValue } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  showLoginLink?: boolean
  showRegisterLink?: boolean
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  showLoginLink = false,
  showRegisterLink = false,
}: AuthLayoutProps) {
  const bg = useColorModeValue('gray.50', 'gray.900')
  const labelColor = useColorModeValue('gray.700', 'gray.200')

  return (
    <Box
      minH="100vh"
      bg={bg}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <VStack
        spacing={8}
        w="100%"
        maxW="500px"
      >
        <VStack
          spacing={4}
          textAlign="center"
        >
          <Text
            fontSize="3xl"
            fontWeight="bold"
            color={labelColor}
          >
            {title}
          </Text>
          {subtitle && (
            <Text
              fontSize="lg"
              color="gray.600"
              maxW="400px"
            >
              {subtitle}
            </Text>
          )}
        </VStack>

        {children}

        <VStack spacing={2}>
          {showLoginLink && (
            <Text
              fontSize="sm"
              color={labelColor}
            >
              Já tem uma conta?{' '}
              <Text
                as="a"
                color="teal.500"
                href="/user/login"
                fontWeight="bold"
                _hover={{ textDecoration: 'underline' }}
              >
                Faça login
              </Text>
            </Text>
          )}
          {showRegisterLink && (
            <Text
              fontSize="sm"
              color={labelColor}
            >
              Não tem uma conta?{' '}
              <Text
                as="a"
                color="teal.500"
                href="/user/register"
                fontWeight="bold"
                _hover={{ textDecoration: 'underline' }}
              >
                Cadastre-se
              </Text>
            </Text>
          )}
        </VStack>
      </VStack>
    </Box>
  )
}
