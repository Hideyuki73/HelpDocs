import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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

  async create(data: CreateEquipeDto, criadorId: string) {
    // Validação: Verifica se o funcionário criador existe
    const criadorDoc = await this.funcionarioCollection.doc(criadorId).get();
    if (!criadorDoc.exists) {
      throw new NotFoundException('Funcionário criador não encontrado.');
    }

    // Validação de cargo do criador - apenas Admin e Gerente de Projetos podem criar equipes
    const criadorData = criadorDoc.data();
    if (
      criadorData.cargo !== 'Administrador' &&
      criadorData.cargo !== 'Gerente de Projetos'
    ) {
      throw new ForbiddenException(
        'Apenas Administradores e Gerentes de Projetos podem criar equipes.',
      );
    }

    // Validação: Verifica se o documento atribuído existe (se fornecido)
    if (data.documentoId) {
      const docDoc = await this.documentoCollection.doc(data.documentoId).get();
      if (!docDoc.exists) {
        throw new NotFoundException('Documento não encontrado para a equipe.');
      }
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
      documentoId: data.documentoId
        ? this.documentoCollection.doc(data.documentoId)
        : null,
      criadorId: this.funcionarioCollection.doc(criadorId),
      membros:
        data.membros?.map((id) => this.funcionarioCollection.doc(id)) || [],
      dataCadastro: new Date(),
      empresaId: criadorData.empresaId, // Adiciona empresaId da equipe baseado no criador
    };

    const docRef = await this.equipeCollection.add(equipeData);
    const docSnap = await docRef.get();
    return this.mapEquipe(docSnap);
  }

  async addMembros(equipeId: string, membros: string[], usuarioId: string) {
    const equipeDoc = await this.equipeCollection.doc(equipeId).get();
    if (!equipeDoc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }

    // Verifica permissões do usuário
    const usuarioDoc = await this.funcionarioCollection.doc(usuarioId).get();
    if (!usuarioDoc.exists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const usuarioData = usuarioDoc.data();
    if (
      usuarioData.cargo !== 'Administrador' &&
      usuarioData.cargo !== 'Gerente de Projetos'
    ) {
      throw new ForbiddenException(
        'Apenas Administradores e Gerentes de Projetos podem adicionar membros.',
      );
    }

    // Valida se todos os membros existem
    for (const memberId of membros) {
      const memberDoc = await this.funcionarioCollection.doc(memberId).get();
      if (!memberDoc.exists) {
        throw new NotFoundException(
          `Membro com id ${memberId} não encontrado.`,
        );
      }
    }

    // Recupera membros atuais e adiciona os novos (sem duplicar)
    const data = equipeDoc.data();
    const membrosAtuais: DocumentReference[] = Array.isArray(data?.membros)
      ? data.membros
      : [];
    const membrosAtuaisIds = membrosAtuais.map((ref) => ref.id);

    const novosMembrosRefs = membros
      .filter((id) => !membrosAtuaisIds.includes(id))
      .map((id) => this.funcionarioCollection.doc(id));

    const membrosAtualizados = [...membrosAtuais, ...novosMembrosRefs];

    await this.equipeCollection
      .doc(equipeId)
      .update({ membros: membrosAtualizados });
    const updatedDoc = await this.equipeCollection.doc(equipeId).get();
    return this.mapEquipe(updatedDoc);
  }

  async removeMembro(equipeId: string, membroId: string, usuarioId: string) {
    const equipeDoc = await this.equipeCollection.doc(equipeId).get();
    if (!equipeDoc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }

    // Verifica permissões do usuário
    const usuarioDoc = await this.funcionarioCollection.doc(usuarioId).get();
    if (!usuarioDoc.exists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const usuarioData = usuarioDoc.data();
    if (
      usuarioData.cargo !== 'Administrador' &&
      usuarioData.cargo !== 'Gerente de Projetos'
    ) {
      throw new ForbiddenException(
        'Apenas Administradores e Gerentes de Projetos podem remover membros.',
      );
    }

    // Remove o membro da equipe
    const data = equipeDoc.data();
    const membrosAtuais: DocumentReference[] = Array.isArray(data?.membros)
      ? data.membros
      : [];
    const membrosAtualizados = membrosAtuais.filter(
      (ref) => ref.id !== membroId,
    );

    await this.equipeCollection
      .doc(equipeId)
      .update({ membros: membrosAtualizados });
    const updatedDoc = await this.equipeCollection.doc(equipeId).get();
    return this.mapEquipe(updatedDoc);
  }

  async findAll(usuarioId: string) {
    const usuarioDoc = await this.funcionarioCollection.doc(usuarioId).get();
    if (!usuarioDoc.exists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const usuarioData = usuarioDoc.data();

    // Administradores e Gerentes de Projetos veem todas as equipes da empresa
    if (
      usuarioData.cargo === 'Administrador' ||
      usuarioData.cargo === 'Gerente de Projetos'
    ) {
      const snapshot = await this.equipeCollection
        .where('empresaId', '==', usuarioData.empresaId)
        .get();
      return Promise.all(snapshot.docs.map((doc) => this.mapEquipe(doc)));
    }

    // Desenvolvedores veem apenas equipes onde são membros
    const snapshot = await this.equipeCollection
      .where(
        'membros',
        'array-contains',
        this.funcionarioCollection.doc(usuarioId),
      )
      .get();
    return Promise.all(snapshot.docs.map((doc) => this.mapEquipe(doc)));
  }

  async findOne(id: string, usuarioId: string) {
    const doc = await this.equipeCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }

    const usuarioDoc = await this.funcionarioCollection.doc(usuarioId).get();
    if (!usuarioDoc.exists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const usuarioData = usuarioDoc.data();
    const equipeData = doc.data();

    // Verifica se o usuário tem permissão para ver esta equipe
    const isAdmin = usuarioData.cargo === 'Administrador';
    const isGerente = usuarioData.cargo === 'Gerente de Projetos';
    const isMembro = equipeData.membros?.some(
      (ref: DocumentReference) => ref.id === usuarioId,
    );

    if (!isAdmin && !isGerente && !isMembro) {
      throw new ForbiddenException(
        'Você não tem permissão para ver esta equipe.',
      );
    }

    return this.mapEquipe(doc);
  }

  async update(id: string, data: UpdateEquipeDto, usuarioId: string) {
    // Verifica permissões do usuário
    const usuarioDoc = await this.funcionarioCollection.doc(usuarioId).get();
    if (!usuarioDoc.exists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const usuarioData = usuarioDoc.data();
    if (
      usuarioData.cargo !== 'Administrador' &&
      usuarioData.cargo !== 'Gerente de Projetos'
    ) {
      throw new ForbiddenException(
        'Apenas Administradores e Gerentes de Projetos podem atualizar equipes.',
      );
    }

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

  async remove(id: string, usuarioId: string) {
    // Verifica permissões do usuário - apenas Administradores podem deletar equipes
    const usuarioDoc = await this.funcionarioCollection.doc(usuarioId).get();
    if (!usuarioDoc.exists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const usuarioData = usuarioDoc.data();
    if (usuarioData.cargo !== 'Administrador') {
      throw new ForbiddenException(
        'Apenas Administradores podem deletar equipes.',
      );
    }

    const doc = await this.equipeCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }

    await this.equipeCollection.doc(id).delete();
    return { message: 'Equipe removida com sucesso.' };
  }

  async getEquipeStats(usuarioId: string) {
    const usuarioDoc = await this.funcionarioCollection.doc(usuarioId).get();
    if (!usuarioDoc.exists) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    const usuarioData = usuarioDoc.data();

    // Apenas Administradores e Gerentes de Projetos podem ver estatísticas
    if (
      usuarioData.cargo !== 'Administrador' &&
      usuarioData.cargo !== 'Gerente de Projetos'
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para ver estatísticas de equipes.',
      );
    }

    const snapshot = await this.equipeCollection
      .where('empresaId', '==', usuarioData.empresaId)
      .get();

    const equipes = await Promise.all(
      snapshot.docs.map((doc) => this.mapEquipe(doc)),
    );

    const totalEquipes = equipes.length;
    const totalMembros = equipes.reduce(
      (acc, equipe) => acc + equipe.membros.length,
      0,
    );
    const equipesComDocumento = equipes.filter(
      (equipe) => equipe.documentoId,
    ).length;

    return {
      totalEquipes,
      totalMembros,
      equipesComDocumento,
      equipeSemDocumento: totalEquipes - equipesComDocumento,
      mediaMembrosPorEquipe:
        totalEquipes > 0 ? Math.round(totalMembros / totalEquipes) : 0,
    };
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
      dataCadastro: data?.dataCadastro.toDate().toISOString(),
      empresaId: data?.empresaId || null,
    };
  }

  async findEquipesByUsuario(usuarioId: string) {
    const funcionarioDoc = await this.funcionarioCollection
      .doc(usuarioId)
      .get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário não encontrado.');
    }

    const equipesSnapshot = await this.equipeCollection
      .where(
        'membros',
        'array-contains',
        this.funcionarioCollection.doc(usuarioId),
      )
      .get();

    return equipesSnapshot.docs.map((doc) => this.mapEquipe(doc));
  }
}
