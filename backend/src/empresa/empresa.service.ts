// Conteúdo completo de empresa.service.ts
// Certifique-se de que este é o conteúdo EXATO do seu arquivo

import { Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class EmpresaService {
  private empresaCollection = admin.firestore().collection('empresas');
  private funcionarioCollection = admin.firestore().collection('funcionarios');

  // Criação de empresa
  async create(createEmpresaDto: CreateEmpresaDto, criadorUid: string) {
    const criadorRef = this.funcionarioCollection.doc(criadorUid);

    const conviteCodigo = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    const docRef = await this.empresaCollection.add({
      ...createEmpresaDto,
      criadorUid,
      criadorRef,
      conviteCodigo,
      membros: [criadorUid], // adiciona criador como membro inicial
      dataCadastro: new Date(),
    });

    // NOVO CÓDIGO: Atualizar o campo empresaId no documento do funcionário criador
    await this.funcionarioCollection.doc(criadorUid).update({
      empresaId: docRef.id,
    });

    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  }

  // Entrar em empresa via convite
  async entrarPorConvite(funcionarioId: string, codigo: string) {
    const snapshot = await this.empresaCollection
      .where('conviteCodigo', '==', codigo)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException('Código de convite inválido');
    }

    const empresaDoc = snapshot.docs[0];
    const empresaData = empresaDoc.data();

    if (empresaData.membros.includes(funcionarioId)) {
      return { id: empresaDoc.id, ...empresaData };
    }

    await empresaDoc.ref.update({
      membros: admin.firestore.FieldValue.arrayUnion(funcionarioId),
    });

    // Atualizar o campo empresaId no documento do funcionário
    await this.funcionarioCollection.doc(funcionarioId).update({
      empresaId: empresaDoc.id,
    });

    const atualizado = await empresaDoc.ref.get();
    return { id: atualizado.id, ...atualizado.data() };
  }

  // Buscar todas empresas
  async findAll() {
    const snapshot = await this.empresaCollection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // Buscar empresa por ID
  async findOne(id: string) {
    const doc = await this.empresaCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Empresa não encontrada');
    }
    return { id: doc.id, ...doc.data() };
  }

  // Atualizar empresa
  async update(id: string, updateEmpresaDto: UpdateEmpresaDto) {
    const docRef = this.empresaCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Empresa não encontrada');
    }
    await docRef.update({ ...updateEmpresaDto } as any);
    const updated = await docRef.get();
    return { id: updated.id, ...updated.data() };
  }

  // Remover empresa
  async remove(id: string) {
    const docRef = this.empresaCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Empresa não encontrada');
    }
    await docRef.delete();
    return { message: 'Empresa removida com sucesso' };
  }

  // Buscar empresa por UID do funcionário (corrigido para array-contains)
  async findByFuncionarioId(funcionarioId: string) {
    const snapshot = await this.empresaCollection
      .where('membros', 'array-contains', funcionarioId)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException(
        'Empresa não encontrada para este funcionário',
      );
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    return {
      id: doc.id,
      nome: data.nome,
      cnpj: data.cnpj,
      email: data.email,
      telefone: data.telefone,
      endereco: data.endereco,
      membros: data.membros ?? [],
    };
  }

  // Gerar código de convite
  async gerarConvite(empresaId: string) {
    const codigo = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    await this.empresaCollection.doc(empresaId).update({
      conviteCodigo: codigo,
    });
    return { codigo };
  }
}
