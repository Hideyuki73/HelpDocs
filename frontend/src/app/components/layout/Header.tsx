'use client'

import { Flex, Text, Button, MenuItem, MenuList, Avatar, MenuButton, Menu, Grid, GridItem } from '@chakra-ui/react'
import Link from 'next/link'
import { User } from 'firebase/auth'
import { FaSignOutAlt } from 'react-icons/fa'
import { useRouter } from 'next/navigation'
import { getMinhaEmpresa } from '@/action/empresa'

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
        router.push('/empresa/register')
      }
    } catch (err) {
      // se não encontrou, redireciona para register
      router.push('/empresa/register')
    }
  }

  return (
    <Flex
      bg="gray.500"
      h={20}
    >
      {user?.displayName ? (
        <Grid
          maxW="1140px"
          mx={'auto'}
          alignItems={'center'}
          templateColumns="repeat(18, 1fr)"
          gap={3}
        >
          <GridItem colSpan={4}>
            <Link href="/">
              <Text
                fontSize="xl"
                color="white"
              >
                HelpDocs
              </Text>
            </Link>
          </GridItem>

          <GridItem colSpan={4}>
            <Button
              bg={'none'}
              onClick={handleEmpresaClick}
            >
              Empresa
            </Button>
          </GridItem>

          <GridItem colSpan={4}>
            <Button bg={'none'}>
              <Link href={'/empresa/register'}>Equipes</Link>
            </Button>
          </GridItem>
          <GridItem colSpan={4}>
            <Button bg={'none'}>Documentação</Button>
          </GridItem>
          <GridItem colSpan={2}>
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                display="flex"
                alignItems="center"
                gap={2}
                _hover={{ bg: 'none' }}
              >
                <Avatar
                  size="sm"
                  name={user.displayName.charAt(0)}
                />
              </MenuButton>

              <MenuList>
                <MenuItem>
                  <Text fontWeight="bold">{user.displayName}</Text>
                </MenuItem>

                <MenuItem
                  onClick={onLogout}
                  color="red.500"
                  _hover={{ bg: 'red.50' }}
                  alignItems={'center'}
                  justifyItems={'center'}
                  gap={2}
                >
                  Sair
                  <FaSignOutAlt />
                </MenuItem>
              </MenuList>
            </Menu>
          </GridItem>
        </Grid>
      ) : (
        <Text
          fontSize="2xl"
          color="white"
        >
          HelpDocs
        </Text>
      )}
    </Flex>
  )
}
