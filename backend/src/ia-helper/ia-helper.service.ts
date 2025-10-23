import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateIaHelperDto } from './dto/create-ia-helper.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class IaHelperService {
  private model;
  private collection;

  constructor(
    // ✅ Use o token correto registrado no FirebaseModule
    @Inject('FIRESTORE') private readonly firestore: Firestore,
  ) {
    // Instancia o modelo Gemini usando a variável de ambiente
    console.log('Key', process.env.GOOGLE_API_KEY);
    this.model = new GoogleGenerativeAI(
      process.env.GOOGLE_API_KEY!,
    ).getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // Coleção principal no Firestore
    this.collection = this.firestore.collection('ia-helpers');
  }

  /**
   * Cria um novo documento na coleção "ia-helpers"
   */
  async create(data: CreateIaHelperDto) {
    const funcionarioDoc = await this.firestore
      .collection('funcionarios')
      .doc(data.criadoPor)
      .get();

    if (!funcionarioDoc.exists) {
      throw new NotFoundException('Funcionário criador não encontrado.');
    }

    const docRef = await this.collection.add({
      ...data,
      criadoPor: this.firestore.collection('funcionarios').doc(data.criadoPor),
      dataCriacao: new Date(),
    });

    const doc = await docRef.get();
    return { id: doc.id, ...doc.data(), criadoPor: data.criadoPor };
  }

  /**
   * Lista todos os documentos da coleção "ia-helpers"
   */
  async findAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Gera uma resposta do modelo Gemini com base no contexto do documento
   */
  async getIaResponse(
    message: string,
    contextoDocumento: string,
  ): Promise<string> {
    const prompt = `
Você é um assistente de IA para documentação de software.
Analise o seguinte documento e responda à pergunta do usuário.

Contexto do Documento:
${contextoDocumento}

Pergunta do Usuário:
${message}

Resposta:
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      return (
        text || 'Desculpe, não consegui processar sua solicitação no momento.'
      );
    } catch (error) {
      console.error('Erro ao comunicar com a Google Gemini API:', error);
      return 'Desculpe, não consegui processar sua solicitação no momento.';
    }
  }
}
