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
    let empresaRef = null;
    if (data.empresaId) {
      const empresaDoc = await this.empresaCollection.doc(data.empresaId).get();
      if (!empresaDoc.exists) {
        throw new NotFoundException(
          'Empresa não encontrada para o funcionário.',
        );
      }
      empresaRef = this.empresaCollection.doc(data.empresaId);
    }

    const docRef = await this.funcionarioCollection.add({
      ...data,
      empresaId: empresaRef,
      dataCadastro: new Date(),
    });
    const doc = await docRef.get();
    return this.mapFuncionario(doc);
  }

  async associateWithEmpresa(funcionarioId: string, empresaId: string) {
    // Verificar se a empresa existe
    const empresaDoc = await this.empresaCollection.doc(empresaId).get();
    if (!empresaDoc.exists) {
      throw new NotFoundException('Código de convite inválido: Empresa não encontrada');
    }

    // Verificar se o funcionário existe
    const funcionarioDoc = await this.funcionarioCollection.doc(funcionarioId).get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    // Atualizar o funcionário com o código da empresa
    await this.funcionarioCollection.doc(funcionarioId).update({ empresaId });
    const updatedFuncionario = await this.funcionarioCollection.doc(funcionarioId).get();
    return this.mapFuncionario(updatedFuncionario);
  }

  async findAll() {
    const snapshot = await this.funcionarioCollection.get();
    return snapshot.docs.map((doc) => this.mapFuncionario(doc));
  }

  async findOne(id: string) {
    const doc = await this.funcionarioCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Funcionário não encontrado');
    }
    return this.mapFuncionario(doc);
  }

  async update(id: string, data: UpdateFuncionarioDto) {
    const docRef = this.funcionarioCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Funcionário não encontrado');
    }
    const updateData: any = { ...data };
    if (data.empresaId) {
      const empresaDoc = await this.empresaCollection.doc(data.empresaId).get();
      if (!empresaDoc.exists) {
        throw new NotFoundException(
          'Empresa não encontrada para o funcionário.',
        );
      }
      updateData.empresaId = this.empresaCollection.doc(data.empresaId);
    }
    await docRef.update(updateData as any);
    const updated = await docRef.get();
    return this.mapFuncionario(updated);
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

  private mapFuncionario(doc: FirebaseFirestore.DocumentSnapshot) {
    const data = doc.data();
    return {
      id: doc.id,
      nome: data?.nome,
      email: data?.email,
      cargo: data?.cargo,
      senha: data?.senha,
      empresaId: data?.empresaId?.id || null,
      dataCadastro: data?.dataCadastro,
    };
  }
}
