import { useState } from 'react'
import { useToast } from '@chakra-ui/react'
import { gerarConvite, deleteEmpresa } from '@/action/empresa'
import { updateCargoFuncionario, expulsarFuncionario } from '@/action/funcionario'

interface Membro {
  id: string
  nome?: string
  email?: string
  cargo?: string
}

export function useEmpresaActions() {
  const [convite, setConvite] = useState<string | null>(null)
  const [loadingCargo, setLoadingCargo] = useState(false)
  const [loadingExpulsao, setLoadingExpulsao] = useState(false)
  const [loadingDeleteEmpresa, setLoadingDeleteEmpresa] = useState(false)
  const toast = useToast()

  const handleGerarConvite = async (empresaId: string) => {
    if (!empresaId) return
    try {
      const { codigo } = await gerarConvite(empresaId)
      setConvite(codigo)
    } catch (error) {
      console.error('Erro ao gerar convite:', error)
      toast({
        title: 'Erro ao gerar convite',
        description: 'Não foi possível gerar o código de convite',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleAtualizarCargo = async (
    membroSelecionado: Membro | null,
    cargoSelecionado: string,
    setMembros: React.Dispatch<React.SetStateAction<Membro[]>>,
    onClose: () => void
  ) => {
    if (!membroSelecionado || !cargoSelecionado) return

    setLoadingCargo(true)
    try {
      await updateCargoFuncionario(membroSelecionado.id, cargoSelecionado)

      // Atualizar a lista de membros
      setMembros((prev) =>
        prev.map((membro) => 
          membro.id === membroSelecionado.id 
            ? { ...membro, cargo: cargoSelecionado } 
            : membro
        )
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

  const handleExpulsarFuncionario = async (
    membroParaExpulsar: Membro | null,
    empresaId: string,
    setMembros: React.Dispatch<React.SetStateAction<Membro[]>>,
    onClose: () => void
  ) => {
    if (!membroParaExpulsar || !empresaId) return
    
    setLoadingExpulsao(true)
    try {
      await expulsarFuncionario(membroParaExpulsar.id, empresaId)
      
      // Remover membro da lista
      setMembros(prev => prev.filter(membro => membro.id !== membroParaExpulsar.id))
      
      toast({
        title: 'Funcionário expulso',
        description: `${membroParaExpulsar.nome} foi removido da empresa`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      onClose()
    } catch (error: any) {
      console.error('Erro ao expulsar funcionário:', error)
      toast({
        title: 'Erro ao expulsar funcionário',
        description: error.response?.data?.message || 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoadingExpulsao(false)
    }
  }

  const handleDeleteEmpresa = async (
    empresaId: string,
    onClose: () => void
  ) => {
    if (!empresaId) return
    
    setLoadingDeleteEmpresa(true)
    try {
      await deleteEmpresa(empresaId)
      
      toast({
        title: 'Empresa deletada',
        description: 'A empresa foi deletada com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      // Redirecionar ou recarregar a página
      window.location.href = '/empresa-selection'
      
    } catch (error: any) {
      console.error('Erro ao deletar empresa:', error)
      toast({
        title: 'Erro ao deletar empresa',
        description: error.response?.data?.message || 'Erro desconhecido',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoadingDeleteEmpresa(false)
      onClose()
    }
  }

  return {
    convite,
    loadingCargo,
    loadingExpulsao,
    loadingDeleteEmpresa,
    handleGerarConvite,
    handleAtualizarCargo,
    handleExpulsarFuncionario,
    handleDeleteEmpresa
  }
}

