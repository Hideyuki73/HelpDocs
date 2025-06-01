import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat/chat.service';
import { NotFoundException } from '@nestjs/common';

const mockDoc = (data = {}, exists = true) => ({
  exists,
  id: 'chat1',
  data: () => data,
  get: jest.fn().mockResolvedValue({ exists, data: () => data, id: 'chat1' }),
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

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: 'FIRESTORE', useValue: mockFirestore },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve lançar erro se empresa não existir ao criar', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false }); // empresa
    await expect(
      service.create({
        nome: 'Chat Teste',
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
        nome: 'Chat Teste',
        empresaId: 'emp1',
        criadoPor: 'func1',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve criar chat com sucesso', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true }) // empresa
      .mockResolvedValueOnce({ exists: true }); // criador
    mockFirestore.add.mockResolvedValueOnce({
      get: jest.fn().mockResolvedValue(mockDoc({ nome: 'Chat Teste' })),
    });
    const result = await service.create({
      nome: 'Chat Teste',
      empresaId: 'emp1',
      criadoPor: 'func1',
    });
    expect(result).toHaveProperty('id');
    expect(result.nome).toBe('Chat Teste');
  });

  it('findAll deve retornar lista de chats', async () => {
    mockFirestore.get.mockResolvedValue({
      docs: [mockDoc({ nome: 'Chat 1' }), mockDoc({ nome: 'Chat 2' })],
    });
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it('findOne deve retornar chat se existir', async () => {
    mockFirestore.get.mockResolvedValueOnce(mockDoc({ nome: 'Chat 1' }));
    const result = await service.findOne('chat1');
    expect(result).toHaveProperty('id');
    expect(result.nome).toBe('Chat 1');
  });

  it('findOne deve lançar erro se chat não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(service.findOne('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update deve lançar erro se chat não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(
      service.update('naoexiste', { nome: 'Novo Nome' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('update deve atualizar chat com sucesso', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true }) // empresa
      .mockResolvedValueOnce({ exists: true }) // chat
      .mockResolvedValueOnce(mockDoc({ nome: 'Chat Atualizado' })); // updatedDoc
    mockFirestore.update.mockResolvedValueOnce(undefined);
    const result = await service.update('chat1', {
      nome: 'Chat Atualizado',
      empresaId: 'emp1',
    });
    expect(result.nome).toBe('Chat Atualizado');
  });

  it('remove deve lançar erro se chat não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(service.remove('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove deve remover chat com sucesso', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: true });
    mockFirestore.delete.mockResolvedValueOnce(undefined);
    const result = await service.remove('chat1');
    expect(result).toHaveProperty('message');
  });
});
