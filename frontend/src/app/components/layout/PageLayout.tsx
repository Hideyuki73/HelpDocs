import { Container, ContainerProps, Heading, Stack } from '@chakra-ui/react'

export function PageLayout({ title, children, ...rest }: ContainerProps) {
  return (
    <Container
      maxW="110ch"
      {...rest}
    >
      <Stack>
        <Heading>{title}</Heading>
      </Stack>
      {children}
    </Container>
  )
}
