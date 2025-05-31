'use client'

import { Flex, Box, Text, Button } from '@chakra-ui/react'
import Link from 'next/link'
import { FaRegCircleUser } from 'react-icons/fa6'
import { User } from 'firebase/auth'
import { FaSignOutAlt } from 'react-icons/fa'

interface HeaderProps {
  user: User | null
  onLogout: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <Flex
      bg="gray.500"
      h={20}
      align="center"
    >
      <Box
        mx="auto"
        textAlign="center"
        w="100%"
      >
        {user ? (
          <Flex
            justify="space-between"
            align="center"
            maxW="1140px"
            mx="auto"
          >
            <Link href="/">
              <Text
                fontSize="xl"
                color="white"
              >
                HelpDocs
              </Text>
            </Link>
            <Flex
              align="center"
              gap={4}
            >
              <Text
                color="white"
                fontWeight="bold"
              >
                Olá, {user.displayName || user.email}
              </Text>
              <Button
                size="sm"
                bg="red.600"
                _hover={{ bg: 'red.500' }}
                color="white"
                onClick={onLogout}
              >
                <FaSignOutAlt />
              </Button>
            </Flex>
          </Flex>
        ) : (
          <Text
            fontSize="2xl"
            color="white"
          >
            HelpDocs
          </Text>
        )}
      </Box>
    </Flex>
  )
}
