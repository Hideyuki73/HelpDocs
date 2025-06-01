import { Test, TestingModule } from '@nestjs/testing';
import { DocumentoService } from './documento/documento.service';
import { NotFoundException } from '@nestjs/common';

const mockDoc = (data = {}, exists = true) => ({
  exists,
  id: 'doc1',
  data: () => data,
  get: jest.fn().mockResolvedValue({ exists, data: () => data, id: 'doc1' }),
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

describe('DocumentoService', () => {
  let service: DocumentoService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentoService,
        { provide: 'FIRESTORE', useValue: mockFirestore },
      ],
    }).compile();

    service = module.get<DocumentoService>(DocumentoService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve lançar erro se empresa não existir ao criar', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false }); // empresa
    await expect(
      service.create({
        titulo: 'Doc Teste',
        descricao: 'Descrição',
        empresaId: 'emp1',
        criadoPor: 'func1',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar erro se funcionário criador não existir ao criar', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true }) // empresa
      .mockResolvedValueOnce({ exists: false }); // criador
    await expect(
      service.create({
        titulo: 'Doc Teste',
        descricao: 'Descrição',
        empresaId: 'emp1',
        criadoPor: 'func1',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve criar documento com sucesso', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true }) // empresa
      .mockResolvedValueOnce({ exists: true }); // criador
    mockFirestore.add.mockResolvedValueOnce({
      get: jest.fn().mockResolvedValue(mockDoc({ titulo: 'Doc Teste' })),
    });
    const result = await service.create({
      titulo: 'Doc Teste',
      descricao: 'Descrição',
      empresaId: 'emp1',
      criadoPor: 'func1',
    });
    expect(result).toHaveProperty('id');
    expect(result.titulo).toBe('Doc Teste');
  });

  it('findAll deve retornar lista de documentos', async () => {
    mockFirestore.get.mockResolvedValue({
      docs: [mockDoc({ titulo: 'Doc 1' }), mockDoc({ titulo: 'Doc 2' })],
    });
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it('findOne deve retornar documento se existir', async () => {
    mockFirestore.get.mockResolvedValueOnce(mockDoc({ titulo: 'Doc 1' }));
    const result = await service.findOne('doc1');
    expect(result).toHaveProperty('id');
    expect(result.titulo).toBe('Doc 1');
  });

  it('findOne deve lançar erro se documento não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(service.findOne('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update deve lançar erro se documento não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(
      service.update('naoexiste', { titulo: 'Novo Título' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('update deve atualizar documento com sucesso', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true }) // empresa
      .mockResolvedValueOnce({ exists: true }) // documento
      .mockResolvedValueOnce(mockDoc({ titulo: 'Doc Atualizado' })); // updatedDoc
    mockFirestore.update.mockResolvedValueOnce(undefined);
    const result = await service.update('doc1', {
      titulo: 'Doc Atualizado',
      empresaId: 'emp1',
    });
    expect(result.titulo).toBe('Doc Atualizado');
  });

  it('remove deve lançar erro se documento não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(service.remove('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove deve remover documento com sucesso', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: true });
    mockFirestore.delete.mockResolvedValueOnce(undefined);
    const result = await service.remove('doc1');
    expect(result).toHaveProperty('message');
  });
});
