import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { CreateIaHelperDto } from './dto/create-ia-helper.dto';
import { OpenAI } from 'openai';

@Injectable()
export class IaHelperService {
  private readonly collection;
  private openai: OpenAI;

  constructor(@Inject('FIRESTORE') private readonly firestore: Firestore) {
    this.collection = this.firestore.collection('ia-helper');
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

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

  async findAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getIaResponse(message: string, contextoDocumento: string, usuarioId: string): Promise<string> {
    const prompt = `Você é um assistente de IA para documentação de software. Analise o seguinte documento e responda à pergunta do usuário.\n\nContexto do Documento:\n${contextoDocumento}\n\nPergunta do Usuário: ${message}\n\nResposta:`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      });
      return completion.choices[0].message.content ?? "Desculpe, não consegui processar sua solicitação no momento.";
    } catch (error) {
      console.error("Erro ao comunicar com a OpenAI API:", error);
      return "Desculpe, não consegui processar sua solicitação no momento.";
    }
  }
}
