'use client'

import {
  Box,
  Stack,
  Spinner,
  Text,
  FormControl,
  FormLabel,
  Input,
  Flex,
  Button,
  useColorModeValue,
} from '@chakra-ui/react'
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik'
import { object, string, InferType } from 'yup'
import { auth, createUserWithEmailAndPassword } from '../../../config/firebase'
import { updateProfile, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { criarFuncionarioClient, FuncionarioParams } from '@/action/funcionario'
import { useRouter } from 'next/navigation'

// ---- Validação ----
const RegistroSchema = object({
  nome: string().required('Nome é obrigatório'),
  email: string().email('E-mail inválido').required('E-mail é obrigatório'),
  senha: string().min(6, 'Mínimo de 6 caracteres').required('Senha é obrigatória'),
})
export type FormRegisterValues = InferType<typeof RegistroSchema>

export default function FormRegistro() {
  const router = useRouter()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const labelColor = useColorModeValue('gray.700', 'gray.200')
  const inputBg = useColorModeValue('white', 'gray.700')

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
        router.push('/home')
      }
    } catch (error: any) {
      console.log('Erro ao registrar:', error.message)
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
      bg={bg}
      w="100%"
      mx="auto"
      borderRadius="xl"
      borderWidth={1}
      borderColor={borderColor}
      boxShadow="lg"
    >
      <Text
        color={labelColor}
        fontSize="2xl"
        fontWeight="bold"
        mb={6}
        textAlign="center"
      >
        Criar Conta
      </Text>

      <Formik
        initialValues={initialValues}
        validationSchema={RegistroSchema}
        onSubmit={handleRegistro}
      >
        {({ isSubmitting }) => (
          <Form>
            <Stack spacing={6}>
              <Field name="nome">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel
                      color={labelColor}
                      fontWeight="semibold"
                    >
                      Nome Completo
                    </FormLabel>
                    <Input
                      {...field}
                      bg={inputBg}
                      borderRadius="md"
                      borderWidth={2}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                      placeholder="Digite seu nome completo"
                    />
                    <Text
                      color="red.500"
                      fontSize="sm"
                      mt={1}
                    >
                      <ErrorMessage name="nome" />
                    </Text>
                  </FormControl>
                )}
              </Field>

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
                      bg={inputBg}
                      borderRadius="md"
                      borderWidth={2}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                      placeholder="seu@email.com"
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
                      bg={inputBg}
                      borderRadius="md"
                      borderWidth={2}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px blue.500' }}
                      placeholder="Mínimo 6 caracteres"
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

              <Stack
                spacing={4}
                mt={8}
              >
                <Button
                  type="submit"
                  size="lg"
                  w="100%"
                  colorScheme="blue"
                  borderRadius="md"
                  disabled={isSubmitting}
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  {isSubmitting ? <Spinner size="sm" /> : 'Criar Conta'}
                </Button>

                <Button
                  as={'a'}
                  href="/user/login"
                  size="lg"
                  w="100%"
                  variant="outline"
                  colorScheme="blue"
                  borderRadius="md"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
                  transition="all 0.2s"
                >
                  Já tenho conta
                </Button>
              </Stack>
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  )
}
