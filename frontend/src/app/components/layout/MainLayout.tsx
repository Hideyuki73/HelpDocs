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

const protectedRoutes = ['/user']

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

      const isProtected = protectedRoutes.some((route) => pathname?.startsWith(route))
      if (!u && isProtected) {
        router.replace('/login')
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
          router.push('/login')
        }}
      />
      {children}
    </Stack>
  )
}
