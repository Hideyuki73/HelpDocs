import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Injectable()
export class ChatService {
  private readonly collection;

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('chats');
  }

  async create(data: CreateChatDto) {
    const docRef = await this.collection.add({
      ...data,
      dataCriacao: new Date(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  }

  async findAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Chat não encontrado');
    }
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, data: UpdateChatDto) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Chat não encontrado');
    }
    await docRef.update({ ...data } as any);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
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
}
