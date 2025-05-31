import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';

@Injectable()
export class FuncionarioService {
  private collection;

  constructor(@Inject('FIRESTORE') private firestore: Firestore) {
    this.collection = this.firestore.collection('funcionarios');
  }

  async create(data: CreateFuncionarioDto) {
    const docRef = await this.collection.add({
      ...data,
      dataCadastro: new Date(),
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
      throw new NotFoundException('Funcionário não encontrado');
    }
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, data: UpdateFuncionarioDto) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Funcionário não encontrado');
    }
    await docRef.update({ ...data } as any);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
  }

  async remove(id: string) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Funcionário não encontrado');
    }
    await docRef.delete();
    return { message: 'Funcionário deletado com sucesso' };
  }
}
