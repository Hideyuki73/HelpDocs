import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore, DocumentReference } from 'firebase-admin/firestore';
import { CreateEquipeDto } from './dto/create-equipe.dto';
import { UpdateEquipeDto } from './dto/update-equipe.dto';

@Injectable()
export class EquipeService {
  private equipeCollection;
  private documentoCollection;
  private funcionarioCollection;

  constructor(@Inject('FIRESTORE') private firestore: Firestore) {
    this.equipeCollection = this.firestore.collection('equipes');
    this.documentoCollection = this.firestore.collection('documentos');
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

    // Criação da equipe com referências
    const equipeData = {
      nome: data.nome,
      documentoId: this.documentoCollection.doc(data.documentoId),
      criadorId: this.funcionarioCollection.doc(data.criadorId),
      membros:
        data.membros?.map((id) => this.funcionarioCollection.doc(id)) || [],
      dataCadastro: new Date(),
    };
    const docRef = await this.equipeCollection.add(equipeData);
    const docSnap = await docRef.get();
    return this.mapEquipe(docSnap);
  }

  async findAll() {
    const snapshot = await this.equipeCollection.get();
    return Promise.all(snapshot.docs.map((doc) => this.mapEquipe(doc)));
  }

  async findOne(id: string) {
    const doc = await this.equipeCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }
    return this.mapEquipe(doc);
  }

  async update(id: string, data: UpdateEquipeDto) {
    // Validação: Caso esteja atualizando documento, criador ou membros, valide-os
    const updateData: any = {};

    if (data.nome !== undefined) {
      updateData.nome = data.nome;
    }

    if (data.documentoId) {
      const docDoc = await this.documentoCollection.doc(data.documentoId).get();
      if (!docDoc.exists) {
        throw new NotFoundException('Documento não encontrado.');
      }
      updateData.documentoId = this.documentoCollection.doc(data.documentoId);
    }

    if (data.criadorId) {
      const criadorDoc = await this.funcionarioCollection
        .doc(data.criadorId)
        .get();
      if (!criadorDoc.exists) {
        throw new NotFoundException('Funcionário criador não encontrado.');
      }
      updateData.criadorId = this.funcionarioCollection.doc(data.criadorId);
    }

    if (data.membros) {
      for (const memberId of data.membros) {
        const memberDoc = await this.funcionarioCollection.doc(memberId).get();
        if (!memberDoc.exists) {
          throw new NotFoundException(
            `Membro com id ${memberId} não encontrado.`,
          );
        }
      }
      updateData.membros = data.membros.map((id) =>
        this.funcionarioCollection.doc(id),
      );
    }

    const equipeDoc = await this.equipeCollection.doc(id).get();
    if (!equipeDoc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }

    await this.equipeCollection.doc(id).update(updateData);
    const updatedDoc = await this.equipeCollection.doc(id).get();
    return this.mapEquipe(updatedDoc);
  }

  async remove(id: string) {
    const doc = await this.equipeCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }
    await this.equipeCollection.doc(id).delete();
    return { message: 'Equipe removida com sucesso.' };
  }

  /**
   * Mapeia o documento da equipe para retornar os IDs das referências.
   */
  private mapEquipe(doc: FirebaseFirestore.DocumentSnapshot) {
    const data = doc.data();
    return {
      id: doc.id,
      nome: data?.nome,
      documentoId: data?.documentoId?.id || null,
      criadorId: data?.criadorId?.id || null,
      membros: Array.isArray(data?.membros)
        ? data.membros.map((ref: DocumentReference) => ref.id)
        : [],
      dataCadastro: data?.dataCadastro,
    };
  }
}
