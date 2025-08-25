import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Firestore } from 'firebase-admin/firestore';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import * as admin from 'firebase-admin';

export class EmpresaService {
  private empresaCollection = admin.firestore().collection('empresas');
  private funcionarioCollection = admin.firestore().collection('funcionarios');

  async create(createEmpresaDto: CreateEmpresaDto, criadorUid: string) {
    // cria referência ao criador (se os funcionários estão em uma coleção separada)
    const criadorRef = this.funcionarioCollection.doc(criadorUid);

    // gera um código de convite único (pode customizar formato se quiser)
    const conviteCodigo = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();

    const docRef = await this.empresaCollection.add({
      ...createEmpresaDto,
      criadorUid,
      criadorRef,
      conviteCodigo,
      membros: [criadorUid], // adiciona o criador como membro inicial
      dataCadastro: new Date(),
    });

    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  }

  async entrarPorConvite(conviteCodigo: string, userUid: string) {
    // procura empresa pelo código de convite
    const snapshot = await this.empresaCollection
      .where('conviteCodigo', '==', conviteCodigo)
      .get();
    if (snapshot.empty) {
      throw new Error('Código de convite inválido');
    }

    const empresaDoc = snapshot.docs[0];
    const empresaData = empresaDoc.data();

    // se já é membro, não adiciona de novo
    if (empresaData.membros.includes(userUid)) {
      return { id: empresaDoc.id, ...empresaData };
    }

    // adiciona usuário à lista de membros
    await empresaDoc.ref.update({
      membros: admin.firestore.FieldValue.arrayUnion(userUid),
    });

    const atualizado = await empresaDoc.ref.get();
    return { id: atualizado.id, ...atualizado.data() };
  }

  async findAll() {
    const snapshot = await this.empresaCollection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const doc = await this.empresaCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Empresa não encontrada');
    }
    return { id: doc.id, ...doc.data() };
  }

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

  async remove(id: string) {
    const docRef = this.empresaCollection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Empresa não encontrada');
    }
    await docRef.delete();
    return { message: 'Empresa removida com sucesso' };
  }

  async findByFuncionarioId(funcionarioId: string) {
    const snapshot = await this.empresaCollection
      .where('criadorUid', '==', funcionarioId)
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

  async gerarConvite(empresaId: string) {
    const codigo = randomBytes(4).toString('hex'); // ex: "a3f9b1c2"
    await this.empresaCollection.doc(empresaId).update({
      conviteCodigo: codigo,
    });
    return { codigo };
  }
}
