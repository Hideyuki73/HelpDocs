import * as React from 'react'
import { ChakraProvider } from '@chakra-ui/react'

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <ChakraProvider>{children}</ChakraProvider>
      </body>
    </html>
  )
}
