import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateMensagemDto } from './dto/create-mensagem.dto';
import { UpdateMensagemDto } from './dto/update-mensagem.dto';

@Injectable()
export class MensagemService {
  private readonly collection;
  private readonly chatCollection;
  private readonly funcionarioCollection;

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('mensagens');
    this.chatCollection = this.firestore.collection('chats');
    this.funcionarioCollection = this.firestore.collection('funcionarios');
  }

  async create(data: CreateMensagemDto) {
    const chatDoc = await this.chatCollection.doc(data.chatId).get();
    if (!chatDoc.exists) {
      throw new NotFoundException('Chat não encontrado.');
    }
    const funcionarioDoc = await this.funcionarioCollection
      .doc(data.enviadoPor)
      .get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário remetente não encontrado.');
    }

    const docRef = await this.collection.add({
      chatId: this.chatCollection.doc(data.chatId),
      conteudo: data.conteudo,
      enviadoPor: this.funcionarioCollection.doc(data.enviadoPor),
      dataEnvio: new Date(),
    });
    const doc = await docRef.get();
    return this.mapMensagem(doc);
  }

  async findAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => this.mapMensagem(doc));
  }

  async findOne(id: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Mensagem não encontrada');
    }
    return this.mapMensagem(doc);
  }

  async update(id: string, data: UpdateMensagemDto) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Mensagem não encontrada');
    }
    await docRef.update({ ...data } as any);
    const updated = await docRef.get();
    return this.mapMensagem(updated);
  }

  async remove(id: string) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Mensagem não encontrada');
    }
    await docRef.delete();
    return { message: 'Mensagem deletada com sucesso' };
  }

  private mapMensagem(doc: FirebaseFirestore.DocumentSnapshot) {
    const data = doc.data();
    return {
      id: doc.id,
      chatId: data?.chatId?.id || null,
      conteudo: data?.conteudo,
      enviadoPor: data?.enviadoPor?.id || null,
      dataEnvio: data?.dataEnvio,
    };
  }
}
