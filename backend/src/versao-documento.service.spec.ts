import { Test, TestingModule } from '@nestjs/testing';
import { VersaoDocumentoService } from './versao-documento/versao-documento.service';
import { NotFoundException } from '@nestjs/common';

const mockDoc = (data = {}, exists = true) => ({
  exists,
  id: 'versao1',
  data: () => data,
  get: jest.fn().mockResolvedValue({ exists, data: () => data, id: 'versao1' }),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  get: jest.fn(),
  add: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('VersaoDocumentoService', () => {
  let service: VersaoDocumentoService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VersaoDocumentoService,
        { provide: 'FIRESTORE', useValue: mockFirestore },
      ],
    }).compile();

    service = module.get<VersaoDocumentoService>(VersaoDocumentoService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve lançar erro se documento não existir ao criar', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false }); // documento
    await expect(
      service.create({
        documentoId: 'doc1',
        numeroVersao: 1,
        conteudo: 'Conteúdo',
        criadoPor: 'func1',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar erro se funcionário criador não existir ao criar', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true }) // documento
      .mockResolvedValueOnce({ exists: false }); // criador
    await expect(
      service.create({
        documentoId: 'doc1',
        numeroVersao: 1,
        conteudo: 'Conteúdo',
        criadoPor: 'func1',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve criar versão com sucesso', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true }) // documento
      .mockResolvedValueOnce({ exists: true }); // criador
    mockFirestore.add.mockResolvedValueOnce({
      get: jest.fn().mockResolvedValue(mockDoc({ conteudo: 'Conteúdo' })),
    });
    const result = await service.create({
      documentoId: 'doc1',
      numeroVersao: 1,
      conteudo: 'Conteúdo',
      criadoPor: 'func1',
    });
    expect(result).toHaveProperty('id');
    expect(result.conteudo).toBe('Conteúdo');
  });

  it('findAll deve retornar lista de versões', async () => {
    mockFirestore.get.mockResolvedValue({
      docs: [mockDoc({ conteudo: 'v1' }), mockDoc({ conteudo: 'v2' })],
    });
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it('findOne deve retornar versão se existir', async () => {
    mockFirestore.get.mockResolvedValueOnce(mockDoc({ conteudo: 'v1' }));
    const result = await service.findOne('versao1');
    expect(result).toHaveProperty('id');
    expect(result.conteudo).toBe('v1');
  });

  it('findOne deve lançar erro se versão não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(service.findOne('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update deve lançar erro se versão não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(
      service.update('naoexiste', { conteudo: 'Novo Conteúdo' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('update deve atualizar versão com sucesso', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true }) // versão
      .mockResolvedValueOnce(mockDoc({ conteudo: 'Atualizado' })); // updatedDoc
    mockFirestore.update.mockResolvedValueOnce(undefined);
    const result = await service.update('versao1', { conteudo: 'Atualizado' });
    expect(result.conteudo).toBe('Atualizado');
  });

  it('remove deve lançar erro se versão não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(service.remove('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove deve remover versão com sucesso', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: true });
    mockFirestore.delete.mockResolvedValueOnce(undefined);
    const result = await service.remove('versao1');
    expect(result).toHaveProperty('message');
  });
});
