import { Injectable } from '@nestjs/common';

@Injectable()
export class IaHelperChatService {
  private readonly systemPrompt = `
Você é um assistente especializado em desenvolvimento de software e criação de documentação técnica. 
Seu objetivo é ajudar desenvolvedores a criar documentos de alta qualidade para projetos de software.

Você pode ajudar com:
- Documentação de APIs e endpoints
- Guias de instalação e configuração
- Documentação de arquitetura de software
- Manuais de usuário
- Documentação de código e funções
- Especificações técnicas
- Diagramas e fluxos de trabalho
- Boas práticas de desenvolvimento
- Padrões de código e convenções
- Documentação de testes
- Guias de deploy e CI/CD

Sempre forneça respostas claras, estruturadas e práticas. Use exemplos quando apropriado e 
mantenha um tom profissional mas acessível.
`;

  async gerarResposta(pergunta: string, contexto?: string): Promise<string> {
    try {
      // Aqui você integraria com a API da OpenAI ou outro serviço de IA
      // Por enquanto, vamos simular uma resposta baseada no contexto
      
      const prompt = `
${this.systemPrompt}

${contexto ? `Contexto do documento: ${contexto}` : ''}

Pergunta do usuário: ${pergunta}

Resposta:`;

      // Simulação de resposta - substitua pela integração real com IA
      return this.gerarRespostaSimulada(pergunta, contexto);
      
    } catch (error) {
      console.error('Erro ao gerar resposta da IA:', error);
      return 'Desculpe, ocorreu um erro ao processar sua pergunta. Tente novamente.';
    }
  }

  private gerarRespostaSimulada(pergunta: string, contexto?: string): string {
    const perguntaLower = pergunta.toLowerCase();
    
    if (perguntaLower.includes('api') || perguntaLower.includes('endpoint')) {
      return `Para documentar APIs, recomendo incluir:

1. **Descrição do endpoint**: Explique o propósito da API
2. **Método HTTP**: GET, POST, PUT, DELETE, etc.
3. **URL e parâmetros**: Estrutura da URL e parâmetros necessários
4. **Headers**: Cabeçalhos obrigatórios (autenticação, content-type)
5. **Body da requisição**: Estrutura dos dados enviados
6. **Respostas**: Códigos de status e estrutura das respostas
7. **Exemplos**: Requisições e respostas de exemplo

Exemplo:
\`\`\`
POST /api/usuarios
Content-Type: application/json
Authorization: Bearer {token}

{
  "nome": "João Silva",
  "email": "joao@email.com"
}
\`\`\``;
    }
    
    if (perguntaLower.includes('instalação') || perguntaLower.includes('setup')) {
      return `Para criar um guia de instalação eficaz:

1. **Pré-requisitos**: Liste todas as dependências necessárias
2. **Passos numerados**: Instruções claras e sequenciais
3. **Comandos**: Forneça comandos exatos para copiar/colar
4. **Verificação**: Como confirmar que a instalação foi bem-sucedida
5. **Troubleshooting**: Problemas comuns e soluções

Exemplo:
\`\`\`bash
# 1. Clone o repositório
git clone https://github.com/projeto/repo.git

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env

# 4. Execute o projeto
npm start
\`\`\``;
    }
    
    if (perguntaLower.includes('arquitetura') || perguntaLower.includes('estrutura')) {
      return `Para documentar arquitetura de software:

1. **Visão geral**: Descrição high-level do sistema
2. **Componentes**: Principais módulos e suas responsabilidades
3. **Fluxo de dados**: Como as informações transitam
4. **Tecnologias**: Stack tecnológico utilizado
5. **Padrões**: Padrões arquiteturais aplicados
6. **Diagramas**: Representações visuais da arquitetura

Considere incluir:
- Diagrama de componentes
- Fluxo de dados
- Estrutura de pastas
- Relacionamentos entre módulos`;
    }
    
    if (perguntaLower.includes('teste') || perguntaLower.includes('test')) {
      return `Para documentar testes:

1. **Estratégia de testes**: Tipos de teste implementados
2. **Estrutura**: Organização dos arquivos de teste
3. **Comandos**: Como executar os testes
4. **Cobertura**: Métricas de cobertura de código
5. **Casos de teste**: Cenários principais testados

Exemplo:
\`\`\`bash
# Executar todos os testes
npm test

# Executar testes com cobertura
npm run test:coverage

# Executar testes específicos
npm test -- --grep "nome-do-teste"
\`\`\``;
    }
    
    // Resposta genérica
    return `Baseado na sua pergunta sobre "${pergunta}", aqui estão algumas sugestões:

1. **Seja específico**: Detalhe claramente o que você quer documentar
2. **Use exemplos**: Inclua código e exemplos práticos
3. **Estruture bem**: Use títulos, listas e formatação adequada
4. **Mantenha atualizado**: Revise regularmente a documentação
5. **Pense no usuário**: Escreva pensando em quem vai ler

${contexto ? `Considerando o contexto "${contexto}", ` : ''}recomendo focar nos aspectos mais importantes para o entendimento do leitor.

Precisa de ajuda mais específica? Me conte mais detalhes sobre o que você quer documentar!`;
  }

  async gerarSugestaoTitulo(conteudo: string): Promise<string> {
    // Análise simples do conteúdo para sugerir título
    const palavrasChave = this.extrairPalavrasChave(conteudo);
    
    if (palavrasChave.includes('api') || palavrasChave.includes('endpoint')) {
      return 'Documentação da API';
    }
    
    if (palavrasChave.includes('instalação') || palavrasChave.includes('setup')) {
      return 'Guia de Instalação';
    }
    
    if (palavrasChave.includes('arquitetura')) {
      return 'Arquitetura do Sistema';
    }
    
    if (palavrasChave.includes('teste')) {
      return 'Documentação de Testes';
    }
    
    return 'Documento Técnico';
  }

  private extrairPalavrasChave(texto: string): string[] {
    return texto.toLowerCase()
      .split(/\s+/)
      .filter(palavra => palavra.length > 3)
      .slice(0, 10);
  }
}
