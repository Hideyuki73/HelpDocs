import { Box, Stack, FormControl, FormLabel, Input, Text, Button, useColorModeValue } from '@chakra-ui/react'
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik'
import { object, string } from 'yup'
import { LoginFormData } from '../types'

const LoginSchema = object({
  email: string().email('E-mail inválido').required('E-mail é obrigatório'),
  senha: string().required('Senha é obrigatória'),
})

interface LoginFormProps {
  onSubmit: (values: LoginFormData) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

export default function LoginForm({ onSubmit, isLoading = false, error }: LoginFormProps) {
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const labelColor = useColorModeValue('gray.700', 'gray.200')
  const inputBg = useColorModeValue('white', 'gray.700')

  const handleSubmit = async (values: LoginFormData, actions: FormikHelpers<LoginFormData>) => {
    try {
      await onSubmit(values)
    } catch (error: any) {
      actions.setErrors({ senha: 'E-mail ou senha inválidos' })
    }
  }

  const initialValues: LoginFormData = { email: '', senha: '' }

  return (
    <Box
      p={8}
      borderWidth={1}
      borderRadius="xl"
      boxShadow="lg"
      bg={bg}
      borderColor={borderColor}
      w="100%"
      maxW="400px"
    >
      <Text
        color={labelColor}
        fontSize="2xl"
        fontWeight="bold"
        mb={6}
        textAlign="center"
      >
        Entrar na Conta
      </Text>

      {error && (
        <Text
          color="red.500"
          fontSize="sm"
          mb={4}
          textAlign="center"
        >
          {error}
        </Text>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Stack spacing={6}>
              <Field name="email">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel
                      color={labelColor}
                      fontWeight="semibold"
                    >
                      E-mail
                    </FormLabel>
                    <Input
                      {...field}
                      type="email"
                      placeholder="seu@email.com"
                      bg={inputBg}
                      borderRadius="md"
                      borderWidth={2}
                      _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px teal.500' }}
                    />
                    <Text
                      color="red.500"
                      fontSize="sm"
                      mt={1}
                    >
                      <ErrorMessage name="email" />
                    </Text>
                  </FormControl>
                )}
              </Field>

              <Field name="senha">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel
                      color={labelColor}
                      fontWeight="semibold"
                    >
                      Senha
                    </FormLabel>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Digite sua senha"
                      bg={inputBg}
                      borderRadius="md"
                      borderWidth={2}
                      _focus={{ borderColor: 'teal.500', boxShadow: '0 0 0 1px teal.500' }}
                    />
                    <Text
                      color="red.500"
                      fontSize="sm"
                      mt={1}
                    >
                      <ErrorMessage name="senha" />
                    </Text>
                  </FormControl>
                )}
              </Field>

              <Button
                colorScheme="teal"
                size="lg"
                type="submit"
                isLoading={isSubmitting || isLoading}
                mt={4}
                borderRadius="md"
                _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                transition="all 0.2s"
              >
                Entrar
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  )
}
