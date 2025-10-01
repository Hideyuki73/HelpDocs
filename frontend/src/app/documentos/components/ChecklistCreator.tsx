'use client'

import { Box, VStack, HStack, Text, Button, Input, IconButton, Badge, Divider, Tooltip } from '@chakra-ui/react'
import { useState } from 'react'
import { FaPlus, FaTrash, FaListUl } from 'react-icons/fa'

interface ChecklistItem {
  id: string
  descricao: string
  concluido: boolean
}

interface ChecklistCreatorProps {
  onChecklistChange: (checklist: ChecklistItem[]) => void
  initialChecklist?: ChecklistItem[]
}

export function ChecklistCreator({ onChecklistChange, initialChecklist = [] }: ChecklistCreatorProps) {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist)
  const [novoItem, setNovoItem] = useState('')

  const adicionarItem = () => {
    if (!novoItem.trim()) return

    const novoItemObj: ChecklistItem = {
      id: Date.now().toString(),
      descricao: novoItem.trim(),
      concluido: false,
    }

    const novaChecklist = [...checklist, novoItemObj]
    setChecklist(novaChecklist)
    onChecklistChange(novaChecklist)
    setNovoItem('')
  }

  const removerItem = (id: string) => {
    const novaChecklist = checklist.filter((item) => item.id !== id)
    setChecklist(novaChecklist)
    onChecklistChange(novaChecklist)
  }

  return (
    <Box>
      <VStack
        spacing={3}
        align="stretch"
      >
        {/* Header */}
        <HStack>
          <FaListUl color="blue" />
          <Text
            fontSize="sm"
            fontWeight="medium"
            color="gray.700"
          >
            Objetivos do Documento
          </Text>
          {checklist.length > 0 && (
            <Badge
              colorScheme="blue"
              size="sm"
            >
              {checklist.length} {checklist.length === 1 ? 'objetivo' : 'objetivos'}
            </Badge>
          )}
        </HStack>

        {/* Adicionar novo item */}
        <HStack>
          <Input
            placeholder="Ex: Revisar introdução, Adicionar referências..."
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
            isDisabled={!novoItem.trim()}
          >
            Adicionar
          </Button>
        </HStack>

        {/* Lista de itens */}
        {checklist.length > 0 && (
          <Box
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
            p={3}
            bg="gray.50"
          >
            <VStack
              spacing={2}
              align="stretch"
            >
              {checklist.map((item, index) => (
                <Box key={item.id}>
                  <HStack justify="space-between">
                    <Text
                      fontSize="sm"
                      flex={1}
                    >
                      {item.descricao}
                    </Text>
                    <Tooltip label="Remover objetivo">
                      <IconButton
                        aria-label="Remover"
                        icon={<FaTrash />}
                        onClick={() => removerItem(item.id)}
                        variant="ghost"
                        size="xs"
                        colorScheme="red"
                      />
                    </Tooltip>
                  </HStack>
                  {index < checklist.length - 1 && <Divider />}
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {checklist.length === 0 && (
          <Box
            textAlign="center"
            py={4}
            color="gray.500"
          >
            <Text fontSize="sm">Adicione objetivos para acompanhar o progresso do documento</Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
