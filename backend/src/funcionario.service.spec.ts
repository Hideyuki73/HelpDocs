import { Test, TestingModule } from '@nestjs/testing';
import { FuncionarioService } from './funcionario/funcionario.service';
import { NotFoundException } from '@nestjs/common';

const mockDoc = (data = {}, exists = true) => ({
  exists,
  id: 'func1',
  data: () => data,
  get: jest.fn().mockResolvedValue({ exists, data: () => data, id: 'func1' }),
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

describe('FuncionarioService', () => {
  let service: FuncionarioService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FuncionarioService,
        { provide: 'FIRESTORE', useValue: mockFirestore },
      ],
    }).compile();

    service = module.get<FuncionarioService>(FuncionarioService);
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve lançar erro se empresa não existir ao criar', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(
      service.create({
        nome: 'Funcionario Teste',
        email: 'teste@teste.com',
        cargo: 'Dev',
        senha: '123',
        empresaId: 'emp1',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve criar funcionário com sucesso', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: true });
    mockFirestore.add.mockResolvedValueOnce({
      get: jest.fn().mockResolvedValue(mockDoc({ nome: 'Funcionario Teste' })),
    });
    const result = await service.create({
      nome: 'Funcionario Teste',
      email: 'teste@teste.com',
      cargo: 'Dev',
      senha: '123',
      empresaId: 'emp1',
    });
    expect(result).toHaveProperty('id');
    expect(result.nome).toBe('Funcionario Teste');
  });

  it('findAll deve retornar lista de funcionários', async () => {
    mockFirestore.get.mockResolvedValue({
      docs: [
        mockDoc({ nome: 'Funcionario 1' }),
        mockDoc({ nome: 'Funcionario 2' }),
      ],
    });
    const result = await service.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it('findOne deve retornar funcionário se existir', async () => {
    mockFirestore.get.mockResolvedValueOnce(mockDoc({ nome: 'Funcionario 1' }));
    const result = await service.findOne('func1');
    expect(result).toHaveProperty('id');
    expect(result.nome).toBe('Funcionario 1');
  });

  it('findOne deve lançar erro se funcionário não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(service.findOne('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update deve lançar erro se funcionário não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(
      service.update('naoexiste', { nome: 'Novo Nome' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('update deve atualizar funcionário com sucesso', async () => {
    mockFirestore.get
      .mockResolvedValueOnce({ exists: true }) // empresa
      .mockResolvedValueOnce({ exists: true }) // funcionario
      .mockResolvedValueOnce(mockDoc({ nome: 'Funcionario Atualizado' })); // updatedDoc
    mockFirestore.update.mockResolvedValueOnce(undefined);
    const result = await service.update('func1', {
      nome: 'Funcionario Atualizado',
      empresaId: 'emp1',
    });
    expect(result.nome).toBe('Funcionario Atualizado');
  });

  it('remove deve lançar erro se funcionário não existir', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false });
    await expect(service.remove('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove deve remover funcionário com sucesso', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: true });
    mockFirestore.delete.mockResolvedValueOnce(undefined);
    const result = await service.remove('func1');
    expect(result).toHaveProperty('message');
  });

  it('deve lançar erro se código de convite for inválido ao associar', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: false }); // Empresa não encontrada
    await expect(service.associateWithEmpresa('func1', 'codigoInvalido')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve lançar erro se funcionário não existir ao associar', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: true }); // Empresa encontrada
    mockFirestore.get.mockResolvedValueOnce({ exists: false }); // Funcionário não encontrado
    await expect(service.associateWithEmpresa('naoexiste', 'codigoValido')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve associar funcionário à empresa com sucesso', async () => {
    mockFirestore.get.mockResolvedValueOnce({ exists: true }); // Empresa encontrada
    mockFirestore.get.mockResolvedValueOnce({ exists: true }); // Funcionário encontrado
    mockFirestore.update.mockResolvedValueOnce(undefined); // Atualização bem-sucedida
    const result = await service.associateWithEmpresa('func1', 'codigoValido');
    expect(result).toHaveProperty('empresaId', 'codigoValido');
  });
});
