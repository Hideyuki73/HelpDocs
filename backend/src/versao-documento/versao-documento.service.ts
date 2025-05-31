import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateVersaoDocumentoDto } from './dto/create-versao-documento.dto';
import { UpdateVersaoDocumentoDto } from './dto/update-versao-documento.dto';

@Injectable()
export class VersaoDocumentoService {
  private readonly collection;
  private readonly documentoCollection;
  private readonly funcionarioCollection;

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('versoes-documento');
    this.documentoCollection = this.firestore.collection('documentos');
    this.funcionarioCollection = this.firestore.collection('funcionarios');
  }

  async create(data: CreateVersaoDocumentoDto) {
    const documentoDoc = await this.documentoCollection
      .doc(data.documentoId)
      .get();
    if (!documentoDoc.exists) {
      throw new NotFoundException('Documento não encontrado.');
    }
    const funcionarioDoc = await this.funcionarioCollection
      .doc(data.criadoPor)
      .get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário criador não encontrado.');
    }

    const docRef = await this.collection.add({
      documentoId: this.documentoCollection.doc(data.documentoId),
      numeroVersao: data.numeroVersao,
      conteudo: data.conteudo,
      criadoPor: this.funcionarioCollection.doc(data.criadoPor),
      dataCriacao: new Date(),
    });
    const doc = await docRef.get();
    return this.mapVersao(doc);
  }

  async findAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => this.mapVersao(doc));
  }

  async findOne(id: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Versão não encontrada');
    }
    return this.mapVersao(doc);
  }

  async update(id: string, data: UpdateVersaoDocumentoDto) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Versão não encontrada');
    }
    await docRef.update({ ...data } as any);
    const updated = await docRef.get();
    return this.mapVersao(updated);
  }

  async remove(id: string) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Versão não encontrada');
    }
    await docRef.delete();
    return { message: 'Versão deletada com sucesso' };
  }

  private mapVersao(doc: FirebaseFirestore.DocumentSnapshot) {
    const data = doc.data();
    return {
      id: doc.id,
      documentoId: data?.documentoId?.id || null,
      numeroVersao: data?.numeroVersao,
      conteudo: data?.conteudo,
      criadoPor: data?.criadoPor?.id || null,
      dataCriacao: data?.dataCriacao,
    };
  }
}
