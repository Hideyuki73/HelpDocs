import { Test, TestingModule } from '@nestjs/testing';
import { IaHelperService } from './ia-helper/ia-helper.service';
import { NotFoundException } from '@nestjs/common';

const mockDoc = (data = {}, exists = true) => ({
  exists,
  id: 'ia1',
  data: () => data,
  get: jest.fn().mockResolvedValue({ exists, data: () => data, id: 'ia1' }),
});

const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  get: jest.fn(),
  add: jest.fn(),
};

describe('IaHelperService', () => {
  let service: IaHelperService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IaHelperService,
        { provide: 'FIRESTORE', useValue: mockFirestore },
      ],
    }).compile();

    service = module.get<IaHelperService>(IaHelperService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve lançar erro se funcionário não existir ao criar', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(
      service.create({
        pergunta: 'Pergunta?',
        resposta: 'Resposta!',
        criadoPor: 'func1',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve criar IA Helper com sucesso', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: true });
    mockFirestore.add.mockResolvedValueOnce({
      get: jest.fn().mockResolvedValue(mockDoc({ pergunta: 'Pergunta?' })),
    });
    const result = await service.create({
      pergunta: 'Pergunta?',
      resposta: 'Resposta!',
      criadoPor: 'func1',
    });
    expect(result).toHaveProperty('id');
    expect(result.pergunta).toBe('Pergunta?');
  });

  it('findAll deve retornar lista de IA Helpers', async () => {
    mockFirestore.get.mockResolvedValue({
      docs: [mockDoc({ pergunta: 'P1' }), mockDoc({ pergunta: 'P2' })],
    });
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });
});
