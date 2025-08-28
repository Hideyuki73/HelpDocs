'use client'

import {
  Spinner,
  Box,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Text,
  Flex,
  Button,
  useColorModeValue,
} from '@chakra-ui/react'
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik'
import { object, string, InferType } from 'yup'
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { auth } from '../../../config/firebase'
import { useRouter } from 'next/navigation'

const LoginSchema = object({
  email: string().email('E-mail inválido').required('E-mail é obrigatório'),
  senha: string().required('Senha é obrigatória'),
})

export type FormLoginValues = InferType<typeof LoginSchema>

export default function FormLogin() {
  const router = useRouter()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const labelColor = useColorModeValue('gray.700', 'gray.200')
  const inputBg = useColorModeValue('white', 'gray.700')

  const handleLogin = async (values: FormLoginValues, actions: FormikHelpers<FormLoginValues>) => {
    actions.setSubmitting(true)
    try {
      await setPersistence(auth, browserLocalPersistence)
      const cred = await signInWithEmailAndPassword(auth, values.email, values.senha)
      console.log('Login bem-sucedido:', cred.user.uid)
      router.push('/empresa-selection') // Redireciona para a página de seleção de empresa
    } catch (error: any) {
      console.log('Erro de login:', error.message)
      actions.setErrors({ senha: 'E-mail ou senha inválidos' })
    } finally {
      actions.setSubmitting(false)
    }
  }

  const initialValues: FormLoginValues = { email: '', senha: '' }

  return (
    <Box
      p={8}
      borderWidth={1}
      borderRadius="xl"
      boxShadow="lg"
      bg={bg}
      borderColor={borderColor}
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

      <Formik
        initialValues={initialValues}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
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
                isLoading={isSubmitting}
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

      <Flex
        mt={6}
        justifyContent="center"
      >
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
      </Flex>
    </Box>
  )
}
