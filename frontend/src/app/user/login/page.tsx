'use client'

import { useAuth } from '../hooks/useAuth'
import LoginForm from '../components/LoginForm'
import AuthLayout from '../components/AuthLayout'
import { LoginFormData } from '../types'

export default function LoginPage() {
  const { login, loading, error } = useAuth()

  const handleLogin = async (values: LoginFormData) => {
    await login(values.email, values.senha)
  }

  return (
    <AuthLayout
      title="Bem-vindo de volta!"
      subtitle="Faça login para acessar sua conta no HelpDocs"
      showRegisterLink={true}
    >
      <LoginForm 
        onSubmit={handleLogin}
        isLoading={loading}
        error={error}
      />
    </AuthLayout>
  )
}

