import { Test, TestingModule } from '@nestjs/testing';
import { FuncionarioService } from './funcionario.service';
import { NotFoundException } from '@nestjs/common';

describe('FuncionarioService', () => {
  let service: FuncionarioService;
  let mockFirestore: any;

  beforeEach(async () => {
    mockFirestore = {
      collection: jest.fn().mockImplementation((name) => ({
        doc: jest.fn().mockImplementation((id) => ({
          get: jest.fn(),
          update: jest.fn(),
        })),
        add: jest.fn(),
        get: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FuncionarioService,
        { provide: 'FIRESTORE', useValue: mockFirestore },
      ],
    }).compile();

    service = module.get<FuncionarioService>(FuncionarioService);
    service['funcionarioCollection'] = mockFirestore.collection('funcionarios');
    service['empresaCollection'] = mockFirestore.collection('empresas');
  });

  describe('createEmpresa', () => {
    it('deve lançar NotFoundException se o funcionário não existir', async () => {
      mockFirestore.collection('funcionarios').doc().get.mockResolvedValue({ exists: false });

      await expect(
        service.createEmpresa('func1', { nome: 'Empresa X' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve criar empresa e associar ao funcionário', async () => {
      mockFirestore.collection('funcionarios').doc().get.mockResolvedValue({ exists: true });
      mockFirestore.collection('empresas').add.mockResolvedValue({
        get: jest.fn().mockResolvedValue({
          id: 'empresa1',
          data: () => ({
            nome: 'Empresa X',
            criadorId: { id: 'func1' },
            dataCadastro: new Date(),
          }),
        }),
      });
      mockFirestore.collection('funcionarios').doc().update.mockResolvedValue(undefined);

      const result = await service.createEmpresa('func1', { nome: 'Empresa X' });
      expect(result.id).toBe('empresa1');
      expect(result.nome).toBe('Empresa X');
    });
  });
});