'use client'

import { Flex, Text, Button, MenuItem, MenuList, MenuButton, Menu, HStack, Spacer } from '@chakra-ui/react'
import Link from 'next/link'
import { User } from 'firebase/auth'
import { FaSignOutAlt } from 'react-icons/fa'
import { redirect, useRouter } from 'next/navigation'
import { getMinhaEmpresa } from '@/action/empresa'
import { HiOutlineMenuAlt3 } from 'react-icons/hi'

interface HeaderProps {
  user: User | null
  onLogout: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  const router = useRouter()

  const handleEmpresaClick = async () => {
    try {
      const empresa = await getMinhaEmpresa()
      if (empresa) {
        router.push('/empresa')
      } else {
        router.push('/empresa-selection')
      }
    } catch (err) {
      router.push('/empresa-selection')
    }
  }

  return (
    <Flex
      as="header"
      bgGradient="linear(to-r, blue.600, blue.800)"
      color="white"
      h={20}
      px={10}
      align="center"
      shadow="md"
    >
      {/* Logo */}
      <Link href={user ? '/home' : '/'}>
        <Text
          fontSize="2xl"
          fontWeight="bold"
        >
          HelpDocs
        </Text>
      </Link>

      <Spacer />

      {user?.displayName && (
        <HStack spacing={8}>
          <Button
            variant="ghost"
            color="white"
            fontSize="lg"
            _hover={{ color: 'yellow.300' }}
            onClick={handleEmpresaClick}
          >
            EMPRESA
          </Button>

          <Button
            variant="ghost"
            color="white"
            fontSize="lg"
            _hover={{ color: 'yellow.300' }}
            as={Link}
            href="/equipes"
          >
            EQUIPES
          </Button>

          <Button
            variant="ghost"
            color="white"
            fontSize="lg"
            _hover={{ color: 'yellow.300' }}
          >
            DOCUMENTAÇÃO
          </Button>

          {/* Menu do usuário */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              color="white"
              _hover={{ bg: 'blue.700' }}
              _active={{ bg: 'blue.900' }}
            >
              <HiOutlineMenuAlt3 size={22} />
            </MenuButton>
            <MenuList bgColor={'blue.700'}>
              <MenuItem
                onClick={() => redirect('/user')}
                bgColor={'blue.700'}
                _hover={{ bg: 'blue.500' }}
              >
                <Text fontWeight="bold">{user.displayName}</Text>
              </MenuItem>
              <MenuItem
                bgColor={'blue.700'}
                onClick={onLogout}
                color="red.500"
                _hover={{ bg: 'red.300' }}
                gap={2}
              >
                Sair
                <FaSignOutAlt />
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      )}
    </Flex>
  )
}
