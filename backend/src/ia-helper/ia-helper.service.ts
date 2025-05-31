import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateIaHelperDto } from './dto/create-ia-helper.dto';

@Injectable()
export class IaHelperService {
  private readonly collection;

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('ia-helper');
  }

  async create(data: CreateIaHelperDto) {
    const funcionarioDoc = await this.firestore
      .collection('funcionarios')
      .doc(data.criadoPor)
      .get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário criador não encontrado.');
    }
    const docRef = await this.collection.add({
      ...data,
      criadoPor: this.firestore.collection('funcionarios').doc(data.criadoPor),
      dataCriacao: new Date(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data(), criadoPor: data.criadoPor };
  }

  async findAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
