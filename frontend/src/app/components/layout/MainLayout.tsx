'use client'

import { Stack, Center, Spinner } from '@chakra-ui/react'
import { ReactNode, useEffect, useState } from 'react'
import { Header } from './Header'
import { onAuthStateChanged, User, signOut } from 'firebase/auth'
import { auth } from '../../../config/firebase'
import { usePathname, useRouter } from 'next/navigation'
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

      const publicRoutes = ['/', '/user/login', '/user/register']
      const isProtected = !publicRoutes.includes(pathname ?? '')

      // Se não está logado e tentou acessar rota protegida
      if (!u && isProtected) {
        router.replace('/user/login')
        return
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
