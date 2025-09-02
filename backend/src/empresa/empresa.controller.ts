// empresa.controller.ts
import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Get,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import * as admin from 'firebase-admin';
import { CreateEmpresaDto } from './dto/create-empresa.dto';

@Controller('empresas')
export class EmpresaController {
  constructor(private readonly empresaService: EmpresaService) {}

  @Post()
  async create(
    @Body() createEmpresaDto: CreateEmpresaDto,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Token não fornecido');
    }
    const token = authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token mal formatado');

    const decoded = await admin.auth().verifyIdToken(token); // verifica token
    const uid = decoded.uid;

    // agora chama o serviço passando o UID verificado
    return this.empresaService.create(createEmpresaDto, uid);
  }

  @Get('findByIdFuncionario/:id')
  findByFuncionario(@Param('id') funcionarioId: string) {
    return this.empresaService.findByFuncionarioId(funcionarioId);
  }

  @Post(':id/gerar-convite')
  gerarConvite(@Param('id') empresaId: string) {
    return this.empresaService.gerarConvite(empresaId);
  }

  @Post('entrar-empresa')
  entrarEmpresa(
    @Body('funcionarioId') funcionarioId: string,
    @Body('codigo') codigo: string,
  ) {
    return this.empresaService.entrarPorConvite(funcionarioId, codigo);
  }

  @Delete(':id')
  async deleteEmpresa(
    @Param('id') empresaId: string,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Token não fornecido');
    }
    const token = authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token mal formatado');

    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    return this.empresaService.deleteEmpresa(empresaId, uid);
  }

  @Patch(':id/remover-funcionario')
  async removerFuncionario(
    @Param('id') empresaId: string,
    @Body('funcionarioId') funcionarioId: string,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Token não fornecido');
    }
    const token = authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token mal formatado');

    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    return this.empresaService.removerFuncionario(
      empresaId,
      funcionarioId,
      uid,
    );
  }

  @Patch(':id/sair')
  async sairDaEmpresa(
    @Param('id') empresaId: string,
    @Body('funcionarioId') funcionarioId: string,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Token não fornecido');
    }
    const token = authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token mal formatado');

    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // funcionário só pode sair da própria empresa
    if (uid !== funcionarioId) {
      throw new UnauthorizedException(
        'Você só pode sair da sua própria conta de empresa',
      );
    }

    return this.empresaService.sairDaEmpresa(empresaId, funcionarioId);
  }
}
