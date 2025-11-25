import { Test, TestingModule } from '@nestjs/testing';
import { EmpresaService } from './empresa/empresa.service';
import { NotFoundException } from '@nestjs/common';

// Mock do firebase-admin
jest.mock('firebase-admin', () => {
  const mockBatch = {
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    commit: jest.fn().mockResolvedValue(undefined),
  };

  const mockDocRef = {
    get: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  const mockCollectionRef = {
    doc: jest.fn().mockReturnValue(mockDocRef),
    add: jest.fn(),
    where: jest.fn().mockReturnThis(),
    get: jest.fn(),
  };

  return {
    firestore: jest.fn(() => ({
      collection: jest.fn().mockReturnValue(mockCollectionRef),
      batch: jest.fn().mockReturnValue(mockBatch),
      FieldValue: {
        delete: jest.fn(),
        arrayRemove: jest.fn(),
      },
    })),
  };
});

const MOCK_USER_ID = 'user123';

describe('EmpresaService - CRUD com UserId', () => {
  let service: EmpresaService;
  let mockFirestore: any;
  let mockEmpresaCollection: any;
  let mockFuncionarioCollection: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmpresaService],
    }).compile();

    service = module.get<EmpresaService>(EmpresaService);

    // Obter referências aos mocks
    const admin = require('firebase-admin');
    mockFirestore = admin.firestore();
    mockEmpresaCollection = mockFirestore.collection('empresas');
    mockFuncionarioCollection = mockFirestore.collection('funcionarios');

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

  // Teste de CREATE
  it('deve criar uma empresa com sucesso, incluindo o criadorId', async () => {
    console.log('\n📝 [TESTE CREATE] Iniciando teste de criação de empresa');

    const newEmpresaData = {
      nome: 'Empresa Teste',
      cnpj: '12345678901234',
      email: 'empresa@teste.com',
      telefone: '11999999999',
      endereco: 'Rua Teste, 123',
    };

    console.log('📋 Dados da empresa:', newEmpresaData);
    console.log('👤 Usuário criador:', MOCK_USER_ID);

    const mockDocId = 'empresa1';
    const createdEmpresaData = {
      ...newEmpresaData,
      criadorUid: MOCK_USER_ID,
      conviteCodigo: 'ABC12345',
      membros: [MOCK_USER_ID],
      dataCadastro: new Date(),
    };

    // Mock do add retornando uma referência com id
    const mockDocRef = {
      id: mockDocId,
      get: jest.fn().mockResolvedValue({
        id: mockDocId,
        exists: true,
        data: () => createdEmpresaData,
      }),
    };

    mockEmpresaCollection.add.mockResolvedValue(mockDocRef);

    // Mock do update do funcionário
    const mockFuncionarioDocRef = {
      update: jest.fn().mockResolvedValue(undefined),
    };
    mockFuncionarioCollection.doc.mockReturnValue(mockFuncionarioDocRef);

    console.log('🔄 Chamando service.create()...');
    const result = await service.create(newEmpresaData, MOCK_USER_ID);

    console.log('✅ Empresa criada com ID:', result.id);
    console.log('📊 Resultado:', {
      id: result.id,
      nome: (result as any).nome,
      criadorUid: (result as any).criadorUid,
      membros: (result as any).membros,
    });

    // Verificações
    expect(mockEmpresaCollection.add).toHaveBeenCalledWith(
      expect.objectContaining({
        ...newEmpresaData,
        criadorUid: MOCK_USER_ID,
        membros: [MOCK_USER_ID],
        conviteCodigo: expect.any(String),
        dataCadastro: expect.any(Date),
      }),
    );

    expect(mockFuncionarioCollection.doc).toHaveBeenCalledWith(MOCK_USER_ID);
    expect(mockFuncionarioDocRef.update).toHaveBeenCalledWith({
      empresaId: mockDocId,
      cargo: 'Administrador',
    });

    console.log('✓ Verificações concluídas: empresa adicionada corretamente');
    console.log('✓ Funcionário atualizado com empresaId e cargo');

    expect(result).toEqual({
      id: mockDocId,
      ...createdEmpresaData,
    });

    console.log('✅ [CREATE] Teste concluído com sucesso!\n');
  });

  // Teste de UPDATE
  it('deve atualizar uma empresa com sucesso', async () => {
    console.log(
      '\n✏️ [TESTE UPDATE] Iniciando teste de atualização de empresa',
    );

    const empresaId = 'empresa1';
    const updateData = { nome: 'Empresa Atualizada' };

    console.log('🆔 ID da empresa:', empresaId);
    console.log('📝 Dados para atualizar:', updateData);

    const existingEmpresa = {
      nome: 'Empresa Antiga',
      cnpj: '12345678901234',
      email: 'empresa@teste.com',
      telefone: '11999999999',
      endereco: 'Rua Teste, 123',
    };
    const updatedEmpresa = {
      ...existingEmpresa,
      ...updateData,
    };

    const mockDocRef = {
      get: jest
        .fn()
        // Primeira chamada - verificar existência
        .mockResolvedValueOnce({
          exists: true,
          id: empresaId,
          data: () => existingEmpresa,
        })
        // Segunda chamada - retornar dados atualizados
        .mockResolvedValueOnce({
          exists: true,
          id: empresaId,
          data: () => updatedEmpresa,
        }),
      update: jest.fn().mockResolvedValue(undefined),
    };

    mockEmpresaCollection.doc.mockReturnValue(mockDocRef);

    console.log('🔍 Verificando empresa existente...');
    console.log('📄 Empresa encontrada:', existingEmpresa.nome);
    console.log('🔄 Chamando service.update()...');

    const result = await service.update(empresaId, updateData);

    console.log('✅ Empresa atualizada!');
    console.log('📊 Nome anterior:', existingEmpresa.nome);
    console.log('📊 Nome novo:', (result as any).nome);

    expect(mockEmpresaCollection.doc).toHaveBeenCalledWith(empresaId);
    expect(mockDocRef.get).toHaveBeenCalledTimes(2);
    expect(mockDocRef.update).toHaveBeenCalledWith(updateData);
    expect(result).toEqual({
      id: empresaId,
      ...updatedEmpresa,
    });

    console.log('✓ Verificações concluídas: empresa atualizada corretamente');
    console.log('✅ [UPDATE] Teste concluído com sucesso!\n');
  });

  it('deve lançar NotFoundException ao tentar atualizar empresa inexistente', async () => {
    console.log(
      '\n❌ [TESTE UPDATE ERROR] Testando atualização de empresa inexistente',
    );

    const mockDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: false,
      }),
      update: jest.fn(),
    };

    mockEmpresaCollection.doc.mockReturnValue(mockDocRef);

    console.log('🔍 Tentando atualizar empresa "naoexiste"...');
    console.log('⚠️ Esperando NotFoundException...');

    await expect(
      service.update('naoexiste', { nome: 'Novo Nome' }),
    ).rejects.toThrow(NotFoundException);

    console.log('✓ NotFoundException lançada corretamente');
    expect(mockDocRef.update).not.toHaveBeenCalled();
    console.log('✓ Método update não foi chamado (comportamento esperado)');
    console.log('✅ [UPDATE ERROR] Teste concluído com sucesso!\n');
  });

  // Teste de DELETE
  it('deve remover uma empresa com sucesso', async () => {
    console.log('\n🗑️ [TESTE DELETE] Iniciando teste de remoção de empresa');

    const empresaId = 'empresa1';
    console.log('🆔 ID da empresa a remover:', empresaId);

    const mockDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: empresaId,
        data: () => ({
          nome: 'Empresa Teste',
        }),
      }),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockEmpresaCollection.doc.mockReturnValue(mockDocRef);

    console.log('🔍 Verificando se empresa existe...');
    console.log('📄 Empresa encontrada!');
    console.log('🔄 Chamando service.remove()...');

    const result = await service.remove(empresaId);

    console.log('✅ Empresa removida com sucesso!');
    console.log('📊 Resposta:', result);

    expect(mockEmpresaCollection.doc).toHaveBeenCalledWith(empresaId);
    expect(mockDocRef.get).toHaveBeenCalled();
    expect(mockDocRef.delete).toHaveBeenCalled();
    expect(result).toEqual({
      message: 'Empresa removida com sucesso',
    });

    console.log('✓ Verificações concluídas: empresa removida corretamente');
    console.log('✅ [DELETE] Teste concluído com sucesso!\n');
  });

  it('deve lançar NotFoundException ao tentar remover empresa inexistente', async () => {
    console.log(
      '\n❌ [TESTE DELETE ERROR] Testando remoção de empresa inexistente',
    );

    const mockDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: false,
      }),
      delete: jest.fn(),
    };

    mockEmpresaCollection.doc.mockReturnValue(mockDocRef);

    console.log('🔍 Tentando remover empresa "naoexiste"...');
    console.log('⚠️ Esperando NotFoundException...');

    await expect(service.remove('naoexiste')).rejects.toThrow(
      NotFoundException,
    );

    console.log('✓ NotFoundException lançada corretamente');
    expect(mockDocRef.delete).not.toHaveBeenCalled();
    console.log('✓ Método delete não foi chamado (comportamento esperado)');
    console.log('✅ [DELETE ERROR] Teste concluído com sucesso!\n');
  });

  // Teste de FIND ONE
  it('deve buscar uma empresa por ID com sucesso', async () => {
    console.log('\n🔍 [TESTE FIND ONE] Iniciando teste de busca de empresa');

    const empresaId = 'empresa1';
    const empresaData = {
      nome: 'Empresa Teste',
      cnpj: '12345678901234',
      email: 'empresa@teste.com',
    };

    console.log('🆔 Buscando empresa:', empresaId);

    const mockDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: empresaId,
        data: () => empresaData,
      }),
    };

    mockEmpresaCollection.doc.mockReturnValue(mockDocRef);

    console.log('🔄 Chamando service.findOne()...');
    const result = await service.findOne(empresaId);

    console.log('✅ Empresa encontrada!');
    console.log('📊 Dados:', {
      id: result.id,
      nome: (result as any).nome,
      cnpj: (result as any).cnpj,
    });

    expect(mockEmpresaCollection.doc).toHaveBeenCalledWith(empresaId);
    expect(result).toEqual({
      id: empresaId,
      ...empresaData,
    });

    console.log('✓ Verificações concluídas');
    console.log('✅ [FIND ONE] Teste concluído com sucesso!\n');
  });

  it('deve lançar NotFoundException ao buscar empresa inexistente', async () => {
    console.log(
      '\n❌ [TESTE FIND ONE ERROR] Testando busca de empresa inexistente',
    );

    const mockDocRef = {
      get: jest.fn().mockResolvedValue({
        exists: false,
      }),
    };

    mockEmpresaCollection.doc.mockReturnValue(mockDocRef);

    console.log('🔍 Tentando buscar empresa "naoexiste"...');
    console.log('⚠️ Esperando NotFoundException...');

    await expect(service.findOne('naoexiste')).rejects.toThrow(
      NotFoundException,
    );

    console.log('✓ NotFoundException lançada corretamente');
    console.log('✅ [FIND ONE ERROR] Teste concluído com sucesso!\n');
  });

  // Teste de FIND ALL
  it('deve buscar todas as empresas', async () => {
    console.log(
      '\n📋 [TESTE FIND ALL] Iniciando teste de busca de todas as empresas',
    );

    const empresas = [
      { id: 'empresa1', nome: 'Empresa 1' },
      { id: 'empresa2', nome: 'Empresa 2' },
    ];

    console.log('📊 Empresas no banco:', empresas.length);

    mockEmpresaCollection.get.mockResolvedValue({
      docs: empresas.map((emp) => ({
        id: emp.id,
        data: () => ({ nome: emp.nome }),
      })),
    });

    console.log('🔄 Chamando service.findAll()...');
    const result = await service.findAll();

    console.log('✅ Empresas encontradas:', result.length);
    result.forEach((emp: any, index: number) => {
      console.log(`  ${index + 1}. ${emp.nome} (ID: ${emp.id})`);
    });

    expect(mockEmpresaCollection.get).toHaveBeenCalled();
    expect(result).toEqual(empresas);

    console.log('✓ Verificações concluídas');
    console.log('✅ [FIND ALL] Teste concluído com sucesso!\n');
  });
});
