'use client'

import { Box, Stack } from '@chakra-ui/react'
import FormLogin from '../../components/form/FormLogin'
import { redirect } from 'next/navigation'

export default function Page() {
  return (
    <Box
      p={8}
      backgroundColor={'gray.500'}
      alignSelf={'center'}
      width={'30%'}
      mt={'5%'}
    >
      <Stack alignItems={'center'}>
        <FormLogin />
      </Stack>
    </Box>
  )
}
