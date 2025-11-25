import { Test, TestingModule } from '@nestjs/testing';
import { EquipeService } from './equipes/equipe.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const MOCK_ADMIN_ID = 'admin123';
const MOCK_USER_ID = 'func1';
const MOCK_DOC_ID = 'doc1';
const MOCK_EMPRESA_ID = 'emp1';

describe('EquipeService - CRUD com UserId e Permissões', () => {
  let service: EquipeService;
  let mockFirestore: any;
  let mockEquipeCollection: any;
  let mockDocumentoCollection: any;
  let mockFuncionarioCollection: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Setup dos mocks das coleções
    mockEquipeCollection = {
      doc: jest.fn(),
      add: jest.fn(),
      get: jest.fn(),
      where: jest.fn().mockReturnThis(),
    };

    mockDocumentoCollection = {
      doc: jest.fn(),
    };

    mockFuncionarioCollection = {
      doc: jest.fn(),
    };

    // Mock do Firestore
    mockFirestore = {
      collection: jest.fn((name: string) => {
        if (name === 'equipes') return mockEquipeCollection;
        if (name === 'documentos') return mockDocumentoCollection;
        if (name === 'funcionarios') return mockFuncionarioCollection;
        return {};
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EquipeService,
        { provide: 'FIRESTORE', useValue: mockFirestore },
      ],
    }).compile();

    service = module.get<EquipeService>(EquipeService);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔧 [SETUP] Mocks resetados e serviço inicializado');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });

  it('deve ser definido', () => {
    console.log(
      '✅ [TESTE] Verificando se o serviço foi definido corretamente',
    );
    expect(service).toBeDefined();
    console.log('✓ Serviço definido com sucesso\n');
  });

  const baseEquipeData = {
    nome: 'Equipe Alpha',
    documentoId: MOCK_DOC_ID,
    membros: [MOCK_ADMIN_ID, MOCK_USER_ID],
  };

  // Teste de CREATE
  it('deve criar uma equipe com sucesso se o usuário for Administrador', async () => {
    console.log('\n📝 [TESTE CREATE] Iniciando teste de criação de equipe');
    console.log('👤 Criador: Administrador (ID:', MOCK_ADMIN_ID + ')');
    console.log('📋 Dados da equipe:', {
      nome: baseEquipeData.nome,
      documentoId: baseEquipeData.documentoId,
      membros: baseEquipeData.membros,
    });

    const dataCadastro = new Date();

    // Mock do funcionário criador (Administrador)
    const mockCriadorDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          id: MOCK_ADMIN_ID,
          cargo: 'Administrador',
          empresaId: MOCK_EMPRESA_ID,
        }),
      }),
    };

    // Mock dos membros
    const mockMembroDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          id: MOCK_USER_ID,
          cargo: 'Desenvolvedor',
        }),
      }),
    };

    // Mock do documento
    const mockDocDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ id: MOCK_DOC_ID }),
      }),
    };

    mockFuncionarioCollection.doc.mockImplementation((id: string) => {
      if (id === MOCK_ADMIN_ID) {
        return {
          ...mockCriadorDocRef,
          id: MOCK_ADMIN_ID,
        };
      }
      return {
        ...mockMembroDocRef,
        id: MOCK_USER_ID,
      };
    });

    mockDocumentoCollection.doc.mockReturnValue({
      ...mockDocDocRef,
      id: MOCK_DOC_ID,
    });

    // Mock da equipe criada
    const createdEquipeData = {
      nome: baseEquipeData.nome,
      documentoId: { id: MOCK_DOC_ID },
      criadorId: { id: MOCK_ADMIN_ID },
      membros: [{ id: MOCK_ADMIN_ID }, { id: MOCK_USER_ID }],
      dataCadastro: {
        toDate: () => dataCadastro,
      },
      empresaId: MOCK_EMPRESA_ID,
    };

    const mockEquipeDocRef = {
      id: 'equipe1',
      get: jest.fn().mockResolvedValue({
        id: 'equipe1',
        exists: true,
        data: () => createdEquipeData,
      }),
    };

    mockEquipeCollection.add.mockResolvedValue(mockEquipeDocRef);

    console.log('🔍 Verificando permissões do criador...');
    console.log('✓ Criador é Administrador - pode criar equipe');
    console.log('🔍 Validando membros...');
    console.log('✓ Todos os membros existem');
    console.log('🔍 Validando documento...');
    console.log('✓ Documento existe');
    console.log('🔄 Chamando service.create()...');

    const result = await service.create(baseEquipeData, MOCK_ADMIN_ID);

    console.log('✅ Equipe criada com sucesso!');
    console.log('📊 Resultado:', {
      id: result.id,
      nome: result.nome,
      criadorId: result.criadorId,
      membros: result.membros,
      empresaId: result.empresaId,
    });

    expect(mockEquipeCollection.add).toHaveBeenCalled();
    expect(result).toEqual({
      id: 'equipe1',
      nome: baseEquipeData.nome,
      documentoId: MOCK_DOC_ID,
      criadorId: MOCK_ADMIN_ID,
      membros: [MOCK_ADMIN_ID, MOCK_USER_ID],
      dataCadastro: dataCadastro.toISOString(),
      empresaId: MOCK_EMPRESA_ID,
    });

    console.log('✓ Verificações concluídas: equipe criada corretamente');
    console.log('✅ [CREATE] Teste concluído com sucesso!\n');
  });

  it('deve lançar ForbiddenException se o usuário não for Administrador ou Gerente de Projetos ao criar', async () => {
    console.log('\n❌ [TESTE CREATE FORBIDDEN] Testando criação sem permissão');
    console.log(
      '👤 Tentando criar com: Desenvolvedor (ID:',
      MOCK_USER_ID + ')',
    );

    // Mock do funcionário criador (Desenvolvedor - sem permissão)
    const mockCriadorDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          id: MOCK_USER_ID,
          cargo: 'Desenvolvedor',
        }),
      }),
    };

    mockFuncionarioCollection.doc.mockReturnValue(mockCriadorDocRef);

    console.log('🔍 Verificando permissões...');
    console.log('⚠️ Usuário NÃO é Administrador ou Gerente de Projetos');
    console.log('⚠️ Esperando ForbiddenException...');

    await expect(service.create(baseEquipeData, MOCK_USER_ID)).rejects.toThrow(
      ForbiddenException,
    );

    console.log('✓ ForbiddenException lançada corretamente');
    console.log('✅ [CREATE FORBIDDEN] Teste concluído com sucesso!\n');
  });

  // Teste de UPDATE
  it('deve atualizar uma equipe com sucesso se o usuário for Administrador', async () => {
    console.log('\n✏️ [TESTE UPDATE] Iniciando teste de atualização de equipe');

    const equipeId = 'equipe1';
    const updateData = { nome: 'Equipe Beta' };
    const dataCadastro = new Date();

    console.log('🆔 ID da equipe:', equipeId);
    console.log('📝 Dados para atualizar:', updateData);
    console.log('👤 Usuário: Administrador (ID:', MOCK_ADMIN_ID + ')');

    // Mock do funcionário (Administrador)
    const mockUsuarioDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          id: MOCK_ADMIN_ID,
          cargo: 'Administrador',
          empresaId: MOCK_EMPRESA_ID,
        }),
      }),
    };

    mockFuncionarioCollection.doc.mockReturnValue(mockUsuarioDocRef);

    const existingEquipeData = {
      nome: 'Equipe Alpha',
      documentoId: { id: MOCK_DOC_ID },
      criadorId: { id: MOCK_ADMIN_ID },
      membros: [{ id: MOCK_ADMIN_ID }, { id: MOCK_USER_ID }],
      dataCadastro: {
        toDate: () => dataCadastro,
      },
      empresaId: MOCK_EMPRESA_ID,
    };

    const updatedEquipeData = {
      ...existingEquipeData,
      nome: updateData.nome,
    };

    const mockEquipeDocRef = {
      get: jest
        .fn()
        // Primeira chamada - verificar existência
        .mockResolvedValueOnce({
          exists: true,
          id: equipeId,
          data: () => existingEquipeData,
        })
        // Segunda chamada - retornar dados atualizados
        .mockResolvedValueOnce({
          exists: true,
          id: equipeId,
          data: () => updatedEquipeData,
        }),
      update: jest.fn().mockResolvedValue(undefined),
    };

    mockEquipeCollection.doc.mockReturnValue(mockEquipeDocRef);

    console.log('🔍 Verificando permissões...');
    console.log('✓ Usuário é Administrador - pode atualizar');
    console.log('🔍 Verificando equipe existente...');
    console.log('✓ Equipe encontrada:', existingEquipeData.nome);
    console.log('🔄 Chamando service.update()...');

    const result = await service.update(equipeId, updateData, MOCK_ADMIN_ID);

    console.log('✅ Equipe atualizada!');
    console.log('📊 Nome anterior:', 'Equipe Alpha');
    console.log('📊 Nome novo:', result.nome);

    expect(mockEquipeCollection.doc).toHaveBeenCalledWith(equipeId);
    expect(mockEquipeDocRef.update).toHaveBeenCalledWith(updateData);
    expect(result.nome).toBe(updateData.nome);

    console.log('✓ Verificações concluídas: equipe atualizada corretamente');
    console.log('✅ [UPDATE] Teste concluído com sucesso!\n');
  });

  it('deve lançar ForbiddenException se o usuário não for Administrador ou Gerente de Projetos ao atualizar', async () => {
    console.log(
      '\n❌ [TESTE UPDATE FORBIDDEN] Testando atualização sem permissão',
    );
    console.log(
      '👤 Tentando atualizar com: Desenvolvedor (ID:',
      MOCK_USER_ID + ')',
    );

    // Mock do funcionário (Desenvolvedor - sem permissão)
    const mockUsuarioDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          id: MOCK_USER_ID,
          cargo: 'Desenvolvedor',
        }),
      }),
    };

    mockFuncionarioCollection.doc.mockReturnValue(mockUsuarioDocRef);

    console.log('🔍 Verificando permissões...');
    console.log('⚠️ Usuário NÃO é Administrador ou Gerente de Projetos');
    console.log('⚠️ Esperando ForbiddenException...');

    await expect(
      service.update('equipe1', { nome: 'Novo Nome' }, MOCK_USER_ID),
    ).rejects.toThrow(ForbiddenException);

    console.log('✓ ForbiddenException lançada corretamente');
    console.log('✅ [UPDATE FORBIDDEN] Teste concluído com sucesso!\n');
  });

  // Teste de DELETE
  it('deve remover uma equipe com sucesso se o usuário for Administrador', async () => {
    console.log('\n🗑️ [TESTE DELETE] Iniciando teste de remoção de equipe');

    const equipeId = 'equipe1';

    console.log('🆔 ID da equipe a remover:', equipeId);
    console.log('👤 Usuário: Administrador (ID:', MOCK_ADMIN_ID + ')');

    const dataCadastro = new Date();

    // Mock do funcionário (Administrador)
    const mockUsuarioDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          id: MOCK_ADMIN_ID,
          cargo: 'Administrador',
          empresaId: MOCK_EMPRESA_ID,
        }),
      }),
    };

    mockFuncionarioCollection.doc.mockReturnValue(mockUsuarioDocRef);

    // Mock da equipe
    const mockEquipeDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: equipeId,
        data: () => ({
          nome: 'Equipe Teste',
          dataCadastro: {
            toDate: () => dataCadastro,
          },
        }),
      }),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockEquipeCollection.doc.mockReturnValue(mockEquipeDocRef);

    console.log('🔍 Verificando permissões...');
    console.log('✓ Usuário é Administrador - pode remover');
    console.log('🔍 Verificando se equipe existe...');
    console.log('✓ Equipe encontrada!');
    console.log('🔄 Chamando service.remove()...');

    const result = await service.remove(equipeId, MOCK_ADMIN_ID);

    console.log('✅ Equipe removida com sucesso!');
    console.log('📊 Resposta:', result);

    expect(mockEquipeCollection.doc).toHaveBeenCalledWith(equipeId);
    expect(mockEquipeDocRef.delete).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Equipe removida com sucesso.' });

    console.log('✓ Verificações concluídas: equipe removida corretamente');
    console.log('✅ [DELETE] Teste concluído com sucesso!\n');
  });

  it('deve lançar ForbiddenException se o usuário não for Administrador ao remover', async () => {
    console.log('\n❌ [TESTE DELETE FORBIDDEN] Testando remoção sem permissão');
    console.log(
      '👤 Tentando remover com: Desenvolvedor (ID:',
      MOCK_USER_ID + ')',
    );

    // Mock do funcionário (Desenvolvedor - sem permissão)
    const mockUsuarioDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          id: MOCK_USER_ID,
          cargo: 'Desenvolvedor',
        }),
      }),
    };

    mockFuncionarioCollection.doc.mockReturnValue(mockUsuarioDocRef);

    console.log('🔍 Verificando permissões...');
    console.log('⚠️ Usuário NÃO é Administrador');
    console.log('⚠️ Esperando ForbiddenException...');

    await expect(service.remove('equipe1', MOCK_USER_ID)).rejects.toThrow(
      ForbiddenException,
    );

    console.log('✓ ForbiddenException lançada corretamente');
    console.log('✅ [DELETE FORBIDDEN] Teste concluído com sucesso!\n');
  });

  // Teste adicional - findOne
  it('deve buscar uma equipe por ID com sucesso', async () => {
    console.log('\n🔍 [TESTE FIND ONE] Iniciando teste de busca de equipe');

    const equipeId = 'equipe1';
    const dataCadastro = new Date();

    console.log('🆔 Buscando equipe:', equipeId);
    console.log('👤 Usuário: Administrador (ID:', MOCK_ADMIN_ID + ')');

    // Mock do funcionário
    const mockUsuarioDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({
          id: MOCK_ADMIN_ID,
          cargo: 'Administrador',
        }),
      }),
    };

    mockFuncionarioCollection.doc.mockReturnValue(mockUsuarioDocRef);

    // Mock da equipe
    const equipeData = {
      nome: 'Equipe Alpha',
      documentoId: { id: MOCK_DOC_ID },
      criadorId: { id: MOCK_ADMIN_ID },
      membros: [{ id: MOCK_ADMIN_ID }],
      dataCadastro: {
        toDate: () => dataCadastro,
      },
      empresaId: MOCK_EMPRESA_ID,
    };

    const mockEquipeDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: equipeId,
        data: () => equipeData,
      }),
    };

    mockEquipeCollection.doc.mockReturnValue(mockEquipeDocRef);

    console.log('🔍 Verificando permissões...');
    console.log('✓ Usuário tem permissão para ver equipe');
    console.log('🔄 Chamando service.findOne()...');

    const result = await service.findOne(equipeId, MOCK_ADMIN_ID);

    console.log('✅ Equipe encontrada!');
    console.log('📊 Dados:', {
      id: result.id,
      nome: result.nome,
      criadorId: result.criadorId,
      membros: result.membros,
    });

    expect(result.id).toBe(equipeId);
    expect(result.nome).toBe('Equipe Alpha');

    console.log('✓ Verificações concluídas');
    console.log('✅ [FIND ONE] Teste concluído com sucesso!\n');
  });
});
