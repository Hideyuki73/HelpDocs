// Conteúdo completo de empresa-selection/page.tsx
// Certifique-se de que este é o conteúdo EXATO do seu arquivo

'use client'

import { useState } from 'react'
import { 
  Box, 
  VStack, 
  Alert, 
  AlertIcon, 
  Text, 
  Heading, 
  Stack, 
  FormControl, 
  FormLabel, 
  Input, 
  Button, 
  Spinner,
  useColorModeValue
} from '@chakra-ui/react'
import { Formik, Form, Field, ErrorMessage, FormikHelpers } from 'formik'
import { object, string, InferType } from 'yup'
import { useRouter } from 'next/navigation'
import { entrarEmpresaPorConvite } from '@/action/empresa'

const ConviteSchema = object({
  codigo: string().required('Código de convite é obrigatório'),
})

export type FormConviteValues = InferType<typeof ConviteSchema>

export default function EmpresaSelectionPage() {
  const router = useRouter()
  const [showConviteForm, setShowConviteForm] = useState(false)
  const bg = useColorModeValue("white", "gray.800")
  const border = useColorModeValue("gray.200", "gray.700")

  const handleEntrarEmpresa = async (values: FormConviteValues, actions: FormikHelpers<FormConviteValues>) => {
    actions.setSubmitting(true)
    try {
      await entrarEmpresaPorConvite(values.codigo)
      console.log("Entrou na empresa com sucesso")
      
      // Redirecionar para home após entrar na empresa
      router.push("/home")
    } catch (error: any) {
      console.error("Erro ao validar convite:", error.message)
      actions.setErrors({ codigo: "Código de convite inválido ou expirado" })
    } finally {
      actions.setSubmitting(false)
    }
  }

  const handleRegistrarEmpresa = () => {
    router.push("/empresa/register")
  }

  const initialValues: FormConviteValues = { codigo: "" }

  return (
    <Box
      maxW="600px"
      mx="auto"
      mt={16}
      p={8}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="lg"
      bg={bg}
      borderColor={border}
    >
      <VStack spacing={6} align="center">
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Text>Não cadastrado em nenhuma empresa</Text>
        </Alert>

        <Box
          w="100%"
          p={6}
          bg="blue.100"
          borderRadius="md"
          textAlign="center"
        >
          <Heading size="md" mb={4} color="blue.800">
            Como deseja prosseguir?
          </Heading>

          {!showConviteForm ? (
            <Stack spacing={4}>
              <FormControl>
                <FormLabel color="blue.700">Código de convite</FormLabel>
                <Input
                  placeholder="Digite o código de convite"
                  bg="white"
                  onClick={() => setShowConviteForm(true)}
                  readOnly
                  cursor="pointer"
                />
              </FormControl>

              <Stack direction={{ base: "column", md: "row" }} spacing={4} justify="center">
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleRegistrarEmpresa}
                  flex={1}
                >
                  Registrar empresa
                </Button>
                <Button
                  colorScheme="teal"
                  size="lg"
                  onClick={() => setShowConviteForm(true)}
                  flex={1}
                >
                  Entrar em uma empresa
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Formik
              initialValues={initialValues}
              validationSchema={ConviteSchema}
              onSubmit={handleEntrarEmpresa}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Stack spacing={4}>
                    <Field name="codigo">
                      {({ field }: any) => (
                        <FormControl isRequired>
                          <FormLabel color="blue.700">Código de convite</FormLabel>
                          <Input
                            {...field}
                            placeholder="Digite o código de convite"
                            bg="white"
                            autoFocus
                          />
                          <Text color="red.500" fontSize="sm">
                            <ErrorMessage name="codigo" />
                          </Text>
                        </FormControl>
                      )}
                    </Field>

                    <Stack direction={{ base: "column", md: "row" }} spacing={4} justify="center">
                      <Button
                        colorScheme="blue"
                        size="lg"
                        onClick={handleRegistrarEmpresa}
                        flex={1}
                      >
                        Registrar empresa
                      </Button>
                      <Button
                        colorScheme="teal"
                        size="lg"
                        type="submit"
                        disabled={isSubmitting}
                        flex={1}
                      >
                        {isSubmitting ? <Spinner size="sm" /> : "Entrar em uma empresa"}
                      </Button>
                    </Stack>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConviteForm(false)}
                      color="blue.600"
                    >
                      Voltar
                    </Button>
                  </Stack>
                </Form>
              )}
            </Formik>
          )}
        </Box>
      </VStack>
    </Box>
  )
}
