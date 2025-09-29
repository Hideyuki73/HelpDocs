import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/config/firebase'
import { useToast } from '@chakra-ui/react'
import { Documento, DocumentoFormData } from '../types/index'
import { atualizarDocumento, carregarDocumentoAction, publicarDocumentoAction } from '@/action/documento'

export function useDocumentoEdicao() {
  const [user, loadingUser] = useAuthState(auth)
  const router = useRouter()
  const params = useParams()
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

    if (user && params.slug) {
      fetchDocumento(params.slug as string, user.uid)
    }
  }, [user, loadingUser, params.slug, router])

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
      toast({
        title: 'Sucesso',
        description: 'Documento salvo com sucesso',
        status: 'success',
        duration: 3000,
      })
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
      toast({
        title: 'Sucesso',
        description: 'Documento publicado com sucesso',
        status: 'success',
        duration: 3000,
      })
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
