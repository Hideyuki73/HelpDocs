'use client'

import { Box, Stack, Spinner, Text, FormControl, FormLabel, Input, Flex, Button } from '@chakra-ui/react'
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik'
import { object, string, InferType } from 'yup'
import { auth, createUserWithEmailAndPassword } from '../../../config/firebase'
import { updateProfile } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import { setPersistence, browserLocalPersistence } from 'firebase/auth'

// ---- Validação ----
const RegistroSchema = object({
  nome: string().required('Nome é obrigatório'),
  email: string().email('E-mail inválido').required('E-mail é obrigatório'),
  senha: string().min(6, 'Mínimo de 6 caracteres').required('Senha é obrigatória'),
  celular: string()
    .matches(/^[0-9]{10,11}$/, 'Celular inválido')
    .required('Celular é obrigatório'),
})
export type FormRegisterValues = InferType<typeof RegistroSchema>

interface FormRegistroProps {
  trocarTela: () => void
}

export default function FormRegistro({ trocarTela }: FormRegistroProps) {
  const firestore = getFirestore()

  const handleRegistro = async (values: FormRegisterValues, actions: FormikHelpers<FormRegisterValues>) => {
    actions.setSubmitting(true)
    try {
      // Persistência local antes de criar usuário
      await setPersistence(auth, browserLocalPersistence)

      // Criar usuário no Auth
      const cred = await createUserWithEmailAndPassword(auth, values.email, values.senha)
      const user = cred.user

      // Atualizar displayName
      await updateProfile(user, { displayName: values.nome })

      // Salvar dados extras no Firestore
      // Coleções e documentos são criados automaticamente no Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        nome: values.nome,
        email: values.email,
        celular: values.celular,
        createdAt: new Date(),
      })

      console.log('Usuário registrado e perfil atualizado:', user)
      actions.resetForm()
      trocarTela() // volta para login
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
    celular: '',
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
              {/* E-mail */}
              <Field name="email">
                {({ field }: any) => (
                  <FormControl
                    isInvalid={!!(field.name && ErrorMessage)}
                    isRequired
                  >
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

              {/* Nome */}
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

              {/* Senha */}
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

              {/* Celular */}
              <Field name="celular">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel color="white">Celular</FormLabel>
                    <Input
                      {...field}
                      type="tel"
                      bg="white"
                    />
                    <Text
                      color="red.300"
                      fontSize="sm"
                    >
                      <ErrorMessage name="celular" />
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
                  onClick={trocarTela}
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
