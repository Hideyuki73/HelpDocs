import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EquipeService } from './equipes/equipe.service';

const createDocMock = (data: any = {}, exists = true) => {
  const docMock: any = {
    exists,
    id: data.id || 'mockId',
    data: () => data,
    get: jest.fn().mockResolvedValue({
      exists,
      id: data.id || 'mockId',
      data: () => data,
    }),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  };
  return docMock;
};

describe('EquipeService', () => {
  let service: EquipeService;
  let firestoreMock: any;
  let equipeCollectionMock: any;
  let documentoCollectionMock: any;
  let funcionarioCollectionMock: any;

  beforeEach(async () => {
    equipeCollectionMock = {
      doc: jest.fn(),
      add: jest.fn(),
      get: jest.fn(),
    };

    documentoCollectionMock = {
      doc: jest.fn(),
    };

    funcionarioCollectionMock = {
      doc: jest.fn(),
    };

    firestoreMock = {
      collection: jest.fn((name: string) => {
        if (name === 'equipes') return equipeCollectionMock;
        if (name === 'documentos') return documentoCollectionMock;
        if (name === 'funcionarios') return funcionarioCollectionMock;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipeService,
        { provide: 'FIRESTORE', useValue: firestoreMock },
      ],
    }).compile();

    service = module.get<EquipeService>(EquipeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar uma equipe com sucesso', async () => {
      const dto = {
        nome: 'Equipe A',
        documentoId: 'doc1',
        criadorId: 'func1',
        membros: ['func2', 'func3'],
      };

      const docDocMock = createDocMock({ id: 'doc1' });
      const criadorDocMock = createDocMock({ id: 'func1' });
      const membroDocMock = createDocMock({ id: 'func2' });
      const membro2DocMock = createDocMock({ id: 'func3' });

      documentoCollectionMock.doc.mockReturnValue(docDocMock);
      funcionarioCollectionMock.doc
        .mockReturnValueOnce(criadorDocMock) // criador
        .mockReturnValueOnce(membroDocMock) // membro 1
        .mockReturnValueOnce(membro2DocMock); // membro 2

      const equipeDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          id: 'equipe1',
          data: () => ({
            nome: dto.nome,
            documentoId: { id: 'doc1' },
            criadorId: { id: 'func1' },
            membros: [{ id: 'func2' }, { id: 'func3' }],
            dataCadastro: expect.any(Date),
          }),
        }),
      };

      equipeCollectionMock.add.mockResolvedValue(equipeDocRef);

      const result = await service.create(dto);

      expect(result).toEqual({
        id: 'equipe1',
        nome: 'Equipe A',
        documentoId: 'doc1',
        criadorId: 'func1',
        membros: ['func2', 'func3'],
        dataCadastro: expect.any(Date),
      });

      expect(equipeCollectionMock.add).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar todas as equipes', async () => {
      const snapshotMock = {
        docs: [
          {
            id: 'equipe1',
            data: () => ({
              nome: 'Equipe A',
              documentoId: { id: 'doc1' },
              criadorId: { id: 'func1' },
              membros: [{ id: 'func2' }],
              dataCadastro: new Date(),
            }),
          },
        ],
      };

      equipeCollectionMock.get.mockResolvedValue(snapshotMock);

      const result = await service.findAll();

      expect(result).toEqual([
        {
          id: 'equipe1',
          nome: 'Equipe A',
          documentoId: 'doc1',
          criadorId: 'func1',
          membros: ['func2'],
          dataCadastro: expect.any(Date),
        },
      ]);
    });
  });

  describe('findOne', () => {
    it('deve retornar uma equipe existente', async () => {
      const docMock = createDocMock({
        nome: 'Equipe A',
        documentoId: { id: 'doc1' },
        criadorId: { id: 'func1' },
        membros: [{ id: 'func2' }],
        dataCadastro: new Date(),
      });

      equipeCollectionMock.doc.mockReturnValue(docMock);

      const result = await service.findOne('equipe1');

      expect(result).toEqual({
        id: 'mockId',
        nome: 'Equipe A',
        documentoId: 'doc1',
        criadorId: 'func1',
        membros: ['func2'],
        dataCadastro: expect.any(Date),
      });
    });

    it('deve lançar erro se equipe não existir', async () => {
      const docMock = createDocMock({}, false);
      equipeCollectionMock.doc.mockReturnValue(docMock);

      await expect(service.findOne('invalido')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar equipe com sucesso', async () => {
      const dto = { nome: 'Equipe Atualizada' };

      const equipeDocMock = createDocMock({
        nome: 'Equipe A',
        documentoId: { id: 'doc1' },
        criadorId: { id: 'func1' },
        membros: [],
        dataCadastro: new Date(),
      });

      equipeCollectionMock.doc.mockReturnValue(equipeDocMock);

      const result = await service.update('equipe1', dto);

      expect(equipeDocMock.update).toHaveBeenCalledWith({
        nome: 'Equipe Atualizada',
      });
      expect(result.nome).toBe('Equipe A'); // nome no retorno é o nome antigo, pois não atualizamos no Firestore fake
    });

    it('deve lançar erro se equipe não existir', async () => {
      const equipeDocMock = createDocMock({}, false);
      equipeCollectionMock.doc.mockReturnValue(equipeDocMock);

      await expect(
        service.update('invalido', { nome: 'teste' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover equipe com sucesso', async () => {
      const equipeDocMock = createDocMock({
        nome: 'Equipe A',
        documentoId: { id: 'doc1' },
        criadorId: { id: 'func1' },
        membros: [],
        dataCadastro: new Date(),
      });

      equipeCollectionMock.doc.mockReturnValue(equipeDocMock);

      const result = await service.remove('equipe1');

      expect(equipeDocMock.delete).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Equipe removida com sucesso.' });
    });

    it('deve lançar erro se equipe não existir', async () => {
      const equipeDocMock = createDocMock({}, false);
      equipeCollectionMock.doc.mockReturnValue(equipeDocMock);

      await expect(service.remove('invalido')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
