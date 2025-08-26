import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  useToast,
  Spinner,
  Flex,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  IconButton,
} from "@chakra-ui/react";
import { FaEdit, FaSave } from "react-icons/fa"; // Ícones para editar e salvar

interface Convite {
  id: string;
  code: string;
  expiresAt: { _seconds: number; _nanoseconds: number }; // Firestore Timestamp
  isActive: boolean;
}

interface EmpresaMember {
  userId: string;
  role: string;
  // Adicione outros campos do usuário se disponíveis (nome, email, etc.)
}

export default function EmpresaDashboardPage() {
  const { id: empresaId } = useParams();
  const toast = useToast();

  const [empresaInfo, setEmpresaInfo] = useState<any>(null);
  const [loadingEmpresa, setLoadingEmpresa] = useState(true);
  const [errorEmpresa, setErrorEmpresa] = useState<string | null>(null);

  const [convites, setConvites] = useState<Convite[]>([]);
  const [loadingConvites, setLoadingConvites] = useState(true);
  const [errorConvites, setErrorConvites] = useState<string | null>(null);
  const [generatingInvite, setGeneratingInvite] = useState(false);

  const [members, setMembers] = useState<EmpresaMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errorMembers, setErrorMembers] = useState<string | null>(null);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>("");

  // Função para buscar informações da empresa (opcional, se você tiver um endpoint para isso)
  const fetchEmpresaInfo = async () => {
    if (!empresaId) return;
    setLoadingEmpresa(true);
    setErrorEmpresa(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado.");

      const response = await fetch(`http://localhost:3001/empresas/${empresaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao buscar informações da empresa.");
      }
      const data = await response.json();
      setEmpresaInfo(data);
    } catch (err: any) {
      setErrorEmpresa(err.message);
      toast({
        title: "Erro",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingEmpresa(false);
    }
  };

  // Função para buscar os convites existentes
  const fetchConvites = async () => {
    if (!empresaId) return;
    setLoadingConvites(true);
    setErrorConvites(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado.");

      const response = await fetch(`http://localhost:3001/empresas/${empresaId}/convites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao buscar convites.");
      }
      const data = await response.json();
      setConvites(data);
    } catch (err: any) {
      setErrorConvites(err.message);
      toast({
        title: "Erro",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingConvites(false);
    }
  };

  // Função para gerar um novo convite
  const handleGenerateInvite = async () => {
    if (!empresaId) return;
    setGeneratingInvite(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado.");

      const response = await fetch(`http://localhost:3001/empresas/${empresaId}/convites/gerar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ empresaId } ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao gerar convite.");
      }

      const newInvite = await response.json();
      setConvites((prev) => [...prev, newInvite]);
      toast({
        title: "Convite gerado!",
        description: `Novo código: ${newInvite.code}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setGeneratingInvite(false);
    }
  };

  // Função para buscar os membros da empresa e seus cargos
  const fetchMembers = async () => {
    if (!empresaId) return;
    setLoadingMembers(true);
    setErrorMembers(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado.");

      // TODO: Você precisará de um endpoint no backend para listar os membros da empresa com seus cargos.
      // Por enquanto, vamos simular alguns dados ou buscar de uma forma que você já tenha.
      // Exemplo de endpoint que você precisaria: GET /empresas/:id/members (retornando { userId, role, nome, email })
      // Para este exemplo, vou simular dados ou assumir que você pode buscar os usuários e seus cargos separadamente.

      // Para fins de demonstração, vamos buscar todos os usuários que têm um papel nesta empresa
      const response = await fetch(`http://localhost:3001/empresas/${empresaId}/roles`, { // Endpoint hipotético
        headers: {
          Authorization: `Bearer ${token}`,
        },
      } );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao buscar membros da empresa.");
      }
      const data = await response.json();
      setMembers(data);
    } catch (err: any) {
      setErrorMembers(err.message);
      toast({
        title: "Erro",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingMembers(false);
    }
  };

  // Função para atribuir/atualizar o cargo de um membro
  const handleAssignRole = async (userId: string) => {
    if (!empresaId || !newRole) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado.");

      const response = await fetch(`http://localhost:3001/empresas/${empresaId}/roles/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole } ),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao atribuir cargo.");
      }

      toast({
        title: "Cargo atualizado!",
        description: `O cargo do usuário ${userId} foi atualizado para ${newRole}.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setEditingMemberId(null);
      setNewRole("");
      fetchMembers(); // Recarrega a lista de membros para refletir a mudança
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchEmpresaInfo();
    fetchConvites();
    fetchMembers(); // Busca membros ao carregar a página
  }, [empresaId]);

  if (loadingEmpresa) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (errorEmpresa) {
    return (
      <Box p={4} textAlign="center">
        <Heading>Erro ao carregar empresa</Heading>
        <Text color="red.500">{errorEmpresa}</Text>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <VStack spacing={4} align="flex-start">
        <Heading as="h1" size="xl">
          Dashboard da Empresa: {empresaInfo?.nome || "Carregando..."}
        </Heading>
        <Text>ID da Empresa: {empresaId}</Text>

        {/* Seção de Geração de Convites */}
        <Box borderWidth={1} p={4} borderRadius="md" width="100%">
          <Heading as="h2" size="lg" mb={4}>Gerar Novo Convite</Heading>
          <Button
            colorScheme="blue"
            onClick={handleGenerateInvite}
            isLoading={generatingInvite}
          >
            Gerar Convite
          </Button>
        </Box>

        {/* Seção de Convites Existentes */}
        <Box borderWidth={1} p={4} borderRadius="md" width="100%">
          <Heading as="h2" size="lg" mb={4}>Convites Existentes</Heading>
          {loadingConvites ? (
            <Spinner />
          ) : errorConvites ? (
            <Text color="red.500">Erro ao carregar convites: {errorConvites}</Text>
          ) : convites.length === 0 ? (
            <Text>Nenhum convite gerado ainda.</Text>
          ) : (
            <VStack align="flex-start" spacing={2}>
              {convites.map((convite) => (
                <Box key={convite.id} p={2} borderWidth={1} borderRadius="md" width="100%">
                  <Text>Código: <Text as="b">{convite.code}</Text></Text>
                  <Text>Expira em: {new Date(convite.expiresAt._seconds * 1000).toLocaleString()}</Text>
                  <Text>Ativo: {convite.isActive ? "Sim" : "Não"}</Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        {/* Seção de Gerenciamento de Membros e Cargos */}
        <Box borderWidth={1} p={4} borderRadius="md" width="100%">
          <Heading as="h2" size="lg" mb={4}>Gerenciar Membros e Cargos</Heading>
          {loadingMembers ? (
            <Spinner />
          ) : errorMembers ? (
            <Text color="red.500">Erro ao carregar membros: {errorMembers}</Text>
          ) : members.length === 0 ? (
            <Text>Nenhum membro encontrado nesta empresa.</Text>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID do Usuário</Th>
                  <Th>Cargo</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {members.map((member) => (
                  <Tr key={member.userId}>
                    <Td>{member.userId}</Td>
                    <Td>
                      {editingMemberId === member.userId ? (
                        <Select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          placeholder="Selecione um cargo"
                        >
                          <option value="admin">Administrador</option>
                          <option value="membro">Membro</option>
                          {/* Adicione outros cargos conforme necessário */}
                        </Select>
                      ) : (
                        member.role
                      )}
                    </Td>
                    <Td>
                      {editingMemberId === member.userId ? (
                        <IconButton
                          aria-label="Salvar Cargo"
                          icon={<FaSave />}
                          onClick={() => handleAssignRole(member.userId)}
                          colorScheme="green"
                          size="sm"
                        />
                      ) : (
                        <IconButton
                          aria-label="Editar Cargo"
                          icon={<FaEdit />}
                          onClick={() => {
                            setEditingMemberId(member.userId);
                            setNewRole(member.role);
                          }}
                          colorScheme="blue"
                          size="sm"
                        />
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </Box>

      </VStack>
    </Box>
  );
}