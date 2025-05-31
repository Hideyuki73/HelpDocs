import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateVersaoDocumentoDto } from './dto/create-versao-documento.dto';
import { UpdateVersaoDocumentoDto } from './dto/update-versao-documento.dto';

@Injectable()
export class VersaoDocumentoService {
  private readonly collection;

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('versoes-documento');
  }

  async create(data: CreateVersaoDocumentoDto) {
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
      throw new NotFoundException('Versão não encontrada');
    }
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, data: UpdateVersaoDocumentoDto) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Versão não encontrada');
    }
    await docRef.update({ ...data } as any);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
  }

  async remove(id: string) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Versão não encontrada');
    }
    await docRef.delete();
    return { message: 'Versão deletada com sucesso' };
  }
}
