'use client'

import { useState } from 'react'
import { Spinner, Center } from '@chakra-ui/react'
import { useDocumentoEdicao } from './hooks/useDocumentoEdicao'
import { DocumentoUploadViewer } from './components/DocumentosUploadViewer'
import { DocumentoEditor } from './components/DocumentoEditor'

export default function EditarDocumentoPage() {
  const {
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
  } = useDocumentoEdicao()

  const [showChat, setShowChat] = useState(false)

  if (loadingUser || loadingDoc) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  if (!documento) {
    return null
  }

  if (documento.tipo === 'upload') {
    return (
      <DocumentoUploadViewer
        documento={documento}
        onVoltar={() => router.push('/documentos')}
      />
    )
  }

  return (
    <DocumentoEditor
      documento={documento}
      formData={formData}
      saving={saving}
      showChat={showChat}
      user={user}
      onFormChange={handleFormChange}
      onSalvar={handleSalvarDocumento}
      onPublicar={handlePublicarDocumento}
      onToggleChat={() => setShowChat(!showChat)}
      onVoltar={() => router.push('/documentos')}
    />
  )
}
