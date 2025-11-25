import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoService } from './documento/documento.service';
import { NotFoundException } from '@nestjs/common';
import { VersaoDocumentoService } from './versao-documento/versao-documento.service';

const MOCK_USER_ID = 'func1';
const MOCK_EMPRESA_ID = 'emp1';
const MOCK_EQUIPE_ID = 'equipe1';

// Mock do VersaoDocumentoService
const mockVersaoDocumentoService = {
  create: jest.fn().mockResolvedValue({
    id: 'versao1',
    numeroVersao: 1,
  }),
};

describe('DocumentoService - CRUD com UserId', () => {
  let service: DocumentoService;
  let mockFirestore: any;
  let mockDocumentoCollection: any;
  let mockEmpresaCollection: any;
  let mockFuncionarioCollection: any;
  let mockEquipeCollection: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Setup dos mocks das coleções
    mockDocumentoCollection = {
      doc: jest.fn(),
      add: jest.fn(),
      get: jest.fn(),
      where: jest.fn().mockReturnThis(),
    };

    mockEmpresaCollection = {
      doc: jest.fn(),
    };

    mockFuncionarioCollection = {
      doc: jest.fn(),
    };

    mockEquipeCollection = {
      doc: jest.fn(),
      where: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    // Mock do Firestore
    mockFirestore = {
      collection: jest.fn((name: string) => {
        if (name === 'documentos') return mockDocumentoCollection;
        if (name === 'empresas') return mockEmpresaCollection;
        if (name === 'funcionarios') return mockFuncionarioCollection;
        if (name === 'equipes') return mockEquipeCollection;
        return {};
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentoService,
        { provide: 'FIRESTORE', useValue: mockFirestore },
        {
          provide: VersaoDocumentoService,
          useValue: mockVersaoDocumentoService,
        },
      ],
    }).compile();

    service = module.get<DocumentoService>(DocumentoService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  const baseDocumentoData = {
    titulo: 'Manual de Procedimentos',
    descricao: 'Descrição do manual',
    tipo: 'criado' as const,
    empresaId: MOCK_EMPRESA_ID,
    equipeId: MOCK_EQUIPE_ID,
    versao: 1,
    status: 'rascunho' as const,
    criadoPor: MOCK_USER_ID,
    conteudo: 'Conteúdo do documento',
  };

  // Teste de CREATE
  it('deve criar um documento com sucesso, usando o criadorId do usuário', async () => {
    const mockDocId = 'doc1';
    const dataCriacao = new Date();

    // Mock do funcionário (criador)
    const mockFuncionarioDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          empresaId: MOCK_EMPRESA_ID,
          cargo: 'Desenvolvedor',
        }),
      }),
    };
    mockFuncionarioCollection.doc.mockReturnValue(mockFuncionarioDocRef);

    // Mock da equipe
    const mockEquipeDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          membros: [{ id: MOCK_USER_ID }],
          nome: 'Equipe Teste',
        }),
      }),
    };
    mockEquipeCollection.doc.mockReturnValue(mockEquipeDocRef);

    // Mock do empresaCollection.doc (para criar referências)
    mockEmpresaCollection.doc.mockReturnValue({
      id: MOCK_EMPRESA_ID,
    });

    // Mock do documento criado
    const createdDocumentoData = {
      titulo: baseDocumentoData.titulo,
      descricao: baseDocumentoData.descricao,
      conteudo: baseDocumentoData.conteudo,
      tipo: baseDocumentoData.tipo,
      arquivoUrl: null,
      nomeArquivo: null,
      tamanhoArquivo: null,
      empresaId: { id: MOCK_EMPRESA_ID },
      equipeId: { id: MOCK_EQUIPE_ID },
      criadoPor: { id: MOCK_USER_ID },
      dataCriacao: dataCriacao,
      dataAtualizacao: dataCriacao,
      versao: 1,
      status: 'rascunho',
      checklist: [],
    };

    const mockDocRef = {
      id: mockDocId,
      get: jest.fn().mockResolvedValue({
        id: mockDocId,
        exists: true,
        data: () => createdDocumentoData,
      }),
    };

    mockDocumentoCollection.add.mockResolvedValue(mockDocRef);

    const result = await service.create(baseDocumentoData);

    // Verificações
    expect(mockFuncionarioCollection.doc).toHaveBeenCalledWith(MOCK_USER_ID);
    expect(mockEquipeCollection.doc).toHaveBeenCalledWith(MOCK_EQUIPE_ID);
    expect(mockDocumentoCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: baseDocumentoData.titulo,
        descricao: baseDocumentoData.descricao,
        tipo: baseDocumentoData.tipo,
        versao: 1,
        status: 'rascunho',
      }),
    );
    expect(mockVersaoDocumentoService.create).toHaveBeenCalled();
    expect(result).toEqual({
      id: mockDocId,
      titulo: baseDocumentoData.titulo,
      descricao: baseDocumentoData.descricao,
      conteudo: baseDocumentoData.conteudo,
      tipo: baseDocumentoData.tipo,
      arquivoUrl: null,
      nomeArquivo: null,
      tamanhoArquivo: null,
      empresaId: MOCK_EMPRESA_ID,
      equipeId: MOCK_EQUIPE_ID,
      criadoPor: MOCK_USER_ID,
      dataCriacao: dataCriacao,
      dataAtualizacao: dataCriacao,
      versao: 1,
      status: 'rascunho',
      checklist: [],
    });
  });

  it('deve lançar NotFoundException se a empresa não existir ao criar', async () => {
    // Mock do funcionário sem empresaId
    const mockFuncionarioDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          empresaId: null, // Sem empresa
        }),
      }),
    };
    mockFuncionarioCollection.doc.mockReturnValue(mockFuncionarioDocRef);

    await expect(service.create(baseDocumentoData)).rejects.toThrow(
      NotFoundException,
    );
  });

  // Teste de UPDATE
  it('deve atualizar um documento com sucesso, incluindo o dataAtualizacao', async () => {
    const documentoId = 'doc1';
    const updateData = { titulo: 'Manual Atualizado', versao: 2 };

    const existingDocumentoData = {
      titulo: 'Manual Antigo',
      descricao: baseDocumentoData.descricao,
      conteudo: baseDocumentoData.conteudo,
      tipo: baseDocumentoData.tipo,
      empresaId: { id: MOCK_EMPRESA_ID },
      equipeId: { id: MOCK_EQUIPE_ID },
      criadoPor: { id: MOCK_USER_ID },
      versao: 1,
      status: 'rascunho',
    };

    const updatedDocumentoData = {
      ...existingDocumentoData,
      titulo: updateData.titulo,
      dataAtualizacao: new Date(),
    };

    // Mock do documento
    const mockDocRef = {
      get: jest
        .fn()
        // Primeira chamada - documento existente
        .mockResolvedValueOnce({
          exists: true,
          id: documentoId,
          data: () => existingDocumentoData,
        })
        // Segunda chamada - documento atualizado
        .mockResolvedValueOnce({
          exists: true,
          id: documentoId,
          data: () => updatedDocumentoData,
        }),
      update: jest.fn().mockResolvedValue(undefined),
    };

    mockDocumentoCollection.doc.mockReturnValue(mockDocRef);

    // Mock da equipe (para validação de permissão)
    const mockEquipeDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          membros: [{ id: MOCK_USER_ID }],
        }),
      }),
    };
    mockEquipeCollection.doc.mockReturnValue(mockEquipeDocRef);

    const result = await service.update(documentoId, updateData, MOCK_USER_ID);

    expect(mockDocumentoCollection.doc).toHaveBeenCalledWith(documentoId);
    expect(mockDocRef.update).toHaveBeenCalledWith(
      expect.objectContaining({
        titulo: updateData.titulo,
        dataAtualizacao: expect.any(Date),
      }),
    );
    expect(result.titulo).toBe(updateData.titulo);
  });

  it('deve lançar NotFoundException ao tentar atualizar documento inexistente', async () => {
    const mockDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: false,
      }),
    };

    mockDocumentoCollection.doc.mockReturnValue(mockDocRef);

    await expect(
      service.update('naoexiste', { titulo: 'Novo Título' }, MOCK_USER_ID),
    ).rejects.toThrow(NotFoundException);
  });

  // Teste de DELETE
  it('deve remover um documento com sucesso', async () => {
    const documentoId = 'doc1';

    const documentoData = {
      titulo: 'Documento Teste',
      empresaId: { id: MOCK_EMPRESA_ID },
      equipeId: { id: MOCK_EQUIPE_ID },
    };

    // Mock do documento
    const mockDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: documentoId,
        data: () => documentoData,
      }),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockDocumentoCollection.doc.mockReturnValue(mockDocRef);

    // Mock do funcionário
    const mockFuncionarioDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          empresaId: MOCK_EMPRESA_ID,
          cargo: 'Administrador', // Admin pode deletar
        }),
      }),
    };
    mockFuncionarioCollection.doc.mockReturnValue(mockFuncionarioDocRef);

    const result = await service.remove(documentoId, MOCK_USER_ID);

    expect(mockDocumentoCollection.doc).toHaveBeenCalledWith(documentoId);
    expect(mockDocRef.delete).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Documento deletado com sucesso' });
  });

  it('deve lançar NotFoundException ao tentar remover documento inexistente', async () => {
    const mockDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: false,
      }),
    };

    mockDocumentoCollection.doc.mockReturnValue(mockDocRef);

    await expect(service.remove('naoexiste', MOCK_USER_ID)).rejects.toThrow(
      NotFoundException,
    );
  });

  // Teste adicional - findOne
  it('deve buscar um documento por ID com sucesso', async () => {
    const documentoId = 'doc1';
    const documentoData = {
      titulo: 'Documento Teste',
      descricao: 'Descrição teste',
      conteudo: 'Conteúdo teste',
      tipo: 'criado',
      empresaId: { id: MOCK_EMPRESA_ID },
      equipeId: { id: MOCK_EQUIPE_ID },
      criadoPor: { id: MOCK_USER_ID },
      versao: 1,
      status: 'rascunho',
      dataCriacao: new Date(),
    };

    // Mock do documento
    const mockDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: documentoId,
        data: () => documentoData,
      }),
    };

    mockDocumentoCollection.doc.mockReturnValue(mockDocRef);

    // Mock da equipe
    const mockEquipeDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          membros: [{ id: MOCK_USER_ID }],
        }),
      }),
    };
    mockEquipeCollection.doc.mockReturnValue(mockEquipeDocRef);

    const result = await service.findOne(documentoId, MOCK_USER_ID);

    expect(mockDocumentoCollection.doc).toHaveBeenCalledWith(documentoId);
    expect(result.id).toBe(documentoId);
    expect(result.titulo).toBe(documentoData.titulo);
  });
});
