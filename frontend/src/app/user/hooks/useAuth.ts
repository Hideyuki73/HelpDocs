import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import { criarFuncionarioClient, FuncionarioParams, getFuncionario } from '@/action/funcionario'
import { AuthState, Usuario } from '../types'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })
  const router = useRouter()

  // Função para buscar dados do funcionário
  const fetchFuncionarioData = useCallback(async (firebaseUser: User): Promise<Usuario> => {
    try {
      const funcionarioData = await getFuncionario(firebaseUser.uid)
      return {
        id: firebaseUser.uid,
        nome: funcionarioData.nome || firebaseUser.displayName || '',
        email: funcionarioData.email || firebaseUser.email || '',
        cargo: funcionarioData.cargo || undefined,
        empresaId: funcionarioData.empresaId || undefined,
      }
    } catch (error) {
      console.log('Erro ao buscar dados do funcionário:', error)
      // Fallback para dados básicos do Firebase se não conseguir buscar do backend
      return {
        id: firebaseUser.uid,
        nome: firebaseUser.displayName || '',
        email: firebaseUser.email || '',
        cargo: undefined,
        empresaId: undefined,
      }
    }
  }, [])

  // Função para atualizar dados do usuário (útil após mudanças de cargo/empresa)
  const refreshUserData = useCallback(async () => {
    const firebaseUser = auth.currentUser
    if (firebaseUser) {
      setAuthState((prev) => ({ ...prev, loading: true }))
      try {
        const userData = await fetchFuncionarioData(firebaseUser)
        setAuthState((prev) => ({ ...prev, user: userData, loading: false }))
      } catch (error) {
        console.log('Erro ao atualizar dados do usuário:', error)
        setAuthState((prev) => ({ ...prev, loading: false, error: 'Erro ao atualizar perfil do usuário.' }))
      }
    }
  }, [fetchFuncionarioData])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          const userData = await fetchFuncionarioData(firebaseUser)
          setAuthState((prev) => ({ ...prev, user: userData, loading: false }))
        } catch (error) {
          console.log('Erro ao buscar dados do funcionário:', error)
          setAuthState((prev) => ({
            ...prev,
            user: null,
            loading: false,
            error: 'Erro ao carregar perfil do usuário.',
          }))
        }
      } else {
        setAuthState((prev) => ({ ...prev, user: null, loading: false }))
      }
    })

    return () => unsubscribe()
  }, [fetchFuncionarioData])

  const login = async (email: string, senha: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await setPersistence(auth, browserLocalPersistence)
      const cred = await signInWithEmailAndPassword(auth, email, senha)
      const firebaseUser = cred.user

      // Após o login Firebase, busca os dados completos do funcionário
      const userData = await fetchFuncionarioData(firebaseUser)
      setAuthState((prev) => ({ ...prev, user: userData, loading: false }))

      console.log('Login bem-sucedido:', firebaseUser.uid)
      router.push('/home')
    } catch (error: any) {
      console.log('Erro de login:', error.message)
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: 'E-mail ou senha inválidos',
      }))
      throw error
    }
  }

  const register = async (nome: string, email: string, senha: string) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await setPersistence(auth, browserLocalPersistence)
      const cred = await createUserWithEmailAndPassword(auth, email, senha)
      const firebaseUser = cred.user
      await updateProfile(firebaseUser, { displayName: nome })

      const account: FuncionarioParams = {
        nome,
        email,
      }
      const token = await firebaseUser.getIdToken()
      const response = await criarFuncionarioClient(account, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Após o registro Firebase e criação do funcionário no backend, busca os dados completos
      const userData = await fetchFuncionarioData(firebaseUser)
      setAuthState((prev) => ({ ...prev, user: userData, loading: false }))

      if (response) {
        router.push('/home')
      }
    } catch (error: any) {
      console.log('Erro ao registrar:', error.message)
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }))
      throw error
    }
  }

  const logout = async () => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      await signOut(auth)
      setAuthState((prev) => ({ ...prev, user: null, loading: false }))
      router.push('/')
    } catch (error: any) {
      console.log('Erro ao fazer logout:', error.message)
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }))
    }
  }

  const clearError = () => {
    setAuthState((prev) => ({ ...prev, error: null }))
  }

  return {
    ...authState,
    login,
    register,
    logout,
    clearError,
    refreshUserData, // Função adicional para atualizar dados do usuário
  }
}
