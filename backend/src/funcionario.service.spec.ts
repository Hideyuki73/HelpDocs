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

const mockFuncionarioCollection = {
  doc: jest.fn(),
  add: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const mockEmpresaCollection = {
  doc: jest.fn(),
  add: jest.fn(),
  get: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockFirestore = {
  collection: jest.fn((name) => {
    if (name === 'funcionarios') return mockFuncionarioCollection;
    if (name === 'empresas') return mockEmpresaCollection;
    return {};
  }),
};

describe('FuncionarioService', () => {
  let service: FuncionarioService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Reset mocks
    Object.values(mockFuncionarioCollection).forEach(
      (fn) => typeof fn.mockReset === 'function' && fn.mockReset(),
    );
    Object.values(mockEmpresaCollection).forEach(
      (fn) => typeof fn.mockReset === 'function' && fn.mockReset(),
    );

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
    mockEmpresaCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });
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
    mockEmpresaCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: true }),
    });
    mockFuncionarioCollection.add.mockResolvedValueOnce({
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
    mockFuncionarioCollection.get.mockResolvedValue({
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
    mockFuncionarioCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue(mockDoc({ nome: 'Funcionario 1' })),
    });
    const result = await service.findOne('func1');
    expect(result).toHaveProperty('id');
    expect(result.nome).toBe('Funcionario 1');
  });

  it('findOne deve lançar erro se funcionário não existir', async () => {
    mockFuncionarioCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });
    await expect(service.findOne('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('update deve lançar erro se funcionário não existir', async () => {
    mockFuncionarioCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });
    await expect(
      service.update('naoexiste', { nome: 'Novo Nome' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('update deve atualizar funcionário com sucesso', async () => {
    mockFuncionarioCollection.doc.mockReturnValue({
      get: jest
        .fn()
        .mockResolvedValueOnce({ exists: true }) // funcionario
        .mockResolvedValueOnce(mockDoc({ nome: 'Funcionario Atualizado' })), // updatedDoc
      update: jest.fn().mockResolvedValue(undefined),
    });
    mockEmpresaCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: true }),
    });
    const result = await service.update('func1', {
      nome: 'Funcionario Atualizado',
      empresaId: 'emp1',
    });
    expect(result.nome).toBe('Funcionario Atualizado');
  });

  it('remove deve lançar erro se funcionário não existir', async () => {
    mockFuncionarioCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });
    await expect(service.remove('naoexiste')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove deve remover funcionário com sucesso', async () => {
    mockFuncionarioCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: true }),
      delete: jest.fn().mockResolvedValue(undefined),
    });
    const result = await service.remove('func1');
    expect(result).toHaveProperty('message');
  });

  it('deve lançar erro se código de convite for inválido ao associar', async () => {
    mockEmpresaCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });
    await expect(
      service.associateWithEmpresa('func1', 'codigoInvalido'),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar erro se funcionário não existir ao associar', async () => {
    mockEmpresaCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: true }),
    });
    mockFuncionarioCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });
    await expect(
      service.associateWithEmpresa('naoexiste', 'codigoValido'),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve associar funcionário à empresa com sucesso', async () => {
    mockEmpresaCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: true }),
    });
    mockFuncionarioCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: true }),
      update: jest.fn().mockResolvedValue(undefined),
    });
    const result = await service.associateWithEmpresa('func1', 'codigoValido');
    expect(result).toHaveProperty('empresaId', 'codigoValido');
  });

  it('deve lançar erro se funcionário não existir ao criar empresa', async () => {
    mockFuncionarioCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: false }),
    });
    await expect(
      service.createEmpresa('func1', { nome: 'Empresa X' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve criar empresa e associar ao funcionário', async () => {
    mockFuncionarioCollection.doc.mockReturnValue({
      get: jest.fn().mockResolvedValue({ exists: true }),
      update: jest.fn().mockResolvedValue(undefined),
    });
    mockEmpresaCollection.add.mockResolvedValue({
      get: jest.fn().mockResolvedValue({
        id: 'empresa1',
        data: () => ({
          nome: 'Empresa X',
          criadorId: { id: 'func1' },
          dataCadastro: new Date(),
        }),
      }),
    });

    const result = await service.createEmpresa('func1', { nome: 'Empresa X' });
    expect(result.id).toBe('empresa1');
    expect(result.nome).toBe('Empresa X');
  });
});
