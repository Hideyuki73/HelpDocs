
'use client'

import { Box, Heading, Text } from '@chakra-ui/react';
import { useParams } from 'next/navigation';

export default function EmpresaDashboardPage() {
  const { empresaId } = useParams();

  return (
    <Box p={8}>
      <Heading>Página da Empresa (Simplificada)</Heading>
      <Text fontSize="xl">ID da Empresa: {empresaId}</Text>
      <Text>Se você está vendo esta página, a rota dinâmica está funcionando!</Text>
    </Box>
  );
}
