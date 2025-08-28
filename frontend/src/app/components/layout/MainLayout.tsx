// Conteúdo completo de MainLayout.tsx
// Certifique-se de que este é o conteúdo EXATO do seu arquivo

'use client'

import { Stack, Center, Spinner } from '@chakra-ui/react'
import { ReactNode, useEffect, useState } from 'react'
import { Header } from './Header'
import { onAuthStateChanged, User, signOut } from 'firebase/auth'
import { auth } from '../../../config/firebase'
import { usePathname, useRouter } from 'next/navigation'
import { getMinhaEmpresa } from '@/action/empresa'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      setLoading(false)
      console.log('Auth state changed. User:', u, 'Pathname:', pathname)

      const isProtected = pathname?.startsWith('/user') && pathname !== '/user/login' && pathname !== '/user/register'
      const isEmpresaSelectionPage = pathname === '/empresa-selection'

      if (!u && isProtected) {
        router.replace('/user/login')
      } else if (u && !isEmpresaSelectionPage) {
        //   // Se o usuário está logado e não está na página de seleção de empresa
        //   try {
        const empresa = await getMinhaEmpresa()
        if (!empresa) {
          // Se não está em nenhuma empresa, redireciona para a página de seleção
          router.replace('/empresa-selection')
        }
        //   } catch (error) {
        //     console.error("Erro ao verificar empresa no MainLayout:", error)
        //     // Se houver erro ao buscar empresa (ex: não existe), redireciona para seleção
        //     router.replace("/empresa-selection")
        //   }
      }
    })
    return unsubscribe
  }, [router, pathname])

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Stack
      minH="100vh"
      bgGradient="linear(to-b, gray.100, gray.300, gray.400)"
    >
      <Header
        user={user}
        onLogout={() => {
          signOut(auth)
          router.push('/')
        }}
      />
      {children}
    </Stack>
  )
}
