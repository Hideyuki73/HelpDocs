'use client'

import { useAuth } from '../hooks/useAuth'
import RegisterForm from '../components/RegisterForm'
import AuthLayout from '../components/AuthLayout'
import { RegisterFormData } from '../types'

export default function RegisterPage() {
  const { register, loading, error } = useAuth()

  const handleRegister = async (values: RegisterFormData) => {
    await register(values.nome, values.email, values.senha)
  }

  return (
    <AuthLayout
      title="Criar Conta"
      subtitle="Preencha os dados abaixo para começar a usar o HelpDocs"
      showLoginLink={true}
    >
      <RegisterForm 
        onSubmit={handleRegister}
        isLoading={loading}
        error={error}
      />
    </AuthLayout>
  )
}

