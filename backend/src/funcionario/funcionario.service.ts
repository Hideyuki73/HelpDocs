import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';

@Injectable()
export class FuncionarioService {
  private funcionarioCollection;
  private empresaCollection;

  // Hierarquia de cargos (quanto menor o grau, maior o poder)
  private readonly cargos = [
    { nome: 'Administrador', grau: 1 },
    { nome: 'Gerente de Projetos', grau: 2 },
    { nome: 'Desenvolvedor', grau: 3 },
  ];

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

  async findByEmpresaId(empresaId: string) {
    const snapshot = await this.funcionarioCollection
      .where('empresaId', '==', empresaId)
      .get();
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
  async updateCargo(
    funcionarioId: string,
    novoCargo: string,
    requesterId: string,
  ) {
    const getCargo = (nome: string) => this.cargos.find((c) => c.nome === nome);

    // Verificar se o funcionário alvo existe
    const funcionarioDoc = await this.funcionarioCollection
      .doc(funcionarioId)
      .get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário alvo não encontrado');
    }
    const funcionarioData = funcionarioDoc.data();

    // Verificar se o requisitante existe
    const requesterDoc = await this.funcionarioCollection
      .doc(requesterId)
      .get();
    if (!requesterDoc.exists) {
      throw new UnauthorizedException('Requisitante não encontrado');
    }
    const requesterData = requesterDoc.data();

    const requesterCargo = getCargo(requesterData?.cargo);
    const alvoCargo = getCargo(funcionarioData?.cargo);
    const novoCargoObj = getCargo(novoCargo);

    if (!requesterCargo || !novoCargoObj) {
      throw new NotFoundException(
        'Cargo inválido. Cargos permitidos: ' +
          this.cargos.map((c) => c.nome).join(', '),
      );
    }

    // Regra: só pode alterar cargo de alguém com grau maior (menos poder)
    if (
      alvoCargo &&
      requesterCargo.grau >= alvoCargo.grau &&
      requesterId !== funcionarioId
    ) {
      throw new UnauthorizedException(
        `Você não tem permissão para alterar o cargo de alguém com mesmo ou maior nível que ${requesterCargo.nome}.`,
      );
    }

    // Bloquear auto-promoção para cargo superior
    if (
      funcionarioId === requesterId &&
      novoCargoObj.grau < requesterCargo.grau
    ) {
      throw new UnauthorizedException(
        `Você não pode se promover de ${requesterCargo.nome} para ${novoCargo}.`,
      );
    }

    // Caso o funcionário alvo seja o criador da empresa
    if (funcionarioData.empresaId) {
      const empresaDoc = await this.empresaCollection
        .doc(funcionarioData.empresaId)
        .get();
      const empresaData = empresaDoc.data();
      if (
        empresaData &&
        empresaData.criadorUid === funcionarioId &&
        funcionarioId !== requesterId
      ) {
        throw new UnauthorizedException(
          'O cargo do criador da empresa só pode ser alterado por ele mesmo.',
        );
      }
    }

    // Atualizar cargo
    await this.funcionarioCollection
      .doc(funcionarioId)
      .update({ cargo: novoCargo });

    const updatedFuncionario = await this.funcionarioCollection
      .doc(funcionarioId)
      .get();
    return this.mapFuncionario(updatedFuncionario);
  }

  private mapFuncionario(doc: FirebaseFirestore.DocumentSnapshot) {
    const data = doc.data();
    return {
      id: doc.id,
      nome: data?.nome,
      email: data?.email,
      cargo: data?.cargo,
      empresaId:
        data?.empresaId &&
        typeof data.empresaId === 'object' &&
        'id' in data.empresaId
          ? data.empresaId.id
          : data?.empresaId || null,
      dataCadastro: data?.dataCadastro,
    };
  }
}
