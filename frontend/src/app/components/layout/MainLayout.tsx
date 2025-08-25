'use client'

import { Stack, Center, Spinner } from '@chakra-ui/react'
import { ReactNode, useEffect, useState } from 'react'
import { Header } from './Header'
import { onAuthStateChanged, User, signOut } from 'firebase/auth'
import { auth } from '../../../config/firebase'
import { usePathname, useRouter } from 'next/navigation'
import { EmpresaParams } from '@/action/empresa'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Monitor auth state
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)

      const isProtected = pathname?.startsWith('/user') && pathname !== '/user/login' && pathname !== '/user/register'

      if (!u && isProtected) {
        router.replace('/user/login')
      }
    })
    return unsubscribe
  }, [router])

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return (
    <Stack minH="100vh">
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
