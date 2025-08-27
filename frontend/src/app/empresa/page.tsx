'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  Button,
  SimpleGrid,
  Select,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Badge,
} from '@chakra-ui/react'
import { getMinhaEmpresa, gerarConvite } from '@/action/empresa'
import { getFuncionarios, updateCargoFuncionario } from '@/action/funcionario'
import { getUsuarioLogado, isAdmin, UsuarioLogado } from '@/action/auth'

interface Membro {
  id: string
  nome?: string
  email?: string
  cargo?: string
}

const CARGOS_DISPONIVEIS = ['Administrador', 'Gerente de Projetos', 'Desenvolvedor']

export default function EmpresaPage() {
  const [empresa, setEmpresa] = useState<any>(null)
  const [membros, setMembros] = useState<Membro[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMembros, setLoadingMembros] = useState(false)
  const [convite, setConvite] = useState<string | null>(null)
  const [membroSelecionado, setMembroSelecionado] = useState<Membro | null>(null)
  const [cargoSelecionado, setCargoSelecionado] = useState('')
  const [loadingCargo, setLoadingCargo] = useState(false)
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  useEffect(() => {
    const fetchEmpresa = async () => {
      try {
        // Buscar dados do usuário logado
        const usuario = await getUsuarioLogado()
        setUsuarioLogado(usuario)

        const data = await getMinhaEmpresa()
        setEmpresa(data)

        // Buscar informações dos membros
        if (data.membros && data.membros.length > 0) {
          setLoadingMembros(true)
          try {
            const membrosData = await getFuncionarios(data.membros)
            setMembros(membrosData)
          } catch (error) {
            console.error('Erro ao buscar membros:', error)
            // Fallback: usar UIDs como nomes
            const membrosBasicos = data.membros.map((uid: string) => ({
              id: uid,
              nome: `Usuário ${uid.substring(0, 8)}`,
              email: 'Email não disponível',
            }))
            setMembros(membrosBasicos)
          } finally {
            setLoadingMembros(false)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchEmpresa()
  }, [])

  const handleGerarConvite = async () => {
    if (!empresa) return
    try {
      const { codigo } = await gerarConvite(empresa.id)
      setConvite(codigo)
    } catch (error) {
      console.error('Erro ao gerar convite:', error)
    }
  }

  const handleAbrirModalCargo = (membro: Membro) => {
    setMembroSelecionado(membro)
    setCargoSelecionado(membro.cargo || '')
    onOpen()
  }

  const handleAtualizarCargo = async () => {
    if (!membroSelecionado || !cargoSelecionado) return

    setLoadingCargo(true)
    try {
      await updateCargoFuncionario(membroSelecionado.id, cargoSelecionado)

      // Atualizar a lista de membros
      setMembros((prev) =>
        prev.map((membro) => (membro.id === membroSelecionado.id ? { ...membro, cargo: cargoSelecionado } : membro)),
      )

      toast({
        title: 'Cargo atualizado',
        description: `Cargo de ${membroSelecionado.nome} atualizado para ${cargoSelecionado}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      onClose()
    } catch (error: any) {
      console.error('Erro ao atualizar cargo:', error)
      toast({
        title: 'Erro ao atualizar cargo',
        description: error.response?.data?.message || 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoadingCargo(false)
    }
  }

  if (loading)
    return (
      <Spinner
        size="xl"
        thickness="4px"
        color="teal.500"
        display="block"
        mx="auto"
        mt={20}
      />
    )

  if (!empresa)
    return (
      <Text
        textAlign="center"
        mt={10}
      >
        Nenhuma empresa associada.
      </Text>
    )

  return (
    <>
      <Box
        maxW="900px"
        mx="auto"
        mt={16}
        p={8}
        borderWidth={1}
        borderRadius="2xl"
        boxShadow="lg"
        bg="white"
      >
        <Heading
          size="lg"
          mb={6}
          textAlign="center"
        >
          {empresa.nome}
        </Heading>

        <SimpleGrid
          columns={{ base: 1, md: 2 }}
          spacing={6}
        >
          {/* Box de dados da empresa */}
          <Box
            p={4}
            borderWidth={1}
            borderRadius="lg"
            bg="gray.50"
          >
            <VStack
              align="start"
              spacing={3}
            >
              <Heading size="md">Dados importantes</Heading>
              <Text>
                <b>Telefone:</b> {empresa.telefone}
              </Text>
              <Text>
                <b>CNPJ:</b> {empresa.cnpj}
              </Text>
              <Text>
                <b>E-mail:</b> {empresa.email}
              </Text>
              <Text>
                <b>Endereço:</b> {empresa.endereco}
              </Text>
            </VStack>
          </Box>

          {/* Box de membros */}
          <Box
            p={4}
            borderWidth={1}
            borderRadius="lg"
            bg="gray.50"
          >
            <VStack
              align="stretch"
              spacing={3}
            >
              <Heading size="md">Membros ({membros.length})</Heading>

              {loadingMembros ? (
                <Box
                  textAlign="center"
                  py={4}
                >
                  <Spinner size="md" />
                  <Text
                    mt={2}
                    fontSize="sm"
                  >
                    Carregando membros...
                  </Text>
                </Box>
              ) : membros.length > 0 ? (
                membros.map((membro: Membro) => (
                  <Box
                    key={membro.id}
                    p={3}
                    borderWidth={1}
                    borderRadius="md"
                    bg="white"
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="start"
                    >
                      <Box flex={1}>
                        <Text fontWeight="bold">{membro.nome}</Text>
                        {membro.email && (
                          <Text
                            fontSize="sm"
                            color="gray.600"
                          >
                            {membro.email}
                          </Text>
                        )}
                        {membro.cargo && (
                          <Badge
                            colorScheme="blue"
                            mt={1}
                            fontSize="xs"
                          >
                            {membro.cargo}
                          </Badge>
                        )}
                      </Box>
                      {isAdmin(usuarioLogado) && (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="outline"
                          onClick={() => handleAbrirModalCargo(membro)}
                        >
                          {membro.cargo ? 'Alterar Cargo' : 'Atribuir Cargo'}
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))
              ) : (
                <Text>Nenhum membro ainda</Text>
              )}

              <Button
                colorScheme="teal"
                onClick={handleGerarConvite}
                mt={4}
              >
                Gerar código de convite
              </Button>

              {convite && (
                <Box
                  mt={2}
                  p={3}
                  bg="green.100"
                  borderRadius="md"
                  textAlign="center"
                  borderWidth={1}
                  borderColor="green.300"
                >
                  <Text
                    fontSize="sm"
                    color="green.700"
                    mb={1}
                  >
                    Código de convite gerado:
                  </Text>
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    color="green.800"
                  >
                    {convite}
                  </Text>
                  <Text
                    fontSize="xs"
                    color="green.600"
                    mt={1}
                  >
                    Compartilhe este código com novos membros
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Modal para atribuir/alterar cargo */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{membroSelecionado?.cargo ? 'Alterar Cargo' : 'Atribuir Cargo'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack
              spacing={4}
              align="stretch"
            >
              <Box>
                <Text fontWeight="bold">Funcionário:</Text>
                <Text>{membroSelecionado?.nome}</Text>
              </Box>

              <Box>
                <Text
                  fontWeight="bold"
                  mb={2}
                >
                  Cargo:
                </Text>
                <Select
                  value={cargoSelecionado}
                  onChange={(e) => setCargoSelecionado(e.target.value)}
                  placeholder="Selecione um cargo"
                >
                  {CARGOS_DISPONIVEIS.map((cargo) => (
                    <option
                      key={cargo}
                      value={cargo}
                    >
                      {cargo}
                    </option>
                  ))}
                </Select>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleAtualizarCargo}
              isLoading={loadingCargo}
              isDisabled={!cargoSelecionado}
            >
              {membroSelecionado?.cargo ? 'Alterar' : 'Atribuir'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
