import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase'
import { useToast } from '@chakra-ui/react'
import { Documento, DocumentoFormData } from '../types/index'
import { atualizarDocumento, carregarDocumentoAction, publicarDocumentoAction } from '@/action/documento'

export function useDocumentoEdicao() {
  const [user, loadingUser] = useAuthState(auth)
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()

  const [documento, setDocumento] = useState<Documento | null>(null)
  const [loadingDoc, setLoadingDoc] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<DocumentoFormData>({
    titulo: '',
    descricao: '',
    conteudo: '',
    status: 'rascunho',
  })

  useEffect(() => {
    if (!loadingUser && !user) {
      router.push('/user/login')
      return
    }

    const slug = searchParams.get('slug')
    if (user && slug) {
      fetchDocumento(slug, user.uid)
    }
  }, [user, loadingUser, searchParams, router])

  const fetchDocumento = async (slug: string, userId: string) => {
    setLoadingDoc(true)
    try {
      const doc = await carregarDocumentoAction(slug, userId)
      setDocumento(doc)
      setFormData({
        titulo: doc.titulo,
        descricao: doc.descricao,
        conteudo: doc.conteudo || '',
        status: doc.status,
      })
    } catch (error: any) {
      console.error('Erro ao carregar documento:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao carregar documento',
        status: 'error',
        duration: 3000,
      })
      router.push('/documentos')
    } finally {
      setLoadingDoc(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSalvarDocumento = async () => {
    if (!user || !documento) return

    setSaving(true)
    try {
      const updatedDoc = await atualizarDocumento(documento.id, formData, user.uid)
      setDocumento(updatedDoc)
    } catch (error: any) {
      console.error('Erro ao salvar documento:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar documento',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePublicarDocumento = async () => {
    if (!user || !documento) return

    setSaving(true)
    try {
      const updatedDoc = await publicarDocumentoAction(documento.id, user.uid, { ...formData, status: 'publicado' })
      setDocumento(updatedDoc)
      setFormData((prev) => ({ ...prev, status: 'publicado' }))
    } catch (error: any) {
      console.error('Erro ao publicar documento:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao publicar documento',
        status: 'error',
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  return {
    user,
    loadingUser,
    documento,
    loadingDoc,
    saving,
    formData,
    handleFormChange,
    handleSalvarDocumento,
    handlePublicarDocumento,
    router,
  }
}
