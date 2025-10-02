export class Mensagem {
  id: string;
  conteudo: string;
  autorId: string; // ID do funcionário que enviou
  chatId: string; // ID do chat (equipe ou empresa)
  tipoChat: 'equipe' | 'empresa'; // Tipo do chat
  dataEnvio: Date;
  editada: boolean;
  dataEdicao?: Date;
}
