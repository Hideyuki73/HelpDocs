// Conteúdo completo de FormLogin.tsx
// Certifique-se de que este é o conteúdo EXATO do seu arquivo

'use client'

import { Spinner, Box, Stack, FormControl, FormLabel, Input, Text, Flex, Button } from '@chakra-ui/react'
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

  const handleLogin = async (values: FormLoginValues, actions: FormikHelpers<FormLoginValues>) => {
    actions.setSubmitting(true)
    try {
      await setPersistence(auth, browserLocalPersistence)
      const cred = await signInWithEmailAndPassword(auth, values.email, values.senha)
      console.log('Login bem-sucedido:', cred.user.uid)
      router.push('/empresa-selection') // Redireciona para a página de seleção de empresa
    } catch (error: any) {
      console.error('Erro de login:', error.message)
      actions.setErrors({ senha: 'E-mail ou senha inválidos' })
    } finally {
      actions.setSubmitting(false)
    }
  }

  const initialValues: FormLoginValues = { email: '', senha: '' }

  return (
    <Box p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white">
      <Formik
        initialValues={initialValues}
        validationSchema={LoginSchema}
        onSubmit={handleLogin}
      >
        {({ isSubmitting }) => (
          <Form>
            <Stack spacing={4}>
              <Field name="email">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel>E-mail</FormLabel>
                    <Input {...field} type="email" placeholder="Seu e-mail" />
                    <Text color="red.500" fontSize="sm">
                      <ErrorMessage name="email" />
                    </Text>
                  </FormControl>
                )}
              </Field>

              <Field name="senha">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel>Senha</FormLabel>
                    <Input {...field} type="password" placeholder="Sua senha" />
                    <Text color="red.500" fontSize="sm">
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
              >
                Entrar
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>

      <Flex mt={4} justifyContent="center">
        <Text fontSize="sm">
          Não tem uma conta?{' '}
          <Text as="a" color="teal.500" href="/user/register" fontWeight="bold">
            Cadastre-se
          </Text>
        </Text>
      </Flex>
    </Box>
  )
}
