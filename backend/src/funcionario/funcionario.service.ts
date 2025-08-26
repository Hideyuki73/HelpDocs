// Conteúdo completo de funcionario.service.ts
// Certifique-se de que este é o conteúdo EXATO do seu arquivo

import { Injectable, Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
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

  async createWithUid(uid: string, data: CreateFuncionarioDto) {
    // grava o documento de funcionario com id = uid
    const docRef = this.funcionarioCollection.doc(uid);
    await docRef.set({
      nome: data.nome,
      email: data.email,
      dataCadastro: new Date(),
    });
    const doc = await docRef.get();
    return this.mapFuncionario(doc);
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

  async createEmpresa(funcionarioId: string, empresaData: any) {
    // Verifica se o funcionário existe
    const funcionarioDoc = await this.funcionarioCollection
      .doc(funcionarioId)
      .get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    // Cria a empresa
    const empresaRef = await this.empresaCollection.add({
      ...empresaData,
      criadorId: this.funcionarioCollection.doc(funcionarioId),
      dataCadastro: new Date(),
    });

    // Atualiza o funcionário para associar à nova empresa
    await this.funcionarioCollection.doc(funcionarioId).update({
      empresaId: empresaRef,
    });

    const empresaDoc = await empresaRef.get();
    return {
      id: empresaDoc.id,
      ...empresaDoc.data(),
    };
  }

  async associateWithEmpresa(funcionarioId: string, empresaId: string) {
    // Verificar se a empresa existe
    const empresaDoc = await this.empresaCollection.doc(empresaId).get();
    if (!empresaDoc.exists) {
      throw new NotFoundException(
        'Código de convite inválido: Empresa não encontrada',
      );
    }

    // Verificar se o funcionário existe
    const funcionarioDoc = await this.funcionarioCollection
      .doc(funcionarioId)
      .get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    // Atualizar o funcionário com o código da empresa
    await this.funcionarioCollection.doc(funcionarioId).update({ empresaId });
    const updatedFuncionario = await this.funcionarioCollection
      .doc(funcionarioId)
      .get();
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

  // Atualizar cargo do funcionário
  async updateCargo(funcionarioId: string, cargo: string, requesterId: string) {
    // Verificar se o funcionário existe
    const funcionarioDoc = await this.funcionarioCollection.doc(funcionarioId).get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário não encontrado');
    }

    // Verificar se o usuário que está fazendo a requisição é o criador da empresa
    const funcionarioData = funcionarioDoc.data();
    if (!funcionarioData?.empresaId) {
      throw new NotFoundException('Funcionário não está associado a nenhuma empresa');
    }

    // CORREÇÃO AQUI: Buscar a empresa diretamente pelo empresaId do funcionário
    const empresaDoc = await this.empresaCollection.doc(funcionarioData.empresaId).get();

    if (!empresaDoc.exists) {
      throw new NotFoundException("Empresa não encontrada para este funcionário");
    }

    const empresaData = empresaDoc.data();

    // Verificar se o usuário que está fazendo a requisição é o criador da empresa
    if (empresaData.criadorUid !== requesterId) {
      throw new UnauthorizedException("Apenas o criador da empresa pode atribuir cargos");
    }

    // Validar cargo
    const cargosPermitidos = ['Gerente de Projetos', 'Desenvolvedor'];
    if (!cargosPermitidos.includes(cargo)) {
      throw new NotFoundException('Cargo inválido. Cargos permitidos: ' + cargosPermitidos.join(', '));
    }

    // Atualizar o cargo
    await this.funcionarioCollection.doc(funcionarioId).update({ cargo });
    
    const updatedFuncionario = await this.funcionarioCollection.doc(funcionarioId).get();
    return this.mapFuncionario(updatedFuncionario);
  }

  private mapFuncionario(doc: FirebaseFirestore.DocumentSnapshot) {
    const data = doc.data();
    return {
      id: doc.id,
      nome: data?.nome,
      email: data?.email,
      cargo: data?.cargo,
      empresaId: data?.empresaId && typeof data.empresaId === 'object' && 'id' in data.empresaId ? data.empresaId.id : data?.empresaId || null,
      dataCadastro: data?.dataCadastro,
    };
  }
}
