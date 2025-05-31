import { Empresa } from '../empresa/empresa.entity';

export class Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  senha: string;
  empresaId: string; // Referência à Empresa
  dataCadastro: Date;
}
