'use client'

import { Box, Stack, Spinner, Text, FormControl, FormLabel, Input, Flex, Button } from '@chakra-ui/react'
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik'
import { object, string, InferType } from 'yup'
import { auth, createUserWithEmailAndPassword } from '../../../config/firebase'
import { updateProfile, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { redirect } from 'next/navigation'
import { criarFuncionarioClient, FuncionarioParams } from '@/action/funcionario'

// ---- Validação ----
const RegistroSchema = object({
  nome: string().required('Nome é obrigatório'),
  email: string().email('E-mail inválido').required('E-mail é obrigatório'),
  senha: string().min(6, 'Mínimo de 6 caracteres').required('Senha é obrigatória'),
})
export type FormRegisterValues = InferType<typeof RegistroSchema>

export default function FormRegistro() {
  const handleRegistro = async (values: FormRegisterValues, actions: FormikHelpers<FormRegisterValues>) => {
    actions.setSubmitting(true)
    try {
      await setPersistence(auth, browserLocalPersistence)
      const cred = await createUserWithEmailAndPassword(auth, values.email, values.senha)
      const user = cred.user
      await updateProfile(user, { displayName: values.nome })

      const account: FuncionarioParams = {
        nome: values.nome,
        email: values.email,
      }
      const token = await user.getIdToken()
      const response = await criarFuncionarioClient(account, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response) {
        actions.resetForm()
        redirect('/user/login')
      }
    } catch (error: any) {
      console.error('Erro ao registrar:', error.message)
      actions.setErrors({ email: error.message })
    } finally {
      actions.setSubmitting(false)
    }
  }

  const initialValues: FormRegisterValues = {
    nome: '',
    email: '',
    senha: '',
  }

  return (
    <Box
      p={8}
      bg="gray.500"
      w="100%"
      mt="5%"
      mx="auto"
    >
      <Text
        color="white"
        fontSize="2xl"
        mb={4}
        textAlign="center"
      >
        Registro
      </Text>

      <Formik
        initialValues={initialValues}
        validationSchema={RegistroSchema}
        onSubmit={handleRegistro}
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

              <Field name="nome">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel color="white">Nome</FormLabel>
                    <Input
                      {...field}
                      bg="white"
                    />
                    <Text
                      color="red.300"
                      fontSize="sm"
                    >
                      <ErrorMessage name="nome" />
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
                  type="submit"
                  w="45%"
                  bg="blue.900"
                  _hover={{ bg: 'blue.700' }}
                  color="white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner size="sm" /> : 'Registrar'}
                </Button>
                <Button
                  as={'a'}
                  href="/user/login"
                  w="45%"
                  bg="blue.900"
                  _hover={{ bg: 'blue.700' }}
                  color="white"
                >
                  Já tenho conta
                </Button>
              </Flex>
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  )
}
