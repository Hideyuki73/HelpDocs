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

interface FormLoginProps {
  trocarTela: () => void
}

export default function FormLogin({ trocarTela }: FormLoginProps) {
  const router = useRouter()
  const handleLogin = async (values: FormLoginValues, actions: FormikHelpers<FormLoginValues>) => {
    actions.setSubmitting(true)
    try {
      // configura persistência local
      await setPersistence(auth, browserLocalPersistence)

      // faz login
      const cred = await signInWithEmailAndPassword(auth, values.email, values.senha)
      console.log('Login realizado:', cred.user)
      // redirecionar ou trocar tela
      router.push('/home')
    } catch (error: any) {
      console.error('Erro no login:', error.message)
      actions.setErrors({ email: error.message })
    } finally {
      actions.setSubmitting(false)
    }
  }

  const initialValues: FormLoginValues = { email: '', senha: '' }

  return (
    <Box w="100%">
      <Text
        mt={4}
        color="white"
        fontSize="xl"
        textAlign="center"
      >
        Login
      </Text>
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
                    <FormLabel color="white">E-mail</FormLabel>
                    <Input
                      {...field}
                      type="email"
                      bg="white"
                    />
                    <Text
                      color="red.300"
                      fontSize="sm"
                    >
                      <ErrorMessage name="email" />
                    </Text>
                  </FormControl>
                )}
              </Field>

              <Field name="senha">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel color="white">Senha</FormLabel>
                    <Input
                      {...field}
                      type="password"
                      bg="white"
                    />
                    <Text
                      color="red.300"
                      fontSize="sm"
                    >
                      <ErrorMessage name="senha" />
                    </Text>
                  </FormControl>
                )}
              </Field>

              <Flex justify="space-between">
                <Button
                  w="45%"
                  type="submit"
                  bg="blue.900"
                  _hover={{ bg: 'blue.700' }}
                  color="white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner size="sm" /> : 'Logar'}
                </Button>
                <Button
                  w="45%"
                  onClick={trocarTela}
                  bg="blue.900"
                  _hover={{ bg: 'blue.700' }}
                  color="white"
                >
                  Registrar
                </Button>
              </Flex>
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  )
}
