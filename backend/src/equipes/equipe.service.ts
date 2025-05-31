import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateEquipeDto } from './dto/create-equipe.dto';
import { UpdateEquipeDto } from './dto/update-equipe.dto';

@Injectable()
export class EquipeService {
  private equipeCollection;
  private documentoCollection;
  private funcionarioCollection;

  constructor(@Inject('FIRESTORE') private firestore: Firestore) {
    this.equipeCollection = this.firestore.collection('equipes');
    // Supondo que os documentos estejam na coleção "documentos"
    this.documentoCollection = this.firestore.collection('documentos');
    // Funcionários estão na coleção "funcionarios"
    this.funcionarioCollection = this.firestore.collection('funcionarios');
  }

  async create(data: CreateEquipeDto) {
    // Validação: Verifica se o documento atribuído existe
    const docDoc = await this.documentoCollection.doc(data.documentoId).get();
    if (!docDoc.exists) {
      throw new NotFoundException('Documento não encontrado para a equipe.');
    }

    // Validação: Verifica se o funcionário criador existe
    const criadorDoc = await this.funcionarioCollection
      .doc(data.criadorId)
      .get();
    if (!criadorDoc.exists) {
      throw new NotFoundException('Funcionário criador não encontrado.');
    }

    // Validação opcional: Verifica se cada membro informado existe
    if (data.membros && data.membros.length > 0) {
      for (const memberId of data.membros) {
        const memberDoc = await this.funcionarioCollection.doc(memberId).get();
        if (!memberDoc.exists) {
          throw new NotFoundException(
            `Membro com id ${memberId} não encontrado.`,
          );
        }
      }
    }

    // Criação da equipe
    const equipeData = {
      ...data,
      dataCadastro: new Date(),
    };
    const docRef = await this.equipeCollection.add(equipeData);
    const docSnap = await docRef.get();
    return { id: docSnap.id, ...docSnap.data() };
  }

  async findAll() {
    const snapshot = await this.equipeCollection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async findOne(id: string) {
    const doc = await this.equipeCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }
    return { id: doc.id, ...doc.data() };
  }

  async update(id: string, data: UpdateEquipeDto) {
    // Validação: Caso esteja atualizando documento, criador ou membros, valide-os
    if (data.documentoId) {
      const docDoc = await this.documentoCollection.doc(data.documentoId).get();
      if (!docDoc.exists) {
        throw new NotFoundException('Documento não encontrado.');
      }
    }
    if (data.criadorId) {
      const criadorDoc = await this.funcionarioCollection
        .doc(data.criadorId)
        .get();
      if (!criadorDoc.exists) {
        throw new NotFoundException('Funcionário criador não encontrado.');
      }
    }
    if (data.membros && data.membros.length > 0) {
      for (const memberId of data.membros) {
        const memberDoc = await this.funcionarioCollection.doc(memberId).get();
        if (!memberDoc.exists) {
          throw new NotFoundException(
            `Membro com id ${memberId} não encontrado.`,
          );
        }
      }
    }

    const equipeDoc = await this.equipeCollection.doc(id).get();
    if (!equipeDoc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }

    await this.equipeCollection.doc(id).update({ ...data } as any);
    const updatedDoc = await this.equipeCollection.doc(id).get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }

  async remove(id: string) {
    const doc = await this.equipeCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }
    await this.equipeCollection.doc(id).delete();
    return { message: 'Equipe removida com sucesso.' };
  }
}
