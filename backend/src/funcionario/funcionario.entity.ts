import { Empresa } from '../empresa/empresa.entity';

export class Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  empresaId: string;
  dataCadastro: Date;
}
