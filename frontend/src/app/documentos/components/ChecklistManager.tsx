'use client'

import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Checkbox,
  IconButton,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Divider,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Progress,
  Flex,
  Spacer,
  Tooltip,
} from '@chakra-ui/react'
import { useState, useRef } from 'react'
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaCheckCircle, FaListUl, FaPercent } from 'react-icons/fa'
import { ChecklistItem } from '../[slug]/editar/types'
import { atualizarChecklistDocumento } from '@/action/documento'

interface ChecklistManagerProps {
  documentoId: string
  usuarioId: string
  checklist: ChecklistItem[]
  onChecklistUpdate: (novaChecklist: ChecklistItem[]) => void
  readOnly?: boolean
}

export function ChecklistManager({
  documentoId,
  usuarioId,
  checklist = [],
  onChecklistUpdate,
  readOnly = false,
}: ChecklistManagerProps) {
  const [localChecklist, setLocalChecklist] = useState<ChecklistItem[]>(checklist)
  const [novoItem, setNovoItem] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [textoEdicao, setTextoEdicao] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [itemParaDeletar, setItemParaDeletar] = useState<string | null>(null)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const toast = useToast()

  // Calcular progresso
  const totalItens = localChecklist.length
  const itensConcluidos = localChecklist.filter((item) => item.concluido).length
  const progresso = totalItens > 0 ? Math.round((itensConcluidos / totalItens) * 100) : 0

  const salvarChecklist = async (novaChecklist: ChecklistItem[]) => {
    if (readOnly) return

    setSalvando(true)
    try {
      await atualizarChecklistDocumento(documentoId, novaChecklist, usuarioId)
      onChecklistUpdate(novaChecklist)
      toast({
        title: 'Checklist atualizada!',
        description: 'As alterações foram salvas com sucesso.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as alterações na checklist.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
      console.error('Erro ao salvar checklist:', error)
    } finally {
      setSalvando(false)
    }
  }

  const adicionarItem = async () => {
    if (!novoItem.trim()) return

    const novoItemObj: ChecklistItem = {
      id: Date.now().toString(),
      descricao: novoItem.trim(),
      concluido: false,
    }

    const novaChecklist = [...localChecklist, novoItemObj]
    setLocalChecklist(novaChecklist)
    setNovoItem('')
    await salvarChecklist(novaChecklist)
  }

  const toggleItem = async (id: string) => {
    const novaChecklist = localChecklist.map((item) =>
      item.id === id ? { ...item, concluido: !item.concluido } : item,
    )
    setLocalChecklist(novaChecklist)
    await salvarChecklist(novaChecklist)
  }

  const iniciarEdicao = (item: ChecklistItem) => {
    setEditandoId(item.id)
    setTextoEdicao(item.descricao)
  }

  const salvarEdicao = async () => {
    if (!textoEdicao.trim() || !editandoId) return

    const novaChecklist = localChecklist.map((item) =>
      item.id === editandoId ? { ...item, descricao: textoEdicao.trim() } : item,
    )
    setLocalChecklist(novaChecklist)
    setEditandoId(null)
    setTextoEdicao('')
    await salvarChecklist(novaChecklist)
  }

  const cancelarEdicao = () => {
    setEditandoId(null)
    setTextoEdicao('')
  }

  const confirmarDelecao = (id: string) => {
    setItemParaDeletar(id)
    onOpen()
  }

  const deletarItem = async () => {
    if (!itemParaDeletar) return

    const novaChecklist = localChecklist.filter((item) => item.id !== itemParaDeletar)
    setLocalChecklist(novaChecklist)
    setItemParaDeletar(null)
    onClose()
    await salvarChecklist(novaChecklist)
  }

  return (
    <>
      <Card>
        <CardHeader pb={2}>
          <Flex align="center">
            <HStack>
              <FaListUl color="blue" />
              <Heading size="md">Checklist do Documento</Heading>
            </HStack>
            <Spacer />
            <HStack>
              <Badge
                colorScheme="blue"
                variant="outline"
              >
                {itensConcluidos}/{totalItens}
              </Badge>
              <Tooltip label={`${progresso}% concluído`}>
                <Badge colorScheme={progresso === 100 ? 'green' : 'blue'}>
                  <HStack spacing={1}>
                    <FaPercent size="10px" />
                    <Text>{progresso}</Text>
                  </HStack>
                </Badge>
              </Tooltip>
            </HStack>
          </Flex>

          {totalItens > 0 && (
            <Box mt={3}>
              <Progress
                value={progresso}
                colorScheme={progresso === 100 ? 'green' : 'blue'}
                size="sm"
                borderRadius="md"
              />
            </Box>
          )}
        </CardHeader>

        <CardBody pt={0}>
          <VStack
            spacing={4}
            align="stretch"
          >
            {/* Adicionar novo item */}
            {!readOnly && (
              <Box>
                <HStack>
                  <Input
                    placeholder="Digite um novo objetivo..."
                    value={novoItem}
                    onChange={(e) => setNovoItem(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && adicionarItem()}
                    size="sm"
                  />
                  <Button
                    leftIcon={<FaPlus />}
                    onClick={adicionarItem}
                    colorScheme="blue"
                    size="sm"
                    isDisabled={!novoItem.trim() || salvando}
                    isLoading={salvando}
                  >
                    Adicionar
                  </Button>
                </HStack>
              </Box>
            )}

            {/* Lista de itens */}
            {localChecklist.length === 0 ? (
              <Box
                textAlign="center"
                py={8}
                color="gray.500"
              >
                <FaListUl
                  size="24px"
                  style={{ margin: '0 auto 8px' }}
                />
                <Text>Nenhum objetivo definido ainda</Text>
                {!readOnly && <Text fontSize="sm">Adicione objetivos para acompanhar o progresso do documento</Text>}
              </Box>
            ) : (
              <VStack
                spacing={2}
                align="stretch"
              >
                {localChecklist.map((item, index) => (
                  <Box key={item.id}>
                    <HStack
                      p={3}
                      bg={item.concluido ? 'green.50' : 'gray.50'}
                      borderRadius="md"
                      border="1px solid"
                      borderColor={item.concluido ? 'green.200' : 'gray.200'}
                      _hover={{ bg: item.concluido ? 'green.100' : 'gray.100' }}
                      transition="all 0.2s"
                    >
                      <Checkbox
                        isChecked={item.concluido}
                        onChange={() => toggleItem(item.id)}
                        colorScheme="green"
                        size="lg"
                        isDisabled={readOnly}
                      />

                      {editandoId === item.id ? (
                        <HStack flex={1}>
                          <Input
                            value={textoEdicao}
                            onChange={(e) => setTextoEdicao(e.target.value)}
                            size="sm"
                            onKeyPress={(e) => e.key === 'Enter' && salvarEdicao()}
                            autoFocus
                          />
                          <IconButton
                            aria-label="Salvar"
                            icon={<FaSave />}
                            onClick={salvarEdicao}
                            colorScheme="green"
                            size="sm"
                            isDisabled={!textoEdicao.trim()}
                          />
                          <IconButton
                            aria-label="Cancelar"
                            icon={<FaTimes />}
                            onClick={cancelarEdicao}
                            colorScheme="gray"
                            size="sm"
                          />
                        </HStack>
                      ) : (
                        <>
                          <Text
                            flex={1}
                            textDecoration={item.concluido ? 'line-through' : 'none'}
                            color={item.concluido ? 'green.600' : 'gray.800'}
                            fontWeight={item.concluido ? 'normal' : 'medium'}
                          >
                            {item.descricao}
                          </Text>

                          {!readOnly && (
                            <HStack spacing={1}>
                              <Tooltip label="Editar objetivo">
                                <IconButton
                                  aria-label="Editar"
                                  icon={<FaEdit />}
                                  onClick={() => iniciarEdicao(item)}
                                  variant="ghost"
                                  size="sm"
                                  colorScheme="blue"
                                />
                              </Tooltip>
                              <Tooltip label="Remover objetivo">
                                <IconButton
                                  aria-label="Deletar"
                                  icon={<FaTrash />}
                                  onClick={() => confirmarDelecao(item.id)}
                                  variant="ghost"
                                  size="sm"
                                  colorScheme="red"
                                />
                              </Tooltip>
                            </HStack>
                          )}
                        </>
                      )}
                    </HStack>

                    {index < localChecklist.length - 1 && <Divider />}
                  </Box>
                ))}
              </VStack>
            )}

            {/* Resumo */}
            {totalItens > 0 && (
              <Box>
                <Divider mb={3} />
                <HStack
                  justify="space-between"
                  fontSize="sm"
                  color="gray.600"
                >
                  <Text>
                    <strong>{itensConcluidos}</strong> de <strong>{totalItens}</strong> objetivos concluídos
                  </Text>
                  <HStack>
                    <FaCheckCircle color={progresso === 100 ? 'green' : 'gray'} />
                    <Text
                      fontWeight="bold"
                      color={progresso === 100 ? 'green.600' : 'blue.600'}
                    >
                      {progresso}% completo
                    </Text>
                  </HStack>
                </HStack>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Dialog de confirmação de deleção */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
            >
              Remover Objetivo
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja remover este objetivo da checklist? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={deletarItem}
                ml={3}
              >
                Remover
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}
