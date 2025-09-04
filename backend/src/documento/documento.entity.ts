export class Documento {
  id: string;
  titulo: string;
  descricao: string;
  conteudo?: string; // Conteúdo do documento (para documentos criados)
  tipo: 'criado' | 'upload'; // Tipo do documento
  arquivoUrl?: string; // URL do arquivo (para uploads)
  nomeArquivo?: string; // Nome original do arquivo
  tamanhoArquivo?: number; // Tamanho do arquivo em bytes
  empresaId: string; // Vinculado à Empresa
  equipeId: string; // Vinculado à Equipe (controle de acesso)
  criadoPor: string; // ID do Funcionário que criou
  dataCriacao: Date;
  dataAtualizacao?: Date;
  versao: number; // Controle de versão
  status: 'rascunho' | 'publicado' | 'arquivado'; // Status do documento
}
