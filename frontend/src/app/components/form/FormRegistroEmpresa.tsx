'use client'

import { Box, Stack, Spinner, Text, FormControl, FormLabel, Input, Flex, Button } from '@chakra-ui/react'
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik'
import { object, string, InferType } from 'yup'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

// Validação do CNPJ simples (14 dígitos numéricos)
const cnpjRegex = /^\d{14}$/

const EmpresaSchema = object({
  nome: string().required('Nome é obrigatório'),
  cnpj: string().matches(cnpjRegex, 'CNPJ inválido. Deve conter 14 números').required('CNPJ é obrigatório'),
  email: string().email('E-mail inválido').required('E-mail é obrigatório'),
  telefone: string()
    .matches(/^[0-9]{10,11}$/, 'Telefone inválido')
    .required('Telefone é obrigatório'),
  endereco: string().required('Endereço é obrigatório'),
})

export type FormEmpresaValues = InferType<typeof EmpresaSchema>

interface FormEmpresaProps {
  onSubmit: (values: FormEmpresaValues) => void
}

export default function FormEmpresa({ onSubmit }: FormEmpresaProps) {
  const initialValues: FormEmpresaValues = {
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
  }

  return (
    <Box
      p={8}
      bg="gray.500"
      w="100%"
      mt="5%"
      mx="auto"
      borderRadius="md"
    >
      <Text
        color="white"
        fontSize="2xl"
        mb={4}
        textAlign="center"
      >
        Cadastro de Empresa
      </Text>

      <Formik
        initialValues={initialValues}
        validationSchema={EmpresaSchema}
        onSubmit={(values, { resetForm }) => {
          if (values) {
            onSubmit(values)
            resetForm()
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Stack spacing={4}>
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

              <Field name="cnpj">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel color="white">CNPJ</FormLabel>
                    <Input
                      {...field}
                      type="text"
                      maxLength={14}
                      bg="white"
                    />
                    <Text
                      color="red.300"
                      fontSize="sm"
                    >
                      <ErrorMessage name="cnpj" />
                    </Text>
                  </FormControl>
                )}
              </Field>

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

              <Field name="telefone">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel color="white">Telefone</FormLabel>
                    <Input
                      {...field}
                      type="tel"
                      bg="white"
                      maxLength={11}
                    />
                    <Text
                      color="red.300"
                      fontSize="sm"
                    >
                      <ErrorMessage name="telefone" />
                    </Text>
                  </FormControl>
                )}
              </Field>

              <Field name="endereco">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel color="white">Endereço</FormLabel>
                    <Input
                      {...field}
                      bg="white"
                    />
                    <Text
                      color="red.300"
                      fontSize="sm"
                    >
                      <ErrorMessage name="endereco" />
                    </Text>
                  </FormControl>
                )}
              </Field>

              <Flex justify="center">
                <Button
                  type="submit"
                  w="50%"
                  bg="blue.900"
                  _hover={{ bg: 'blue.700' }}
                  color="white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner size="sm" /> : 'Cadastrar'}
                </Button>
              </Flex>
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  )
}
