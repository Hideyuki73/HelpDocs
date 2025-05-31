import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';

@Injectable()
export class DocumentoService {
  private readonly collection;
  private readonly empresaCollection;
  private readonly funcionarioCollection;

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('documentos');
    this.empresaCollection = this.firestore.collection('empresas');
    this.funcionarioCollection = this.firestore.collection('funcionarios');
  }

  async create(data: CreateDocumentoDto) {
    // Validação das referências
    const empresaDoc = await this.empresaCollection.doc(data.empresaId).get();
    if (!empresaDoc.exists) {
      throw new NotFoundException('Empresa não encontrada.');
    }
    const funcionarioDoc = await this.funcionarioCollection
      .doc(data.criadoPor)
      .get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário criador não encontrado.');
    }

    const docRef = await this.collection.add({
      titulo: data.titulo,
      descricao: data.descricao,
      empresaId: this.empresaCollection.doc(data.empresaId),
      criadoPor: this.funcionarioCollection.doc(data.criadoPor),
      dataCriacao: new Date(),
    });
    const doc = await docRef.get();
    return this.mapDocumento(doc);
  }

  async findAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => this.mapDocumento(doc));
  }

  async findOne(id: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Documento não encontrado');
    }
    return this.mapDocumento(doc);
  }

  async update(id: string, data: UpdateDocumentoDto) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Documento não encontrado');
    }
    const updateData: any = { ...data };
    if (data.empresaId) {
      const empresaDoc = await this.empresaCollection.doc(data.empresaId).get();
      if (!empresaDoc.exists) {
        throw new NotFoundException('Empresa não encontrada.');
      }
      updateData.empresaId = this.empresaCollection.doc(data.empresaId);
    }
    if (data.criadoPor) {
      const funcionarioDoc = await this.funcionarioCollection
        .doc(data.criadoPor)
        .get();
      if (!funcionarioDoc.exists) {
        throw new NotFoundException('Funcionário criador não encontrado.');
      }
      updateData.criadoPor = this.funcionarioCollection.doc(data.criadoPor);
    }
    await docRef.update(updateData as any);
    const updated = await docRef.get();
    return this.mapDocumento(updated);
  }

  async remove(id: string) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Documento não encontrado');
    }
    await docRef.delete();
    return { message: 'Documento deletado com sucesso' };
  }

  private mapDocumento(doc: FirebaseFirestore.DocumentSnapshot) {
    const data = doc.data();
    return {
      id: doc.id,
      titulo: data?.titulo,
      descricao: data?.descricao,
      empresaId: data?.empresaId?.id || null,
      criadoPor: data?.criadoPor?.id || null,
      dataCriacao: data?.dataCriacao,
    };
  }
}
