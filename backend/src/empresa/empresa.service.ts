import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmpresaService {
  private readonly empresaCollection;
  private readonly funcionarioCollection;
  private readonly empresaUsuarioRoleCollection; // Nova coleção para roles
  private readonly conviteCollection; // Nova coleção para convites

  constructor(
    @Inject('FIRESTORE') private readonly firestore: Firestore,
  ) {
    this.empresaCollection = this.firestore.collection('empresas');
    this.funcionarioCollection = this.firestore.collection('funcionarios');
    this.empresaUsuarioRoleCollection = this.firestore.collection('empresa_usuarios_roles');
    this.conviteCollection = this.firestore.collection('convites');
  }

  async create(createEmpresaDto: CreateEmpresaDto, criadorUid: string) {
    // 1. Verificar se já existe uma empresa com o mesmo nome para este criador
    const existingCompanySnapshot = await this.empresaCollection
      .where("nome", "==", createEmpresaDto.nome)
      .where("criadorUid", "==", criadorUid) // Opcional: verificar apenas para o mesmo criador
      .limit(1)
      .get();

    if (!existingCompanySnapshot.empty) {
      throw new BadRequestException("Você já possui uma empresa com este nome.");
    }

    const criadorRef = this.funcionarioCollection.doc(criadorUid);
    const docRef = await this.empresaCollection.add({
      ...createEmpresaDto,
      criadorUid,
      criadorRef,
      dataCadastro: new Date(),
    });
    const doc = await docRef.get();
    const empresaCriada = { id: doc.id, ...doc.data() };

    // Atribui o papel de administrador ao usuário que criou a empresa
    await this.assignRole(empresaCriada.id, criadorUid, 'admin');

    return empresaCriada;
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

  async findByUserId(userId: string) {
    const snapshot = await this.empresaCollection.where('criadorUid', '==', userId).get();
    if (snapshot.empty) {
      throw new NotFoundException('Nenhuma empresa encontrada para este usuário.');
    }
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async addEmployee(empresaId: string, employeeId: string) {
    const empresaRef = this.empresaCollection.doc(empresaId);
    const empresaDoc = await empresaRef.get();

    if (!empresaDoc.exists) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    const currentEmployees = empresaDoc.data().funcionarios || [];
    if (currentEmployees.includes(employeeId)) {
      throw new BadRequestException('Funcionário já adicionado a esta empresa.');
    }

    await empresaRef.update({
      funcionarios: [...currentEmployees, employeeId],
    });

    return { message: 'Funcionário adicionado com sucesso.' };
  }

  async removeEmployee(empresaId: string, employeeId: string) {
    const empresaRef = this.empresaCollection.doc(empresaId);
    const empresaDoc = await empresaRef.get();

    if (!empresaDoc.exists) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    const currentEmployees = empresaDoc.data().funcionarios || [];
    const updatedEmployees = currentEmployees.filter((id: string) => id !== employeeId);

    if (updatedEmployees.length === currentEmployees.length) {
      throw new NotFoundException('Funcionário não encontrado nesta empresa.');
    }

    await empresaRef.update({
      funcionarios: updatedEmployees,
    });

    return { message: 'Funcionário removido com sucesso.' };
  }

  async getEmployees(empresaId: string) {
    const empresaDoc = await this.empresaCollection.doc(empresaId).get();

    if (!empresaDoc.exists) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    return empresaDoc.data().funcionarios || [];
  }

  // Métodos de gerenciamento de papéis
  async assignRole(empresaId: string, usuarioId: string, role: string) {
    const docRef = await this.empresaUsuarioRoleCollection.add({
      empresaId,
      usuarioId,
      role,
      dataAtribuicao: new Date(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  }

  async getRole(empresaId: string, usuarioId: string): Promise<string | null> {
    const snapshot = await this.empresaUsuarioRoleCollection
      .where('empresaId', '==', empresaId)
      .where('usuarioId', '==', usuarioId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data().role;
  }

  // Métodos de gerenciamento de convites
  async generateInviteCode(empresaId: string, criadorUid: string) {
    const code = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const docRef = await this.conviteCollection.add({
      code,
      empresaId,
      criadorUid,
      expiresAt,
      usedBy: null,
      usedAt: null,
      isActive: true,
      createdAt: new Date(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() };
  }

  async useInviteCode(code: string, usuarioId: string) {
    const snapshot = await this.conviteCollection.where('code', '==', code).limit(1).get();

    if (snapshot.empty) {
      throw new NotFoundException('Código de convite inválido ou não encontrado.');
    }

    const conviteDoc = snapshot.docs[0];
    const conviteData = conviteDoc.data();

    if (!conviteData.isActive || conviteData.expiresAt.toDate() < new Date()) {
      throw new BadRequestException('Código de convite expirado ou inativo.');
    }

    if (conviteData.usedBy) {
      throw new BadRequestException('Código de convite já utilizado.');
    }

    await conviteDoc.ref.update({
      usedBy: usuarioId,
      usedAt: new Date(),
      isActive: false,
    });

    return { empresaId: conviteData.empresaId };
  }

  async getInviteCodesByEmpresa(empresaId: string) {
    const snapshot = await this.conviteCollection.where('empresaId', '==', empresaId).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

