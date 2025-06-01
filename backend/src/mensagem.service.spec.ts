import { Test, TestingModule } from '@nestjs/testing';
import { MensagemService } from './mensagem/mensagem.service';
import { NotFoundException } from '@nestjs/common';

const mockDoc = (data = {}, exists = true) => ({
  exists,
  id: 'msg1',
  data: () => data,
  get: jest.fn().mockResolvedValue({ exists, data: () => data, id: 'msg1' }),
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

describe('MensagemService', () => {
  let service: MensagemService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MensagemService,
        { provide: 'FIRESTORE', useValue: mockFirestore },
      ],
    }).compile();

    service = module.get<MensagemService>(MensagemService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve lançar erro se chat não existir ao criar', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false }); // chat
    await expect(
      service.create({
        chatId: 'chat1',
        conteudo: 'Oi',
        enviadoPor: 'func1',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar erro se funcionário não existir ao criar', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true }) // chat
      .mockResolvedValueOnce({ exists: false }); // funcionario
    await expect(
      service.create({
        chatId: 'chat1',
        conteudo: 'Oi',
        enviadoPor: 'func1',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve criar mensagem com sucesso', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true }) // chat
      .mockResolvedValueOnce({ exists: true }); // funcionario
    mockFirestore.add.mockResolvedValueOnce({
      get: jest.fn().mockResolvedValue(mockDoc({ conteudo: 'Oi' })),
    });
    const result = await service.create({
      chatId: 'chat1',
      conteudo: 'Oi',
      enviadoPor: 'func1',
    });
    expect(result).toHaveProperty('id');
    expect(result.conteudo).toBe('Oi');
  });

  it('findAll deve retornar lista de mensagens', async () => {
    mockFirestore.get.mockResolvedValue({
      docs: [mockDoc({ conteudo: 'Oi' }), mockDoc({ conteudo: 'Olá' })],
    });
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it('findOne deve retornar mensagem se existir', async () => {
    mockFirestore.get.mockResolvedValueOnce(mockDoc({ conteudo: 'Oi' }));
    const result = await service.findOne('msg1');
    expect(result).toHaveProperty('id');
    expect(result.conteudo).toBe('Oi');
  });

  it('findOne deve lançar erro se mensagem não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(service.findOne('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update deve lançar erro se mensagem não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(
      service.update('naoexiste', { conteudo: 'Novo' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('update deve atualizar mensagem com sucesso', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true }) // mensagem
      .mockResolvedValueOnce(mockDoc({ conteudo: 'Atualizado' })); // updatedDoc
    mockFirestore.update.mockResolvedValueOnce(undefined);
    const result = await service.update('msg1', { conteudo: 'Atualizado' });
    expect(result.conteudo).toBe('Atualizado');
  });

  it('remove deve lançar erro se mensagem não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(service.remove('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove deve remover mensagem com sucesso', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: true });
    mockFirestore.delete.mockResolvedValueOnce(undefined);
    const result = await service.remove('msg1');
    expect(result).toHaveProperty('message');
  });
});
