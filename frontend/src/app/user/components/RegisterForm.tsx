import { Box, Stack, Text, FormControl, FormLabel, Input, Button, useColorModeValue } from '@chakra-ui/react'
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik'
import { object, string, InferType } from 'yup'
import { RegisterFormData } from '../types'

const RegisterSchema = object({
  nome: string().required('Nome é obrigatório'),
  email: string().email('E-mail inválido').required('E-mail é obrigatório'),
  senha: string().min(6, 'Mínimo de 6 caracteres').required('Senha é obrigatória'),
})

interface RegisterFormProps {
  onSubmit: (values: RegisterFormData) => Promise<void>
  isLoading?: boolean
  error?: string | null
}

export default function RegisterForm({ onSubmit, isLoading = false, error }: RegisterFormProps) {
  const bg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const labelColor = useColorModeValue("gray.700", "gray.200")
  const inputBg = useColorModeValue("white", "gray.700")

  const handleSubmit = async (values: RegisterFormData, actions: FormikHelpers<RegisterFormData>) => {
    try {
      await onSubmit(values)
      actions.resetForm()
    } catch (error: any) {
      actions.setErrors({ email: error.message })
    }
  }

  const initialValues: RegisterFormData = {
    nome: '',
    email: '',
    senha: '',
  }

  return (
    <Box
      p={8}
      bg={bg}
      w="100%"
      maxW="400px"
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

      {error && (
        <Text color="red.500" fontSize="sm" mb={4} textAlign="center">
          {error}
        </Text>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <Stack spacing={6}>
              <Field name="nome">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel color={labelColor} fontWeight="semibold">Nome Completo</FormLabel>
                    <Input
                      {...field}
                      bg={inputBg}
                      borderRadius="md"
                      borderWidth={2}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      placeholder="Digite seu nome completo"
                    />
                    <Text color="red.500" fontSize="sm" mt={1}>
                      <ErrorMessage name="nome" />
                    </Text>
                  </FormControl>
                )}
              </Field>

              <Field name="email">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel color={labelColor} fontWeight="semibold">E-mail</FormLabel>
                    <Input
                      {...field}
                      type="email"
                      bg={inputBg}
                      borderRadius="md"
                      borderWidth={2}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      placeholder="seu@email.com"
                    />
                    <Text color="red.500" fontSize="sm" mt={1}>
                      <ErrorMessage name="email" />
                    </Text>
                  </FormControl>
                )}
              </Field>

              <Field name="senha">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel color={labelColor} fontWeight="semibold">Senha</FormLabel>
                    <Input
                      {...field}
                      type="password"
                      bg={inputBg}
                      borderRadius="md"
                      borderWidth={2}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      placeholder="Mínimo 6 caracteres"
                    />
                    <Text color="red.500" fontSize="sm" mt={1}>
                      <ErrorMessage name="senha" />
                    </Text>
                  </FormControl>
                )}
              </Field>

              <Button
                type="submit"
                size="lg"
                w="100%"
                colorScheme="blue"
                borderRadius="md"
                isLoading={isSubmitting || isLoading}
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                Criar Conta
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  )
}

