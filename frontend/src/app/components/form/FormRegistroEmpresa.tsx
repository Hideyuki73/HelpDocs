'use client'

import { Box, Stack, Spinner, Text, FormControl, FormLabel, Input, Flex, Button, useColorModeValue } from '@chakra-ui/react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { object, string, InferType } from 'yup'
import InputMask from 'react-input-mask'

// Validação do CNPJ com máscara
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/

const EmpresaSchema = object({
  nome: string().required('Nome é obrigatório'),
  cnpj: string().matches(cnpjRegex, 'CNPJ inválido. Formato: 00.000.000/0000-00').required('CNPJ é obrigatório'),
  email: string().email('E-mail inválido').required('E-mail é obrigatório'),
  telefone: string()
    .matches(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido. Formato: (00) 00000-0000')
    .required('Telefone é obrigatório'),
  endereco: string().required('Endereço é obrigatório'),
})

export type FormEmpresaValues = InferType<typeof EmpresaSchema>

interface FormEmpresaProps {
  onSubmit: (values: FormEmpresaValues) => void
}

export default function FormEmpresa({ onSubmit }: FormEmpresaProps) {
  const bg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const labelColor = useColorModeValue("gray.700", "gray.200")
  const inputBg = useColorModeValue("white", "gray.700")
  
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
        Cadastro de Empresa
      </Text>

      <Formik
        initialValues={initialValues}
        validationSchema={EmpresaSchema}
        onSubmit={(values, { resetForm }) => {
          if (values) {
            // Remove máscaras antes de enviar
            const cleanValues = {
              ...values,
              cnpj: values.cnpj.replace(/[^\d]/g, ''),
              telefone: values.telefone.replace(/[^\d]/g, '')
            }
            onSubmit(cleanValues)
            resetForm()
          }
        }}
      >
        {({ isSubmitting, setFieldValue, values }) => (
          <Form>
            <Stack spacing={6}>
              <Field name="nome">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel color={labelColor} fontWeight="semibold">Nome da Empresa</FormLabel>
                    <Input
                      {...field}
                      bg={inputBg}
                      borderRadius="md"
                      borderWidth={2}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      placeholder="Digite o nome da empresa"
                    />
                    <Text color="red.500" fontSize="sm" mt={1}>
                      <ErrorMessage name="nome" />
                    </Text>
                  </FormControl>
                )}
              </Field>

              <Field name="cnpj">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel color={labelColor} fontWeight="semibold">CNPJ</FormLabel>
                    <InputMask
                      mask="99.999.999/9999-99"
                      value={field.value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFieldValue('cnpj', e.target.value)}
                    >
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          bg={inputBg}
                          borderRadius="md"
                          borderWidth={2}
                          _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                          placeholder="00.000.000/0000-00"
                        />
                      )}
                    </InputMask>
                    <Text color="red.500" fontSize="sm" mt={1}>
                      <ErrorMessage name="cnpj" />
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
                      placeholder="empresa@exemplo.com"
                    />
                    <Text color="red.500" fontSize="sm" mt={1}>
                      <ErrorMessage name="email" />
                    </Text>
                  </FormControl>
                )}
              </Field>

              <Field name="telefone">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel color={labelColor} fontWeight="semibold">Telefone</FormLabel>
                    <InputMask
                      mask="(99) 99999-9999"
                      value={field.value}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFieldValue('telefone', e.target.value)}
                    >
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          bg={inputBg}
                          borderRadius="md"
                          borderWidth={2}
                          _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                          placeholder="(00) 00000-0000"
                        />
                      )}
                    </InputMask>
                    <Text color="red.500" fontSize="sm" mt={1}>
                      <ErrorMessage name="telefone" />
                    </Text>
                  </FormControl>
                )}
              </Field>

              <Field name="endereco">
                {({ field }: any) => (
                  <FormControl isRequired>
                    <FormLabel color={labelColor} fontWeight="semibold">Endereço</FormLabel>
                    <Input
                      {...field}
                      bg={inputBg}
                      borderRadius="md"
                      borderWidth={2}
                      _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px blue.500" }}
                      placeholder="Rua, número, bairro, cidade - UF"
                    />
                    <Text color="red.500" fontSize="sm" mt={1}>
                      <ErrorMessage name="endereco" />
                    </Text>
                  </FormControl>
                )}
              </Field>

              <Flex justify="center" mt={8}>
                <Button
                  type="submit"
                  size="lg"
                  w="100%"
                  maxW="300px"
                  colorScheme="blue"
                  borderRadius="md"
                  disabled={isSubmitting}
                  _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                  transition="all 0.2s"
                >
                  {isSubmitting ? <Spinner size="sm" /> : 'Cadastrar Empresa'}
                </Button>
              </Flex>
            </Stack>
          </Form>
        )}
      </Formik>
    </Box>
  )
}

