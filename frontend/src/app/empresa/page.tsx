'use client'

import { useState } from 'react'
import { Box, Heading, Spinner, Text, SimpleGrid, Button, useDisclosure } from '@chakra-ui/react'
import { isAdmin } from '@/action/auth'
import { Membro } from './types'
import { useEmpresaData } from './hooks/useEmpresaData'
import { useEmpresaActions } from './hooks/useEmpresaActions'
import MembrosSection from './components/MembrosSection'
import ModalCargo from './components/ModalCargo'
import ModalExpulsar from './components/ModalExpulsar'
import ModalDeleteEmpresa from './components/ModalDeleteEmpresa'
import EmpresaInfo from './components/EmpresaInfo'
import ModalSairEmpresa from './components/ModalSairEmpresa'
import { redirect } from 'next/navigation'

export default function EmpresaPage() {
  // Estados locais
  const [membroSelecionado, setMembroSelecionado] = useState<Membro | null>(null)
  const [cargoSelecionado, setCargoSelecionado] = useState('')
  const [membroParaExpulsar, setMembroParaExpulsar] = useState<Membro | null>(null)

  // Hooks customizados
  const { empresa, membros, setMembros, loading, loadingMembros, usuarioLogado } = useEmpresaData()
  const {
    convite,
    loadingCargo,
    loadingExpulsao,
    loadingDeleteEmpresa,
    loadingSair,
    handleGerarConvite,
    handleAtualizarCargo,
    handleExpulsarFuncionario,
    handleDeleteEmpresa,
    handleSairDaEmpresa,
  } = useEmpresaActions()

  // Modais
  const { isOpen: isOpenCargo, onOpen: onOpenCargo, onClose: onCloseCargo } = useDisclosure()
  const { isOpen: isOpenExpulsar, onOpen: onOpenExpulsar, onClose: onCloseExpulsar } = useDisclosure()
  const { isOpen: isOpenDeleteEmpresa, onOpen: onOpenDeleteEmpresa, onClose: onCloseDeleteEmpresa } = useDisclosure()
  const { isOpen: isOpenSair, onOpen: onOpenSair, onClose: onCloseSair } = useDisclosure()

  // Handlers
  const handleAbrirModalCargo = (membro: Membro) => {
    setMembroSelecionado(membro)
    setCargoSelecionado(membro.cargo || '')
    onOpenCargo()
  }

  const handleAbrirModalExpulsar = (membro: Membro) => {
    setMembroParaExpulsar(membro)
    onOpenExpulsar()
  }

  const onGerarConvite = () => {
    if (empresa?.id) {
      handleGerarConvite(empresa.id)
    }
  }

  const onSairDaEmpresa = () => {
    if (empresa?.id) {
      handleSairDaEmpresa(empresa.id, onCloseSair) // função que você cria em useEmpresaActions
    }
  }

  const onAtualizarCargo = () => {
    handleAtualizarCargo(membroSelecionado, cargoSelecionado, setMembros, onCloseCargo)
  }

  const onExpulsarFuncionario = () => {
    if (empresa?.id) {
      handleExpulsarFuncionario(membroParaExpulsar, empresa.id, setMembros, onCloseExpulsar)
    }
  }

  const onDeleteEmpresa = () => {
    if (empresa?.id) {
      handleDeleteEmpresa(empresa.id, onCloseDeleteEmpresa)
    }
  }

  // Estados de loading e erro
  if (loading) {
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
  }

  if (!empresa) {
    redirect('/empresa-selection')
    return (
      <Text
        textAlign="center"
        mt={10}
      >
        Nenhuma empresa associada.
      </Text>
    )
  }

  const isUserAdmin = isAdmin(usuarioLogado)

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
          <EmpresaInfo empresa={empresa} />

          <MembrosSection
            membros={membros}
            loadingMembros={loadingMembros}
            usuarioLogado={usuarioLogado}
            isAdmin={isUserAdmin}
            convite={convite}
            onAbrirModalCargo={handleAbrirModalCargo}
            onAbrirModalExpulsar={handleAbrirModalExpulsar}
            onGerarConvite={onGerarConvite}
          />
        </SimpleGrid>

        <Box
          mt={8}
          textAlign="center"
          display="flex"
          justifyContent="center"
          gap={4}
        >
          {isUserAdmin && (
            <Button
              colorScheme="red"
              variant="outline"
              onClick={onOpenDeleteEmpresa}
              size="lg"
            >
              Deletar Empresa
            </Button>
          )}

          <Button
            colorScheme="red"
            variant="outline"
            onClick={onOpenSair}
            size="lg"
          >
            Sair da Empresa
          </Button>
        </Box>
      </Box>

      {/* Modais */}
      <ModalCargo
        isOpen={isOpenCargo}
        onClose={onCloseCargo}
        membroSelecionado={membroSelecionado}
        cargoSelecionado={cargoSelecionado}
        setCargoSelecionado={setCargoSelecionado}
        onAtualizarCargo={onAtualizarCargo}
        loadingCargo={loadingCargo}
      />

      <ModalExpulsar
        isOpen={isOpenExpulsar}
        onClose={onCloseExpulsar}
        membroParaExpulsar={membroParaExpulsar}
        onExpulsarFuncionario={onExpulsarFuncionario}
        loadingExpulsao={loadingExpulsao}
      />

      <ModalSairEmpresa
        isOpen={isOpenSair}
        onClose={onCloseSair}
        onSair={onSairDaEmpresa}
        loadingSair={loadingSair}
        nomeEmpresa={empresa?.nome}
      />

      <ModalDeleteEmpresa
        isOpen={isOpenDeleteEmpresa}
        onClose={onCloseDeleteEmpresa}
        empresa={empresa}
        onDeleteEmpresa={onDeleteEmpresa}
        loadingDeleteEmpresa={loadingDeleteEmpresa}
      />
    </>
  )
}
