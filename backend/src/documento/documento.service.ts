import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { UploadDocumentoDto } from './dto/upload-documento.dto';

@Injectable()
export class DocumentoService {
  private readonly collection;
  private readonly empresaCollection;
  private readonly funcionarioCollection;
  private readonly equipeCollection;

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('documentos');
    this.empresaCollection = this.firestore.collection('empresas');
    this.funcionarioCollection = this.firestore.collection('funcionarios');
    this.equipeCollection = this.firestore.collection('equipes');
  }

  async create(data: CreateDocumentoDto) {
    // Verifica se o funcionário criador existe
    const funcionarioDoc = await this.funcionarioCollection
      .doc(data.criadoPor)
      .get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário criador não encontrado.');
    }

    const funcionarioData = funcionarioDoc.data();
    if (!funcionarioData?.empresaId) {
      throw new NotFoundException('Funcionário não possui empresa vinculada.');
    }

    // Verifica se a equipe existe
    const equipeDoc = await this.equipeCollection.doc(data.equipeId).get();
    if (!equipeDoc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }

    const equipeData = equipeDoc.data();

    // Valida se o criador realmente faz parte da equipe
    const isMembro = equipeData?.membros?.some(
      (ref: any) => ref.id === data.criadoPor,
    );
    if (!isMembro) {
      throw new ForbiddenException(
        'Você não tem permissão para criar documentos nesta equipe.',
      );
    }

    // Criação do documento com empresaId vindo do criador
    const docRef = await this.collection.add({
      titulo: data.titulo,
      descricao: data.descricao,
      conteudo: data.conteudo || '',
      tipo: data.tipo,
      arquivoUrl: data.arquivoUrl || null,
      nomeArquivo: data.nomeArquivo || null,
      tamanhoArquivo: data.tamanhoArquivo || null,
      empresaId: this.empresaCollection.doc(funcionarioData.empresaId), // herdado do criador
      equipeId: this.equipeCollection.doc(data.equipeId),
      criadoPor: this.funcionarioCollection.doc(data.criadoPor),
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      versao: 1,
      status: data.status || 'rascunho',
    });

    const doc = await docRef.get();
    return this.mapDocumento(doc);
  }

  async upload(data: UploadDocumentoDto) {
    const createData: CreateDocumentoDto = {
      ...data,
      tipo: 'upload',
      conteudo: '',
      status: 'publicado',
    };

    return this.create(createData);
  }

  async findAll(usuarioId: string) {
    const funcionarioDoc = await this.funcionarioCollection
      .doc(usuarioId)
      .get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário não encontrado.');
    }

    const funcionarioData = funcionarioDoc.data();
    const empresaId = funcionarioData.empresaId;

    // Se for admin, retorna todos os documentos da empresa
    if (funcionarioData.cargo === 'Administrador') {
      const snapshot = await this.collection
        .where('empresaId', '==', this.empresaCollection.doc(empresaId))
        .get();
      return snapshot.docs.map((doc) => this.mapDocumento(doc));
    }

    // Se não for admin, busca as equipes do usuário
    const equipesSnapshot = await this.equipeCollection
      .where('empresaId', '==', this.empresaCollection.doc(empresaId))
      .where(
        'membros',
        'array-contains',
        this.funcionarioCollection.doc(usuarioId),
      )
      .get();

    const equipeIds = equipesSnapshot.docs.map((doc) => doc.id);

    if (equipeIds.length === 0) {
      return [];
    }

    const documentos: any[] = [];
    for (const equipeId of equipeIds) {
      const snapshot = await this.collection
        .where('equipeId', '==', this.equipeCollection.doc(equipeId))
        .get();

      const docs = snapshot.docs.map((doc) => this.mapDocumento(doc));
      documentos.push(...docs);
    }

    return documentos;
  }

  async findByEquipe(equipeId: string, usuarioId: string) {
    const equipeDoc = await this.equipeCollection.doc(equipeId).get();
    if (!equipeDoc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }

    const equipeData = equipeDoc.data();
    const isMembro = equipeData?.membros?.some(
      (ref: any) => ref.id === usuarioId,
    );

    if (!isMembro) {
      throw new ForbiddenException(
        'Você não tem permissão para ver documentos desta equipe.',
      );
    }

    const snapshot = await this.collection
      .where('equipeId', '==', this.equipeCollection.doc(equipeId))
      .get();

    return snapshot.docs.map((doc) => this.mapDocumento(doc));
  }
  async findOne(slug: string, usuarioId: string) {
    console.log(
      `[DocumentoService] findOne: Iniciando busca para SLUG: ${slug}, USUARIO: ${usuarioId}`,
    );
    const doc = await this.collection.doc(slug).get();

    if (!doc.exists) {
      console.log(
        `[DocumentoService] findOne: Documento com SLUG ${slug} NÃO encontrado no Firestore.`,
      );
      throw new NotFoundException('Documento não encontrado');
    }
    console.log(
      `[DocumentoService] findOne: Documento com SLUG ${slug} ENCONTRADO no Firestore.`,
    );

    const documentoData = doc.data();
    if (!documentoData) {
      console.log(
        `[DocumentoService] findOne: Dados do documento com SLUG ${slug} são nulos.`,
      );
      throw new NotFoundException(
        'Documento não encontrado ou dados inválidos',
      );
    }

    const equipeId = documentoData?.equipeId?.id;
    console.log(
      `[DocumentoService] findOne: Equipe ID do documento: ${equipeId}`,
    );

    if (!equipeId) {
      console.log(
        `[DocumentoService] findOne: Documento com SLUG ${slug} não possui equipeId.`,
      );
      // Dependendo da regra de negócio, isso pode ser um NotFound ou Forbidden
      throw new ForbiddenException(
        'Documento não associado a uma equipe ou acesso negado.',
      );
    }

    const equipeDoc = await this.equipeCollection.doc(equipeId).get();
    if (!equipeDoc.exists) {
      console.log(
        `[DocumentoService] findOne: Equipe ${equipeId} do documento ${slug} NÃO encontrada.`,
      );
      throw new NotFoundException('Equipe do documento não encontrada');
    }
    console.log(
      `[DocumentoService] findOne: Equipe ${equipeId} do documento ${slug} ENCONTRADA.`,
    );

    const equipeData = equipeDoc.data();
    if (!equipeData) {
      console.log(
        `[DocumentoService] findOne: Dados da equipe ${equipeId} são nulos.`,
      );
      throw new NotFoundException('Dados da equipe inválidos');
    }

    const isMembro = equipeData?.membros?.some(
      (ref: any) => ref.id === usuarioId,
    );
    console.log(
      `[DocumentoService] findOne: Usuário ${usuarioId} é membro da equipe ${equipeId}? ${isMembro}`,
    );

    if (!isMembro) {
      throw new ForbiddenException(
        'Você não tem permissão para ver este documento.',
      );
    }
    console.log(
      `[DocumentoService] findOne: Permissão concedida para o usuário ${usuarioId} acessar o documento ${slug}.`,
    );

    return this.mapDocumento(doc);
  }

  async update(slug: string, data: UpdateDocumentoDto, usuarioId: string) {
    // 🔹 Função utilitária para remover undefined
    const removeUndefined = (obj: Record<string, any>) => {
      return Object.fromEntries(
        Object.entries(obj).filter(([_, v]) => v !== undefined),
      );
    };

    const docRef = this.collection.doc(slug);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Documento não encontrado');
    }

    const documentoData = doc.data();
    const equipeId = documentoData?.equipeId?.id;

    // 🔹 Verifica se o usuário é membro da equipe
    const equipeDoc = await this.equipeCollection.doc(equipeId).get();
    const equipeData = equipeDoc.data();
    const isMembro = equipeData?.membros?.some(
      (ref: any) => ref.id === usuarioId,
    );

    if (!isMembro) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este documento.',
      );
    }

    // 🔹 Remove undefined do objeto
    const updateData: any = removeUndefined({ ...data });

    // 🔹 Valida empresaId (se enviado)
    if (data.empresaId) {
      const empresaDoc = await this.empresaCollection.doc(data.empresaId).get();
      if (!empresaDoc.exists) {
        throw new NotFoundException('Empresa não encontrada.');
      }
      updateData.empresaId = this.empresaCollection.doc(data.empresaId);
    }

    // 🔹 Valida equipeId (se enviado)
    if (data.equipeId) {
      const equipeDoc = await this.equipeCollection.doc(data.equipeId).get();
      if (!equipeDoc.exists) {
        throw new NotFoundException('Equipe não encontrada.');
      }
      updateData.equipeId = this.equipeCollection.doc(data.equipeId);
    }

    // 🔹 Valida criadoPor (se enviado)
    if (data.criadoPor) {
      const funcionarioDoc = await this.funcionarioCollection
        .doc(data.criadoPor)
        .get();
      if (!funcionarioDoc.exists) {
        throw new NotFoundException('Funcionário criador não encontrado.');
      }
      updateData.criadoPor = this.funcionarioCollection.doc(data.criadoPor);
    }

    // 🔹 Incrementa versão se houve alteração no conteúdo
    if (data.conteudo !== undefined) {
      updateData.versao = (documentoData?.versao || 1) + 1;
    }

    // 🔹 Atualiza data
    updateData.dataAtualizacao = new Date();

    // 🔹 Atualiza documento no Firestore
    await docRef.update(updateData);
    const updated = await docRef.get();
    return this.mapDocumento(updated);
  }

  async remove(slug: string, usuarioId: string) {
    console.log(
      `[DocumentoService] Tentando remover documento com SLUG: ${slug} pelo usuário: ${usuarioId}`,
    );
    const docRef = this.collection.doc(slug);
    const doc = await docRef.get();
    if (!doc.exists) {
      console.log(
        `[DocumentoService] Documento com SLUG ${slug} não encontrado.`,
      );
      throw new NotFoundException('Documento não encontrado');
    }
    console.log(`[DocumentoService] Documento ${slug} encontrado.`);

    const funcionarioDoc = await this.funcionarioCollection
      .doc(usuarioId)
      .get();
    if (!funcionarioDoc.exists) {
      console.log(
        `[DocumentoService] Funcionário ${usuarioId} não encontrado.`,
      );
      throw new NotFoundException('Funcionário não encontrado.');
    }
    const funcionarioData = funcionarioDoc.data();
    console.log(
      `[DocumentoService] Funcionário ${usuarioId} encontrado. Cargo: ${funcionarioData?.cargo}, Empresa: ${funcionarioData?.empresaId}`,
    );

    const documentoData = doc.data();
    const documentoEmpresaId = documentoData?.empresaId?.id;
    const documentoEquipeId = documentoData?.equipeId?.id;
    console.log(
      `[DocumentoService] Documento ${slug} pertence à Empresa: ${documentoEmpresaId}, Equipe: ${documentoEquipeId}`,
    );

    // Verifica se o usuário é administrador da empresa do documento
    if (
      funcionarioData.cargo === 'Administrador' &&
      funcionarioData.empresaId === documentoEmpresaId
    ) {
      console.log(
        `[DocumentoService] Usuário ${usuarioId} é administrador da empresa ${documentoEmpresaId}. Deletando documento.`,
      );
      await docRef.delete();
      return { message: 'Documento deletado com sucesso' };
    }

    // Se não for administrador, verifica se é membro da equipe do documento
    console.log(
      `[DocumentoService] Usuário ${usuarioId} não é administrador. Verificando permissão de equipe.`,
    );
    const equipeDoc = await this.equipeCollection.doc(documentoEquipeId).get();
    if (!equipeDoc.exists) {
      console.log(
        `[DocumentoService] Equipe do documento ${documentoEquipeId} não encontrada.`,
      );
      throw new NotFoundException('Equipe do documento não encontrada.');
    }
    const equipeData = equipeDoc.data();
    const isMembro = equipeData?.membros?.some(
      (ref: any) => ref.id === usuarioId,
    );

    if (!isMembro) {
      console.log(
        `[DocumentoService] Usuário ${usuarioId} não é membro da equipe ${documentoEquipeId}.`,
      );
      throw new ForbiddenException(
        'Você não tem permissão para deletar este documento.',
      );
    }
    console.log(
      `[DocumentoService] Usuário ${usuarioId} é membro da equipe ${documentoEquipeId}. Deletando documento.`,
    );
    await docRef.delete();
    return { message: 'Documento deletado com sucesso' };
  }

  async getDocumentoStats(usuarioId: string) {
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

    const equipeIds = equipesSnapshot.docs.map((doc) => doc.id);

    if (equipeIds.length === 0) {
      return {
        totalDocumentos: 0,
        documentosCriados: 0,
        documentosUpload: 0,
        documentosRascunho: 0,
        documentosPublicados: 0,
        documentosArquivados: 0,
      };
    }

    let totalDocumentos = 0;
    let documentosCriados = 0;
    let documentosUpload = 0;
    let documentosRascunho = 0;
    let documentosPublicados = 0;
    let documentosArquivados = 0;

    for (const equipeId of equipeIds) {
      const snapshot = await this.collection
        .where('equipeId', '==', this.equipeCollection.doc(equipeId))
        .get();

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        totalDocumentos++;

        if (data?.tipo === 'criado') documentosCriados++;
        if (data?.tipo === 'upload') documentosUpload++;

        if (data?.status === 'rascunho') documentosRascunho++;
        if (data?.status === 'publicado') documentosPublicados++;
        if (data?.status === 'arquivado') documentosArquivados++;
      });
    }

    return {
      totalDocumentos,
      documentosCriados,
      documentosUpload,
      documentosRascunho,
      documentosPublicados,
      documentosArquivados,
    };
  }

  private mapDocumento(doc: FirebaseFirestore.DocumentSnapshot) {
    const data = doc.data();
    return {
      id: doc.id,
      titulo: data?.titulo,
      descricao: data?.descricao,
      conteudo: data?.conteudo,
      tipo: data?.tipo,
      arquivoUrl: data?.arquivoUrl,
      nomeArquivo: data?.nomeArquivo,
      tamanhoArquivo: data?.tamanhoArquivo,
      empresaId: data?.empresaId?.id || null,
      equipeId: data?.equipeId?.id || null,
      criadoPor: data?.criadoPor?.id || null,
      dataCriacao: data?.dataCriacao?.toDate?.() || data?.dataCriacao,
      dataAtualizacao:
        data?.dataAtualizacao?.toDate?.() || data?.dataAtualizacao,
      versao: data?.versao || 1,
      status: data?.status || 'rascunho',
    };
  }

  async assignDocumentoToEquipe(
    documentoId: string,
    equipeId: string,
    usuarioId: string,
  ) {
    const documentoRef = this.collection.doc(documentoId);
    const documentoDoc = await documentoRef.get();

    if (!documentoDoc.exists) {
      throw new NotFoundException('Documento não encontrado.');
    }

    const equipeDoc = await this.equipeCollection.doc(equipeId).get();
    if (!equipeDoc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }

    const documentoData = documentoDoc.data();
    const currentEquipeId = documentoData?.equipeId?.id;

    if (currentEquipeId) {
      const currentEquipeDoc = await this.equipeCollection
        .doc(currentEquipeId)
        .get();
      const currentEquipeData = currentEquipeDoc.data();
      const isMembroCurrentEquipe = currentEquipeData?.membros?.some(
        (ref: any) => ref.id === usuarioId,
      );
      if (!isMembroCurrentEquipe) {
        throw new ForbiddenException(
          'Você não tem permissão para modificar este documento na equipe atual.',
        );
      }
    }

    const newEquipeData = equipeDoc.data();
    const isMembroNewEquipe = newEquipeData?.membros?.some(
      (ref: any) => ref.id === usuarioId,
    );
    if (!isMembroNewEquipe) {
      throw new ForbiddenException(
        'Você não tem permissão para atribuir documentos a esta equipe.',
      );
    }

    await documentoRef.update({
      equipeId: this.equipeCollection.doc(equipeId),
      dataAtualizacao: new Date(),
    });

    const updatedDocumento = await documentoRef.get();
    return this.mapDocumento(updatedDocumento);
  }

  async findDocumentosDisponiveisParaEquipe(usuarioId: string) {
    const funcionarioDoc = await this.funcionarioCollection
      .doc(usuarioId)
      .get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário não encontrado.');
    }

    const documentosSnapshot = await this.collection
      .where('criadoPor', '==', this.funcionarioCollection.doc(usuarioId))
      .get();

    let documentos = documentosSnapshot.docs.map((doc) =>
      this.mapDocumento(doc),
    );

    const equipesGerenciadasSnapshot = await this.equipeCollection
      .where(
        'membros',
        'array-contains',
        this.funcionarioCollection.doc(usuarioId),
      )
      .get();

    for (const equipeDoc of equipesGerenciadasSnapshot.docs) {
      const equipeId = equipeDoc.id;
      const docsDaEquipeSnapshot = await this.collection
        .where('equipeId', '==', this.equipeCollection.doc(equipeId))
        .get();
      docsDaEquipeSnapshot.docs.forEach((doc) => {
        const mappedDoc = this.mapDocumento(doc);
        if (!documentos.some((d) => d.id === mappedDoc.id)) {
          documentos.push(mappedDoc);
        }
      });
    }

    return documentos;
  }
}
