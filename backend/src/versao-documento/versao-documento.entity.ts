export class VersaoDocumento {
  id: string;
  documentoId: string; // Referência ao Documento
  numeroVersao: number;
  conteudo: string;
  criadoPor: string; // Funcionário
  dataCriacao: Date;
}
