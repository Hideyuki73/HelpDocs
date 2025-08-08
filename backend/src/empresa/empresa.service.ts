import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

@Injectable()
export class EmpresaService {
  private readonly empresaCollection;
  private readonly funcionarioCollection;

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    this.empresaCollection = this.firestore.collection('empresas');
    this.funcionarioCollection = this.firestore.collection('funcionarios');
  }

  async create(createEmpresaDto: CreateEmpresaDto, criadorUid: string) {
    // armazena criadorId como ref para o documento do funcionário (ou apenas o uid)
    const criadorRef = this.funcionarioCollection.doc(criadorUid); // se seus funcionários tiverem doc com id = uid
    const docRef = await this.empresaCollection.add({
      ...createEmpresaDto,
      criadorUid,
      criadorRef,
      dataCadastro: new Date(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
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
}
