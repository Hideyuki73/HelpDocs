import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';

@Injectable()
export class DocumentoService {
  private readonly collection;

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('documentos');
  }

  async create(data: CreateDocumentoDto) {
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
      throw new NotFoundException('Documento não encontrado');
    }
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, data: UpdateDocumentoDto) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Documento não encontrado');
    }
    await docRef.update({ ...data } as any);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
  }

  async remove(id: string) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Documento não encontrado');
    }
    await docRef.delete();
    return { message: 'Documento deletado com sucesso' };
  }
}
