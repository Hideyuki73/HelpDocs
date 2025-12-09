# 📄 HelpDocs

Uma plataforma inteligente para documentação de software, auxiliando desenvolvedores e gerentes de projeto a criarem documentações mais completas, precisas e organizadas, utilizando Inteligência Artificial.

---

## 🏢 **Informações Gerais**

- **Nome do Software:** HelpDocs
- **Patrocinadores:** Valdson Martins Tenorio e Rodrigo Hideyuki Kawakami
- **Público-Alvo:** Desenvolvedores de software e gerentes de projeto
- **Stakeholders:** Clientes e desenvolvedores

---

## 👥 **Equipe**

- **Analistas/Desenvolvedores:**
  - Valdson Martins Tenório
  - Rodrigo Hideyuki Kawakami
- **Orientador:** Antonio Pires
- **Consultor:** Breno de Barros Mongelo

---

## 🎯 **Motivação e Problemática**

A documentação de software é um dos pilares fundamentais para garantir a qualidade do desenvolvimento. Contudo, muitos projetos enfrentam problemas com documentação incompleta, desatualizada ou de difícil entendimento, impactando diretamente a entrega de um produto de qualidade.

O **HelpDocs** surge como uma solução inteligente, utilizando IA para:

- Auxiliar na criação de documentações.
- Apontar erros e partes faltantes.
- Sugerir melhorias.
- Tornar o processo de documentação mais ágil e eficaz.

---

## ✅ **Justificativa**

- A maioria dos softwares tem sua qualidade comprometida por conta de uma documentação deficiente.
- O HelpDocs visa reduzir esse problema, oferecendo uma plataforma que orienta, sugere e corrige documentações utilizando inteligência artificial, garantindo mais qualidade no desenvolvimento de software.

---

## 📦 **Entregas do Projeto**

- Documento de Requisitos
- Sistema codificado com os requisitos implementados

---

## 🚀 **Objetivos do Sistema**

- Facilitar a documentação de software.
- Reduzir as dificuldades durante o desenvolvimento.
- Facilitar assinaturas dos documentos.
- Impedir que etapas críticas sejam ignoradas.
- Usar IA para validação e correção de documentos.

---

## 🎯 **Critérios de Aceitação**

- Testes de Usabilidade.
- Testes Funcionais e de Software.
- Compatibilidade entre os principais navegadores.

---

## 🧠 **Consultor do Sistema**

- **Nome:** Breno de Barros Montebelo
- **CPF:** 025.944.651-35
- **Telefone:** (67) 98156-7714
- **Experiência:**
  - Desenvolvedor Python na Alfaneo Legal IA
  - Criação e implementação de API REST
  - Desenvolvimento de aplicações de Machine Learning
  - Gerenciamento de serviços em nuvem (AWS)
  - Implantação de dashboards e reuniões de alinhamento com clientes

---

## 🗣️ **Entrevista com o Consultor — Pontos-Chave**

- O sistema deve atender não só desenvolvedores, mas também POs, analistas e profissionais de UX.
- A IA é peça central — recomenda-se aprofundar no uso de LLMs, fine-tuning e engenharia de prompt.
- Sugere-se geração de recomendações em tempo real na documentação.
- Funcionalidade sugerida: compartilhamento de documentos com clientes e stakeholders.
- Integrações recomendadas: Jira, Slack, ClickUp e outras ferramentas de gestão.

---

## 🔍 **Requisitos do Sistema**

### 🔗 **Funcionais**

- Cadastro de empresas.
- Cadastro de funcionários.
- Upload e gestão de documentos.
- Leitura e edição assistida de documentos por IA.
- Criptografia dos documentos.
- Sistema de chat entre usuários.
- Possibilidade de download dos documentos a qualquer momento.

### 🔐 **Não Funcionais**

- **Segurança:** Proteção contra acesso não autorizado.
- **Disponibilidade:** Alta disponibilidade do sistema.
- **Manutenção:** Código limpo e de fácil manutenção.
- **Confiabilidade:** Sistema robusto e confiável.
- **Portabilidade:** Compatível com diversos navegadores.

---

## 🔨 **Metodologia de Desenvolvimento**

- **Abordagem:** Incremental com Kanban.
- **Controle de Versão:** Git e GitHub.
- **Deploy:** Automatizado via Firebase CLI.

### 🗺️ **Fases do Desenvolvimento**

1. **Cadastro e Autenticação:** Login, cadastro e exclusão de conta.
2. **Gestão Corporativa:** Gerenciamento de empresas e funcionários.
3. **Gestão de Documentos:** Upload, organização e histórico de documentos.
4. **Edição e Avaliação:** IA auxiliando na correção e melhoria dos documentos.
5. **Comunicação:** Sistema de chat e acompanhamento dos processos.

---

## 🏗️ **Tecnologias Utilizadas**

### 🌐 **Frontend**

- **Framework:** React.js + Next.js
- **Estilo:** Chakra UI
- **Formulários:** Formik + Yup
- **Requisições:** Axios

### 🔗 **Backend**

- **Framework:** Node.js + NestJS
- **Autenticação:** JSON Web Tokens (JWT)
- **Gerenciamento:** Firebase Authentication

### ☁️ **Banco de Dados e Deploy**

- **Banco:** Firebase Realtime Database / Firestore
- **Deploy:** Firebase Hosting (frontend) + Firebase Functions ou API hospedada

### 🛠️ **Ferramentas Auxiliares**

- **Testes:** Postman
- **Versionamento:** Git + GitHub
- **Deploy:** Firebase CLI

---

## 🖥️ **Ambientes**

- **Desenvolvimento:**

  - VSCode
  - Node.js 22.x
  - Sistema Operacional: Windows 11

- **Produção:**
  - Frontend no Firebase Hosting
  - Backend via Firebase Functions ou Node.js hospedado
  - Banco no Firestore ou Realtime Database

---

## 🤝 **Licença**

Este projeto é de caráter acadêmico e não possui uma licença definida para distribuição comercial no momento.

---

## 🚀 **Instalação e Execução**

### 🔧 **Pré-requisitos**

- Node.js (versão 22.x ou superior)
- Git
- Firebase CLI

### 📥 **Passos de Instalação**

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/seu-usuario/helpdocs.git
   cd helpdocs
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configuração do Firebase:**
   - Adicione seu arquivo de credenciais (ex.: `firebase-service-account.json`) na raiz do projeto.
   - Configure as variáveis de ambiente necessárias em um arquivo `.env` com informações como:
     ```env
     FIREBASE_API_KEY=your_api_key
     FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
     FIREBASE_PROJECT_ID=your_project_id
     FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
     FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     FIREBASE_APP_ID=your_app_id
     JWT_SECRET=your_jwt_secret
     ```

### ▶️ **Execução**

- **Backend:**  
  Execute o servidor backend com o comando:

```bash
npm run start:dev
```

- **Frontend:**  
  Inicie a aplicação React com:

```bash
npm start
```

### 🧪 **Testes**

- Utilize o **Postman** para testar os endpoints da API.  
  Exemplo de requisição para criação de um funcionário:

```json
{
  "nome": "João Silva",
  "email": "joao.silva@example.com",
  "cargo": "Desenvolvedor",
  "senha": "senhaSuperSecreta",
  "empresaId": "123456"
}
```

- Realize testes de usabilidade e compatibilidade nos principais navegadores.

