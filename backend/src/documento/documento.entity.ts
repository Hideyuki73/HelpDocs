export class Documento {
  id: string;
  titulo: string;
  descricao: string;
  empresaId: string; // Vinculado à Empresa
  criadoPor: string; // ID do Funcionário que criou
  dataCriacao: Date;
}
