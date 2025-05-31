import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateMensagemDto } from './dto/create-mensagem.dto';
import { UpdateMensagemDto } from './dto/update-mensagem.dto';

@Injectable()
export class MensagemService {
  private readonly collection;

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('mensagens');
  }

  async create(data: CreateMensagemDto) {
    const docRef = await this.collection.add({
      ...data,
      dataEnvio: new Date(),
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
      throw new NotFoundException('Mensagem não encontrada');
    }
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, data: UpdateMensagemDto) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Mensagem não encontrada');
    }
    await docRef.update({ ...data } as any);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
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
}
