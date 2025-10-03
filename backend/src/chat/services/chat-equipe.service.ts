import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateChatEquipeDto } from '../dto/create-chat-equipe.dto';
import { CreateMensagemDto } from '../dto/create-mensagem.dto';
import { UpdateMensagemDto } from '../dto/update-mensagem.dto';

@Injectable()
export class ChatEquipeService {
  private readonly chatEquipeCollection;
  private readonly mensagemCollection;
  private readonly equipeCollection;
  private readonly funcionarioCollection;
  private readonly empresaCollection;

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    this.chatEquipeCollection = this.firestore.collection('chats-equipe');
    this.mensagemCollection = this.firestore.collection('mensagens');
    this.equipeCollection = this.firestore.collection('equipes');
    this.funcionarioCollection = this.firestore.collection('funcionarios');
    this.empresaCollection = this.firestore.collection('empresas');
  }

  async criarChatEquipe(data: CreateChatEquipeDto) {
    // Verificar se a equipe existe
    const equipeDoc = await this.equipeCollection.doc(data.equipeId).get();
    if (!equipeDoc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }

    const equipeData = equipeDoc.data();
    const empresaId = equipeData?.empresaId;

    // Verificar se o criador é membro da equipe
    const isMembro = equipeData?.membros?.some(
      (ref: any) => ref.id === data.criadoPor,
    );
    if (!isMembro) {
      throw new ForbiddenException(
        'Você não tem permissão para criar chat nesta equipe.',
      );
    }

    const docRef = await this.chatEquipeCollection.add({
      nome: data.nome,
      equipeId: this.equipeCollection.doc(data.equipeId),
      empresaId: this.empresaCollection.doc(empresaId),
      criadoPor: this.funcionarioCollection.doc(data.criadoPor),
      dataCriacao: new Date(),
      ativo: data.ativo ?? true,
    });

    const doc = await docRef.get();
    return this.mapChatEquipe(doc);
  }

  async listarChatsEquipe(equipeId: string, usuarioId: string) {
    // Verificar se o usuário é membro da equipe
    const equipeDoc = await this.equipeCollection.doc(equipeId).get();
    if (!equipeDoc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }

    const equipeData = equipeDoc.data();
    const isMembro = equipeData?.membros?.some(
      (ref: any) => ref.id === usuarioId,
    );
    if (!isMembro) {
      throw new ForbiddenException(
        'Você não tem permissão para ver os chats desta equipe.',
      );
    }

    const snapshot = await this.chatEquipeCollection
      .where('equipeId', '==', this.equipeCollection.doc(equipeId))
      .where('ativo', '==', true)
      .orderBy('dataCriacao', 'desc')
      .get();

    return snapshot.docs.map((doc) => this.mapChatEquipe(doc));
  }

  async obterChatEquipe(chatId: string, usuarioId: string) {
    const doc = await this.chatEquipeCollection.doc(chatId).get();
    if (!doc.exists) {
      throw new NotFoundException('Chat não encontrado.');
    }

    const chatData = doc.data();
    const equipeId = chatData?.equipeId?.id;

    // Verificar se o usuário é membro da equipe
    const equipeDoc = await this.equipeCollection.doc(equipeId).get();
    const equipeData = equipeDoc.data();
    const isMembro = equipeData?.membros?.some(
      (ref: any) => ref.id === usuarioId,
    );
    if (!isMembro) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este chat.',
      );
    }

    return this.mapChatEquipe(doc);
  }

  async enviarMensagem(data: CreateMensagemDto) {
    // Verificar se o chat existe e se o usuário tem permissão
    const chatDoc = await this.chatEquipeCollection.doc(data.chatId).get();
    if (!chatDoc.exists) {
      throw new NotFoundException('Chat não encontrado.');
    }

    const chatData = chatDoc.data();
    const equipeId = chatData?.equipeId?.id;

    // Verificar se o autor é membro da equipe
    const equipeDoc = await this.equipeCollection.doc(equipeId).get();
    const equipeData = equipeDoc.data();
    const isMembro = equipeData?.membros?.some(
      (ref: any) => ref.id === data.autorId,
    );
    if (!isMembro) {
      throw new ForbiddenException(
        'Você não tem permissão para enviar mensagens neste chat.',
      );
    }
    const funcionarioDoc = await this.funcionarioCollection
      .doc(data.autorId)
      .get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário (autor) não encontrado.');
    }
    const funcionarioData = funcionarioDoc.data();
    const nomeAutor = funcionarioData?.nome || 'Usuário';

    const docRef = await this.mensagemCollection.add({
      conteudo: data.conteudo,
      autorId: this.funcionarioCollection.doc(data.autorId),
      nomeAutor,
      chatId: this.chatEquipeCollection.doc(data.chatId),
      tipoChat: 'equipe',
      dataEnvio: new Date(),
      editada: false,
    });

    const doc = await docRef.get();
    return this.mapMensagem(doc);
  }

  async listarMensagens(
    chatId: string,
    usuarioId: string,
    limite: number = 50,
  ) {
    // Verificar permissões
    await this.obterChatEquipe(chatId, usuarioId);

    const snapshot = await this.mensagemCollection
      .where('chatId', '==', this.chatEquipeCollection.doc(chatId))
      .where('tipoChat', '==', 'equipe')
      .orderBy('dataEnvio', 'desc')
      .limit(limite)
      .get();

    return snapshot.docs.map((doc) => this.mapMensagem(doc)).reverse();
  }

  async editarMensagem(
    mensagemId: string,
    data: UpdateMensagemDto,
    usuarioId: string,
  ) {
    const docRef = this.mensagemCollection.doc(mensagemId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Mensagem não encontrada.');
    }

    const mensagemData = doc.data();

    // Verificar se o usuário é o autor da mensagem
    if (mensagemData?.autorId?.id !== usuarioId) {
      throw new ForbiddenException(
        'Você só pode editar suas próprias mensagens.',
      );
    }

    await docRef.update({
      conteudo: data.conteudo,
      editada: true,
      dataEdicao: new Date(),
    });

    const updated = await docRef.get();
    return this.mapMensagem(updated);
  }

  private mapChatEquipe(doc: FirebaseFirestore.DocumentSnapshot) {
    const data = doc.data();
    return {
      id: doc.id,
      nome: data?.nome,
      equipeId: data?.equipeId?.id || null,
      empresaId: data?.empresaId?.id || null,
      criadoPor: data?.criadoPor?.id || null,
      dataCriacao: data?.dataCriacao?.toDate?.() || data?.dataCriacao,
      ativo: data?.ativo ?? true,
    };
  }

  private mapMensagem(doc: FirebaseFirestore.DocumentSnapshot) {
    const data = doc.data();
    return {
      id: doc.id,
      conteudo: data?.conteudo,
      autorId: data?.autorId?.id || null,
      nomeAutor: data?.nomeAutor || null,
      chatId: data?.chatId?.id || null,
      tipoChat: data?.tipoChat,
      dataEnvio: data?.dataEnvio?.toDate?.() || data?.dataEnvio,
      editada: data?.editada ?? false,
      dataEdicao: data?.dataEdicao?.toDate?.() || data?.dataEdicao,
    };
  }
}
