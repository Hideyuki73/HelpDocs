import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';

@Injectable()
export class FuncionarioService {
  private funcionarioCollection;
  private empresaCollection;

  constructor(@Inject('FIRESTORE') private firestore: Firestore) {
    this.funcionarioCollection = this.firestore.collection('funcionarios');
    this.empresaCollection = this.firestore.collection('empresas');
  }

  async create(data: CreateFuncionarioDto) {
    // Se um empresaId foi enviado, validamos a existência da empresa
    if (data.empresaId) {
      const empresaDoc = await this.empresaCollection.doc(data.empresaId).get();
      if (!empresaDoc.exists) {
        throw new NotFoundException(
          'Empresa não encontrada para o funcionário.',
        );
      }
    }

    const docRef = await this.funcionarioCollection.add({
      ...data,
      dataCadastro: new Date(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  }

  async findAll() {
    const snapshot = await this.funcionarioCollection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const doc = await this.funcionarioCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Funcionário não encontrado');
    }
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, data: UpdateFuncionarioDto) {
    if (data.hasOwnProperty('empresaId') && data.empresaId) {
      const empresaDoc = await this.empresaCollection.doc(data.empresaId).get();
      if (!empresaDoc.exists) {
        throw new NotFoundException(
          'Empresa não encontrada para o funcionário.',
        );
      }
    }

    const docRef = this.funcionarioCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Funcionário não encontrado');
    }
    await docRef.update({ ...data } as any);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
  }

  async remove(id: string) {
    const docRef = this.funcionarioCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Funcionário não encontrado');
    }
    await docRef.delete();
    return { message: 'Funcionário deletado com sucesso' };
  }
}
