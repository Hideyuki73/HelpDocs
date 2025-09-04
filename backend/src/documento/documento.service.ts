import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
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
    // Validação das referências
    const empresaDoc = await this.empresaCollection.doc(data.empresaId).get();
    if (!empresaDoc.exists) {
      throw new NotFoundException('Empresa não encontrada.');
    }

    const funcionarioDoc = await this.funcionarioCollection.doc(data.criadoPor).get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário criador não encontrado.');
    }

    const equipeDoc = await this.equipeCollection.doc(data.equipeId).get();
    if (!equipeDoc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }

    // Verificar se o funcionário pertence à equipe
    const equipeData = equipeDoc.data();
    const funcionarioRef = this.funcionarioCollection.doc(data.criadoPor);
    const isMembro = equipeData?.membros?.some((ref: any) => ref.id === data.criadoPor);
    
    if (!isMembro) {
      throw new ForbiddenException('Você não tem permissão para criar documentos nesta equipe.');
    }

    const docRef = await this.collection.add({
      titulo: data.titulo,
      descricao: data.descricao,
      conteudo: data.conteudo || '',
      tipo: data.tipo,
      arquivoUrl: data.arquivoUrl || null,
      nomeArquivo: data.nomeArquivo || null,
      tamanhoArquivo: data.tamanhoArquivo || null,
      empresaId: this.empresaCollection.doc(data.empresaId),
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
    const funcionarioDoc = await this.funcionarioCollection.doc(usuarioId).get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário não encontrado.');
    }

    const funcionarioData = funcionarioDoc.data();
    
    // Buscar equipes do usuário
    const equipesSnapshot = await this.equipeCollection
      .where('membros', 'array-contains', this.funcionarioCollection.doc(usuarioId))
      .get();

    const equipeIds = equipesSnapshot.docs.map(doc => doc.id);
    
    if (equipeIds.length === 0) {
      return [];
    }

    // Buscar documentos das equipes do usuário
    const documentos: any[] = [];
    for (const equipeId of equipeIds) {
      const snapshot = await this.collection
        .where('equipeId', '==', this.equipeCollection.doc(equipeId))
        .get();
      
      const docs = snapshot.docs.map(doc => this.mapDocumento(doc));
      documentos.push(...docs);
    }

    return documentos;
  }

  async findByEquipe(equipeId: string, usuarioId: string) {
    // Verificar se o usuário pertence à equipe
    const equipeDoc = await this.equipeCollection.doc(equipeId).get();
    if (!equipeDoc.exists) {
      throw new NotFoundException('Equipe não encontrada.');
    }

    const equipeData = equipeDoc.data();
    const isMembro = equipeData?.membros?.some((ref: any) => ref.id === usuarioId);
    
    if (!isMembro) {
      throw new ForbiddenException('Você não tem permissão para ver documentos desta equipe.');
    }

    const snapshot = await this.collection
      .where('equipeId', '==', this.equipeCollection.doc(equipeId))
      .get();
    
    return snapshot.docs.map(doc => this.mapDocumento(doc));
  }

  async findOne(id: string, usuarioId: string) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException('Documento não encontrado');
    }

    const documentoData = doc.data();
    const equipeId = documentoData?.equipeId?.id;

    // Verificar se o usuário pertence à equipe do documento
    const equipeDoc = await this.equipeCollection.doc(equipeId).get();
    const equipeData = equipeDoc.data();
    const isMembro = equipeData?.membros?.some((ref: any) => ref.id === usuarioId);
    
    if (!isMembro) {
      throw new ForbiddenException('Você não tem permissão para ver este documento.');
    }

    return this.mapDocumento(doc);
  }

  async update(id: string, data: UpdateDocumentoDto, usuarioId: string) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Documento não encontrado');
    }

    const documentoData = doc.data();
    const equipeId = documentoData?.equipeId?.id;

    // Verificar se o usuário pertence à equipe do documento
    const equipeDoc = await this.equipeCollection.doc(equipeId).get();
    const equipeData = equipeDoc.data();
    const isMembro = equipeData?.membros?.some((ref: any) => ref.id === usuarioId);
    
    if (!isMembro) {
      throw new ForbiddenException('Você não tem permissão para editar este documento.');
    }

    const updateData: any = { ...data };
    
    if (data.empresaId) {
      const empresaDoc = await this.empresaCollection.doc(data.empresaId).get();
      if (!empresaDoc.exists) {
        throw new NotFoundException('Empresa não encontrada.');
      }
      updateData.empresaId = this.empresaCollection.doc(data.empresaId);
    }
    
    if (data.equipeId) {
      const equipeDoc = await this.equipeCollection.doc(data.equipeId).get();
      if (!equipeDoc.exists) {
        throw new NotFoundException('Equipe não encontrada.');
      }
      updateData.equipeId = this.equipeCollection.doc(data.equipeId);
    }
    
    if (data.criadoPor) {
      const funcionarioDoc = await this.funcionarioCollection.doc(data.criadoPor).get();
      if (!funcionarioDoc.exists) {
        throw new NotFoundException('Funcionário criador não encontrado.');
      }
      updateData.criadoPor = this.funcionarioCollection.doc(data.criadoPor);
    }

    // Incrementar versão se o conteúdo foi alterado
    if (data.conteudo !== undefined) {
      updateData.versao = (documentoData?.versao || 1) + 1;
    }
    
    updateData.dataAtualizacao = new Date();

    await docRef.update(updateData as any);
    const updated = await docRef.get();
    return this.mapDocumento(updated);
  }

  async remove(id: string, usuarioId: string) {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('Documento não encontrado');
    }

    const documentoData = doc.data();
    const equipeId = documentoData?.equipeId?.id;

    // Verificar se o usuário pertence à equipe do documento
    const equipeDoc = await this.equipeCollection.doc(equipeId).get();
    const equipeData = equipeDoc.data();
    const isMembro = equipeData?.membros?.some((ref: any) => ref.id === usuarioId);
    
    if (!isMembro) {
      throw new ForbiddenException('Você não tem permissão para deletar este documento.');
    }

    await docRef.delete();
    return { message: 'Documento deletado com sucesso' };
  }

  async getDocumentoStats(usuarioId: string) {
    const funcionarioDoc = await this.funcionarioCollection.doc(usuarioId).get();
    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário não encontrado.');
    }

    // Buscar equipes do usuário
    const equipesSnapshot = await this.equipeCollection
      .where('membros', 'array-contains', this.funcionarioCollection.doc(usuarioId))
      .get();

    const equipeIds = equipesSnapshot.docs.map(doc => doc.id);
    
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
      
      snapshot.docs.forEach(doc => {
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
      dataAtualizacao: data?.dataAtualizacao?.toDate?.() || data?.dataAtualizacao,
      versao: data?.versao || 1,
      status: data?.status || 'rascunho',
    };
  }
}
