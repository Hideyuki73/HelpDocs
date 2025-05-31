'use client'

import { Box, Stack } from '@chakra-ui/react'
import { useState } from 'react'
import FormLogin from './components/form/FormLogin'
import FormRegistro from './components/form/FormRegistro'
import { createUserWithEmailAndPassword, auth } from '../config/firebase'

const handleRegistro = async (values: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.senha)

    const user = userCredential.user
    console.log('Usuário registrado:', user)
  } catch (error: any) {
    console.error('Erro ao registrar:', error.message)
  }
}

export default function Page() {
  const [possuiConta, setPossuiConta] = useState(true)

  const handleLogin = (values: any) => {
    console.log('Login:', values)
  }

  return (
    <Box
      p={8}
      backgroundColor={'gray.500'}
      alignSelf={'center'}
      width={'30%'}
      mt={'5%'}
    >
      <Stack alignItems={'center'}>
        {possuiConta ? (
          <FormLogin trocarTela={() => setPossuiConta(false)} />
        ) : (
          <FormRegistro trocarTela={() => setPossuiConta(true)} />
        )}
      </Stack>
    </Box>
  )
}
