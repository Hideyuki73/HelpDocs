import { Injectable, Inject } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateIaHelperDto } from './dto/create-ia-helper.dto';

@Injectable()
export class IaHelperService {
  private readonly collection;

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('ia-helper');
  }

  async create(data: CreateIaHelperDto) {
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
}
