import { Test, TestingModule } from '@nestjs/testing';
import { FuncionarioService } from './funcionario/funcionario.service';

jest.mock('firebase-admin', () => ({
  auth: () => ({
    deleteUser: jest.fn().mockResolvedValue(true),
  }),
}));

const makeDocRef = (data, exists = true, id = 'func1') => ({
  exists,
  id,
  data: () => ({ id, ...data }),
  get: jest.fn().mockResolvedValue({ exists, data: () => ({ id, ...data }) }),
  update: jest.fn().mockResolvedValue(undefined),
  delete: jest.fn().mockResolvedValue(undefined),
});

const mockFuncionarioCollection = {
  doc: jest.fn(),
  add: jest.fn(),
};

const mockEmpresaCollection = {
  doc: jest.fn(),
};

const mockFirestore = {
  collection: jest.fn((name) => {
    if (name === 'funcionarios') return mockFuncionarioCollection;
    if (name === 'empresas') return mockEmpresaCollection;
  }),
};

describe('FuncionarioService - CRUD', () => {
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

  const baseFuncionarioData = {
    nome: 'João Silva',
    email: 'joao@empresa.com',
    cargo: 'Desenvolvedor',
    empresaId: 'emp1',
    senha: 'hashed_password',
  };

  it('deve criar um funcionário com sucesso', async () => {
    mockEmpresaCollection.doc.mockImplementation((id) => ({
      get: jest.fn().mockResolvedValue({ exists: true }),
      id,
    }));

    const savedFuncionario = {
      ...baseFuncionarioData,
      dataCadastro: new Date(),
    };

    const addRef = {
      get: jest.fn().mockResolvedValue(makeDocRef(savedFuncionario)),
    };

    mockFuncionarioCollection.add.mockResolvedValue(addRef);

    const result = await service.create(baseFuncionarioData);

    expect(mockFuncionarioCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'João Silva',
        email: 'joao@empresa.com',
        cargo: 'Desenvolvedor',
        empresaId: expect.objectContaining({ id: 'emp1' }),
        senha: 'hashed_password',
        dataCadastro: expect.any(Date),
      }),
    );

    expect(result).toEqual(
      expect.objectContaining({
        id: 'func1',
        nome: 'João Silva',
        email: 'joao@empresa.com',
        cargo: 'Desenvolvedor',
        empresaId: 'emp1',
        dataCadastro: expect.any(Date),
      }),
    );
  });

  it('deve atualizar um funcionário com sucesso', async () => {
    const docRef = makeDocRef(baseFuncionarioData);
    mockFuncionarioCollection.doc.mockReturnValue(docRef);

    const updateData = { cargo: 'Gerente de Projeto' };

    docRef.get
      .mockResolvedValueOnce(makeDocRef(baseFuncionarioData))
      .mockResolvedValueOnce(
        makeDocRef({ ...baseFuncionarioData, ...updateData }),
      );

    const result = await service.update('func1', updateData);

    expect(docRef.update).toHaveBeenCalledWith(updateData);
  });

  it('deve remover um funcionário com sucesso', async () => {
    const docRef = makeDocRef(baseFuncionarioData);
    mockFuncionarioCollection.doc.mockReturnValue(docRef);

    const result = await service.remove('func1');

    expect(docRef.delete).toHaveBeenCalled();
    expect(result).toEqual({
      message: 'Funcionário e usuário do Firebase deletados com sucesso',
    });
  });
});
