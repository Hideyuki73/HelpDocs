import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaService } from './empresa/empresa.service';
import { NotFoundException } from '@nestjs/common';

const mockDoc = (data = {}, exists = true) => ({
  exists,
  id: 'empresa1',
  data: () => data,
  get: jest
    .fn()
    .mockResolvedValue({ exists, data: () => data, id: 'empresa1' }),
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

describe('EmpresaService', () => {
  let service: EmpresaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaService,
        { provide: 'FIRESTORE', useValue: mockFirestore },
      ],
    }).compile();

    service = module.get<EmpresaService>(EmpresaService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar empresa com sucesso', async () => {
    mockFirestore.add.mockResolvedValueOnce({
      get: jest.fn().mockResolvedValue(mockDoc({ nome: 'Empresa Teste' })),
    });
    const result = await service.create({
      nome: 'Empresa Teste',
      cnpj: '123456789',
      email: 'empresa@teste.com',
      telefone: '11999999999',
      endereco: 'Rua Teste, 123',
    });
    expect(result).toHaveProperty('id');
    expect(result.nome).toBe('Empresa Teste');
  });

  it('findAll deve retornar lista de empresas', async () => {
    mockFirestore.get.mockResolvedValue({
      docs: [mockDoc({ nome: 'Empresa 1' }), mockDoc({ nome: 'Empresa 2' })],
    });
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it('findOne deve retornar empresa se existir', async () => {
    mockFirestore.get.mockResolvedValueOnce(mockDoc({ nome: 'Empresa 1' }));
    const result = await service.findOne('empresa1');
    expect(result).toHaveProperty('id');
    expect(result.nome).toBe('Empresa 1');
  });

  it('findOne deve lançar erro se empresa não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(service.findOne('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update deve lançar erro se empresa não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(
      service.update('naoexiste', { nome: 'Novo Nome' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('update deve atualizar empresa com sucesso', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true }) // empresa
      .mockResolvedValueOnce(mockDoc({ nome: 'Empresa Atualizada' })); // updatedDoc
    mockFirestore.update.mockResolvedValueOnce(undefined);
    const result = await service.update('empresa1', {
      nome: 'Empresa Atualizada',
    });
    expect(result.nome).toBe('Empresa Atualizada');
  });

  it('remove deve lançar erro se empresa não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(service.remove('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove deve remover empresa com sucesso', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: true });
    mockFirestore.delete.mockResolvedValueOnce(undefined);
    const result = await service.remove('empresa1');
    expect(result).toHaveProperty('message');
  });
});
