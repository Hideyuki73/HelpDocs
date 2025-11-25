import {
  Injectable,
  Inject,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';
import { auth } from 'firebase-admin';

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
    console.log(`[FuncionarioService] Buscando funcionário com ID: ${id}`);
    const doc = await this.funcionarioCollection.doc(id).get();
    if (!doc.exists) {
      console.log(
        `[FuncionarioService] Funcionário com ID ${id} não encontrado.`,
      );
      throw new NotFoundException('Funcionário não encontrado');
    }
    console.log(`[FuncionarioService] Funcionário com ID ${id} encontrado.`);
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

    const funcionarioData = doc.data();
    const uid = doc.id;

    // Primeiro, tentamos deletar do Firebase Authentication
    try {
      await auth().deleteUser(uid);
      console.log(`Usuário deletado do Firebase Authentication com sucesso`);
    } catch (firebaseError) {
      console.error(
        'Erro ao deletar usuário do Firebase Authentication:',
        firebaseError,
      );

      // Se o erro for "user not found", continuamos com a exclusão do Firestore
      if (firebaseError.code === 'auth/user-not-found') {
        console.log(
          'Usuário não encontrado no Firebase Authentication, continuando com exclusão do Firestore',
        );
      } else {
        // Para outros erros, lançamos uma exceção
        throw new InternalServerErrorException(
          'Erro ao deletar usuário do Firebase Authentication: ' +
            firebaseError.message,
        );
      }
    }

    // Depois deletamos do Firestore
    try {
      await docRef.delete();
      console.log(`Funcionário deletado do Firestore com sucesso`);
      return {
        message: 'Funcionário e usuário do Firebase deletados com sucesso',
      };
    } catch (firestoreError) {
      console.error(
        'Erro ao deletar funcionário do Firestore:',
        firestoreError,
      );
      throw new InternalServerErrorException(
        'Erro ao deletar funcionário do Firestore: ' + firestoreError.message,
      );
    }
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
    if (alvoCargo && requesterCargo.grau >= alvoCargo.grau) {
      // Permite que um admin rebaixe outro admin, mas verifica se é o único admin
      if (
        alvoCargo.nome === 'Administrador' &&
        novoCargoObj.nome !== 'Administrador'
      ) {
        const empresaId = funcionarioData.empresaId;
        const adminSnapshot = await this.funcionarioCollection
          .where('empresaId', '==', empresaId)
          .where('cargo', '==', 'Administrador')
          .get();
        const numAdmins = adminSnapshot.docs.length;

        if (numAdmins === 1 && funcionarioId === adminSnapshot.docs[0].id) {
          throw new UnauthorizedException(
            'Você não pode rebaixar o único administrador da empresa.',
          );
        }
      }

      // Bloquear rebaixamento de cargo se o requisitante não tiver permissão
      if (funcionarioId !== requesterId) {
        throw new UnauthorizedException(
          `Você não tem permissão para alterar o cargo de alguém com mesmo ou maior nível que ${requesterCargo.nome}.`,
        );
      }
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

    // Bloquear auto-rebaixamento de Administrador para não-Administrador se for o único
    if (
      funcionarioId === requesterId &&
      alvoCargo?.nome === 'Administrador' &&
      novoCargoObj.nome !== 'Administrador'
    ) {
      const empresaId = funcionarioData.empresaId;
      const adminSnapshot = await this.funcionarioCollection
        .where('empresaId', '==', empresaId)
        .where('cargo', '==', 'Administrador')
        .get();
      const numAdmins = adminSnapshot.docs.length;

      if (numAdmins === 1) {
        throw new UnauthorizedException(
          'Você não pode se rebaixar, pois é o único administrador da empresa.',
        );
      }
    }

    // Caso o funcionário alvo seja o criador da empresa e não seja o requisitante
    if (funcionarioData.empresaId && funcionarioId !== requesterId) {
      const empresaDoc = await this.empresaCollection
        .doc(funcionarioData.empresaId)
        .get();
      const empresaData = empresaDoc.data();
      if (empresaData && empresaData.criadorId?.id === funcionarioId) {
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
