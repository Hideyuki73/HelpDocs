import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatService {
  private readonly collection;
  private readonly empresaCollection;
  private readonly funcionarioCollection;

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('chats');
    this.empresaCollection = this.firestore.collection('empresas');
    this.funcionarioCollection = this.firestore.collection('funcionarios');
  }

  async create(data: CreateChatDto) {
    // Validação das referências
    const empresaDoc = await this.empresaCollection.doc(data.empresaId).get();
    if (!empresaDoc.exists) {
      throw new NotFoundException('Empresa não encontrada.');
    }
    const funcionarioDoc = await this.funcionarioCollection
      .doc(data.criadoPor)
      .get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário criador não encontrado.');
    }

    const docRef = await this.collection.add({
      nome: data.nome,
      empresaId: this.empresaCollection.doc(data.empresaId),
      criadoPor: this.funcionarioCollection.doc(data.criadoPor),
      dataCriacao: new Date(),
    });
    const doc = await docRef.get();
    return this.mapChat(doc);
  }

  async findAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => this.mapChat(doc));
  }

  async findOne(id: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Chat não encontrado');
    }
    return this.mapChat(doc);
  }

  async update(id: string, data: UpdateChatDto) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Chat não encontrado');
    }
    const updateData: any = { ...data };
    if (data.empresaId) {
      const empresaDoc = await this.empresaCollection.doc(data.empresaId).get();
      if (!empresaDoc.exists) {
        throw new NotFoundException('Empresa não encontrada.');
      }
      updateData.empresaId = this.empresaCollection.doc(data.empresaId);
    }
    if (data.criadoPor) {
      const funcionarioDoc = await this.funcionarioCollection
        .doc(data.criadoPor)
        .get();
      if (!funcionarioDoc.exists) {
        throw new NotFoundException('Funcionário criador não encontrado.');
      }
      updateData.criadoPor = this.funcionarioCollection.doc(data.criadoPor);
    }
    await docRef.update(updateData as any);
    const updated = await docRef.get();
    return this.mapChat(updated);
  }

  async remove(id: string) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Chat não encontrado');
    }
    await docRef.delete();
    return { message: 'Chat deletado com sucesso' };
  }

  private mapChat(doc: FirebaseFirestore.DocumentSnapshot) {
    const data = doc.data();
    return {
      id: doc.id,
      nome: data?.nome,
      empresaId: data?.empresaId?.id || null,
      criadoPor: data?.criadoPor?.id || null,
      dataCriacao: data?.dataCriacao,
    };
  }
}
