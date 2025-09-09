export interface Usuario {
  uid(id: string, uid: any): void
  id: string
  nome: string
  email: string
  cargo?: string
  empresaId?: string
}

export interface LoginFormData {
  email: string
  senha: string
}

export interface RegisterFormData {
  nome: string
  email: string
  senha: string
}

export interface AuthState {
  user: Usuario | null
  loading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: (email: string, senha: string) => Promise<void>
  register: (nome: string, email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  refreshUserData: () => Promise<void>
}

// Tipos para dados do funcionário vindos do backend
export interface FuncionarioBackend {
  id: string
  nome: string
  email: string
  cargo?: string
  empresaId?: string
  createdAt?: string
  updatedAt?: string
}
