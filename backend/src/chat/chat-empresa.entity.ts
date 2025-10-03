export class ChatEmpresa {
  id: string;
  nome: string;
  empresaId: string;
  criadoPor: string; // ID do funcionário que criou
  dataCriacao: Date;
  ativo: boolean;
  publico: boolean; // Se todos os funcionários da empresa podem ver
}
