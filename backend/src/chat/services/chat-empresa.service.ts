import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateChatEmpresaDto } from '../dto/create-chat-empresa.dto';
import { CreateMensagemDto } from '../dto/create-mensagem.dto';
import { UpdateMensagemDto } from '../dto/update-mensagem.dto';

@Injectable()
export class ChatEmpresaService {
  private readonly chatEmpresaCollection;
  private readonly mensagemCollection;
  private readonly empresaCollection;
  private readonly funcionarioCollection;

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    this.chatEmpresaCollection = this.firestore.collection('chats-empresa');
    this.mensagemCollection = this.firestore.collection('mensagens');
    this.empresaCollection = this.firestore.collection('empresas');
    this.funcionarioCollection = this.firestore.collection('funcionarios');
  }

  async criarChatEmpresa(data: CreateChatEmpresaDto) {
    // Verificar se a empresa existe
    const empresaDoc = await this.empresaCollection.doc(data.empresaId).get();
    if (!empresaDoc.exists) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    // Verificar se o criador pertence à empresa
    const funcionarioDoc = await this.funcionarioCollection.doc(data.criadoPor).get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário não encontrado.');
    }

    const funcionarioData = funcionarioDoc.data();
    if (funcionarioData?.empresaId !== data.empresaId) {
      throw new ForbiddenException(
        'Você não tem permissão para criar chat nesta empresa.',
      );
    }

    // Verificar se é administrador (apenas admins podem criar chats da empresa)
    if (funcionarioData?.cargo !== 'Administrador') {
      throw new ForbiddenException(
        'Apenas administradores podem criar chats da empresa.',
      );
    }

    const docRef = await this.chatEmpresaCollection.add({
      nome: data.nome,
      empresaId: this.empresaCollection.doc(data.empresaId),
      criadoPor: this.funcionarioCollection.doc(data.criadoPor),
      dataCriacao: new Date(),
      ativo: data.ativo ?? true,
      publico: data.publico ?? true,
    });

    const doc = await docRef.get();
    return this.mapChatEmpresa(doc);
  }

  async listarChatsEmpresa(usuarioId: string) {
    // Verificar se o funcionário existe e obter sua empresa
    const funcionarioDoc = await this.funcionarioCollection.doc(usuarioId).get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário não encontrado.');
    }

    const funcionarioData = funcionarioDoc.data();
    const empresaId = funcionarioData?.empresaId;

    if (!empresaId) {
      throw new ForbiddenException('Funcionário não possui empresa vinculada.');
    }

    const snapshot = await this.chatEmpresaCollection
      .where('empresaId', '==', this.empresaCollection.doc(empresaId))
      .where('ativo', '==', true)
      .where('publico', '==', true)
      .orderBy('dataCriacao', 'desc')
      .get();

    return snapshot.docs.map((doc) => this.mapChatEmpresa(doc));
  }

  async obterChatEmpresa(chatId: string, usuarioId: string) {
    const doc = await this.chatEmpresaCollection.doc(chatId).get();
    if (!doc.exists) {
      throw new NotFoundException('Chat não encontrado.');
    }

    const chatData = doc.data();
    const empresaId = chatData?.empresaId?.id;

    // Verificar se o usuário pertence à empresa
    const funcionarioDoc = await this.funcionarioCollection.doc(usuarioId).get();
    const funcionarioData = funcionarioDoc.data();
    
    if (funcionarioData?.empresaId !== empresaId) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este chat.',
      );
    }

    return this.mapChatEmpresa(doc);
  }

  async enviarMensagem(data: CreateMensagemDto) {
    // Verificar se o chat existe e se o usuário tem permissão
    const chatDoc = await this.chatEmpresaCollection.doc(data.chatId).get();
    if (!chatDoc.exists) {
      throw new NotFoundException('Chat não encontrado.');
    }

    const chatData = chatDoc.data();
    const empresaId = chatData?.empresaId?.id;

    // Verificar se o autor pertence à empresa
    const funcionarioDoc = await this.funcionarioCollection.doc(data.autorId).get();
    const funcionarioData = funcionarioDoc.data();
    
    if (funcionarioData?.empresaId !== empresaId) {
      throw new ForbiddenException(
        'Você não tem permissão para enviar mensagens neste chat.',
      );
    }

    const docRef = await this.mensagemCollection.add({
      conteudo: data.conteudo,
      autorId: this.funcionarioCollection.doc(data.autorId),
      chatId: this.chatEmpresaCollection.doc(data.chatId),
      tipoChat: 'empresa',
      dataEnvio: new Date(),
      editada: false,
    });

    const doc = await docRef.get();
    return this.mapMensagem(doc);
  }

  async listarMensagens(chatId: string, usuarioId: string, limite: number = 50) {
    // Verificar permissões
    await this.obterChatEmpresa(chatId, usuarioId);

    const snapshot = await this.mensagemCollection
      .where('chatId', '==', this.chatEmpresaCollection.doc(chatId))
      .where('tipoChat', '==', 'empresa')
      .orderBy('dataEnvio', 'desc')
      .limit(limite)
      .get();

    return snapshot.docs.map((doc) => this.mapMensagem(doc)).reverse();
  }

  async editarMensagem(mensagemId: string, data: UpdateMensagemDto, usuarioId: string) {
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

  async deletarMensagem(mensagemId: string, usuarioId: string) {
    const docRef = this.mensagemCollection.doc(mensagemId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new NotFoundException('Mensagem não encontrada.');
    }

    const mensagemData = doc.data();
    
    // Verificar se o usuário é o autor da mensagem ou administrador
    const funcionarioDoc = await this.funcionarioCollection.doc(usuarioId).get();
    const funcionarioData = funcionarioDoc.data();
    
    const isAutor = mensagemData?.autorId?.id === usuarioId;
    const isAdmin = funcionarioData?.cargo === 'Administrador';
    
    if (!isAutor && !isAdmin) {
      throw new ForbiddenException(
        'Você só pode deletar suas próprias mensagens ou ser administrador.',
      );
    }

    await docRef.delete();
    return { message: 'Mensagem deletada com sucesso' };
  }

  private mapChatEmpresa(doc: FirebaseFirestore.DocumentSnapshot) {
    const data = doc.data();
    return {
      id: doc.id,
      nome: data?.nome,
      empresaId: data?.empresaId?.id || null,
      criadoPor: data?.criadoPor?.id || null,
      dataCriacao: data?.dataCriacao?.toDate?.() || data?.dataCriacao,
      ativo: data?.ativo ?? true,
      publico: data?.publico ?? true,
    };
  }

  private mapMensagem(doc: FirebaseFirestore.DocumentSnapshot) {
    const data = doc.data();
    return {
      id: doc.id,
      conteudo: data?.conteudo,
      autorId: data?.autorId?.id || null,
      chatId: data?.chatId?.id || null,
      tipoChat: data?.tipoChat,
      dataEnvio: data?.dataEnvio?.toDate?.() || data?.dataEnvio,
      editada: data?.editada ?? false,
      dataEdicao: data?.dataEdicao?.toDate?.() || data?.dataEdicao,
    };
  }
}
