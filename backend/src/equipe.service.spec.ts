import { Test, TestingModule } from '@nestjs/testing';
import { EquipeService } from './equipes/equipe.service';
import { NotFoundException } from '@nestjs/common';

// Mock que sempre retorna um objeto com .data()
const mockDoc = (data = {}, exists = true) => ({
  exists,
  id: 'equipe1',
  data: () => data,
  get: jest.fn().mockResolvedValue({ exists, data: () => data, id: 'equipe1' }),
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

describe('EquipeService', () => {
  let service: EquipeService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipeService,
        { provide: 'FIRESTORE', useValue: mockFirestore },
      ],
    }).compile();

    service = module.get<EquipeService>(EquipeService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve lançar erro se documento não existir ao criar', async () => {
    mockFirestore.get.mockResolvedValueOnce({
      exists: false,
      data: () => undefined,
    }); // documento
    await expect(
      service.create({
        nome: 'Equipe Teste',
        documentoId: 'doc1',
        criadorId: 'func1',
        membros: [],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar erro se funcionário criador não existir ao criar', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true, data: () => ({}) }) // documento
      .mockResolvedValueOnce({ exists: false, data: () => undefined }); // criador
    await expect(
      service.create({
        nome: 'Equipe Teste',
        documentoId: 'doc1',
        criadorId: 'func1',
        membros: [],
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve criar equipe com sucesso', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true, data: () => ({}) }) // documento
      .mockResolvedValueOnce({ exists: true, data: () => ({}) }); // criador
    mockFirestore.add.mockResolvedValueOnce({
      get: jest.fn().mockResolvedValue(mockDoc({ nome: 'Equipe Teste' })),
    });
    const result = await service.create({
      nome: 'Equipe Teste',
      documentoId: 'doc1',
      criadorId: 'func1',
      membros: [],
    });
    expect(result).toHaveProperty('id');
    expect(result.nome).toBe('Equipe Teste');
  });

  it('findAll deve retornar lista de equipes', async () => {
    mockFirestore.get.mockResolvedValue({
      docs: [mockDoc({ nome: 'Equipe 1' }), mockDoc({ nome: 'Equipe 2' })],
    });
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it('findOne deve retornar equipe se existir', async () => {
    mockFirestore.get.mockResolvedValueOnce(mockDoc({ nome: 'Equipe 1' }));
    const result = await service.findOne('equipe1');
    expect(result).toHaveProperty('id');
    expect(result.nome).toBe('Equipe 1');
  });

  it('findOne deve lançar erro se equipe não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({
      exists: false,
      data: () => undefined,
    });
    await expect(service.findOne('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update deve lançar erro se equipe não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({
      exists: false,
      data: () => undefined,
    });
    await expect(
      service.update('naoexiste', { nome: 'Novo Nome' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('update deve atualizar equipe com sucesso', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true, data: () => ({}) }) // documento
      .mockResolvedValueOnce(mockDoc({ nome: 'Equipe Atualizada' })) // equipe
      .mockResolvedValueOnce(mockDoc({ nome: 'Equipe Atualizada' })); // updatedDoc
    mockFirestore.update.mockResolvedValueOnce(undefined);
    const result = await service.update('equipe1', {
      nome: 'Equipe Atualizada',
    });
    expect(result.nome).toBe('Equipe Atualizada');
  });

  it('remove deve lançar erro se equipe não existir', async () => {
    jest.clearAllMocks();
    mockFirestore.get.mockResolvedValueOnce({
      exists: false,
      data: () => undefined,
    });
    await expect(service.remove('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove deve remover equipe com sucesso', async () => {
    jest.clearAllMocks();
    mockFirestore.get.mockResolvedValueOnce(mockDoc({}));
    mockFirestore.delete.mockResolvedValueOnce(undefined);
    const result = await service.remove('equipe1');
    expect(result).toHaveProperty('message');
  });
});
