import { useState, useEffect } from 'react'
import { getMinhaEmpresa } from '@/action/empresa'
import { getFuncionarios } from '@/action/funcionario'
import { getUsuarioLogado, UsuarioLogado } from '@/action/auth'

interface Membro {
  id: string
  nome?: string
  email?: string
  cargo?: string
}

export function useEmpresaData() {
  const [empresa, setEmpresa] = useState<any>(null)
  const [membros, setMembros] = useState<Membro[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMembros, setLoadingMembros] = useState(false)
  const [usuarioLogado, setUsuarioLogado] = useState<UsuarioLogado | null>(null)

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

  return {
    empresa,
    membros,
    setMembros,
    loading,
    loadingMembros,
    usuarioLogado
  }
}

