import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
  Patch,
  Param,
  Delete,
  Get,
} from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import * as admin from 'firebase-admin';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';

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

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmpresaDto: UpdateEmpresaDto,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Token não fornecido');
    }
    const token = authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token mal formatado');

    const decoded = await admin.auth().verifyIdToken(token); // verifica token
    const adminUid = decoded.uid;

    // Verifica se o adminUid é admin da empresa
    const userRole = await this.empresaService.getRole(id, adminUid);
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Apenas administradores podem atualizar empresas.');
    }

    return this.empresaService.update(id, updateEmpresaDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Token não fornecido');
    }
    const token = authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token mal formatado');

    const decoded = await admin.auth().verifyIdToken(token); // verifica token
    const adminUid = decoded.uid;

    // Verifica se o adminUid é admin da empresa
    const userRole = await this.empresaService.getRole(id, adminUid);
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Apenas administradores podem remover empresas.');
    }

    return this.empresaService.remove(id);
  }

  @Post(':id/convites/gerar')
  async gerarConvite(
    @Param('id') empresaId: string,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Token não fornecido');
    }
    const token = authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token mal formatado');

    const decoded = await admin.auth().verifyIdToken(token); // verifica token
    const criadorUid = decoded.uid;

    // Verifica se o criadorUid é admin da empresa
    const userRole = await this.empresaService.getRole(empresaId, criadorUid);
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Apenas administradores podem gerar convites.');
    }

    return this.empresaService.generateInviteCode(empresaId, criadorUid);
  }

  @Post('convites/usar')
  async usarConvite(
    @Body('code') code: string,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Token não fornecido');
    }
    const token = authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token mal formatado');

    const decoded = await admin.auth().verifyIdToken(token); // verifica token
    const usuarioId = decoded.uid;

    const { empresaId } = await this.empresaService.useInviteCode(code, usuarioId);

    return { message: 'Convite utilizado com sucesso!', empresaId };
  }

  @Get(':id/convites')
  async getConvitesByEmpresa(
    @Param('id') empresaId: string,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Token não fornecido');
    }
    const token = authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token mal formatado');

    const decoded = await admin.auth().verifyIdToken(token); // verifica token
    const criadorUid = decoded.uid;

    // Verifica se o criadorUid é admin da empresa
    const userRole = await this.empresaService.getRole(empresaId, criadorUid);
    if (userRole !== 'admin') {
      throw new UnauthorizedException('Apenas administradores podem visualizar convites.');
    }

    return this.empresaService.getInviteCodesByEmpresa(empresaId);
  }

  @Patch(':id/roles/:userId')
  async assignUserRole(
    @Param('id') empresaId: string,
    @Param('userId') userId: string,
    @Body('role') role: string,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) {
      throw new UnauthorizedException('Token não fornecido');
    }
    const token = authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token mal formatado');

    const decoded = await admin.auth().verifyIdToken(token); // verifica token
    const adminUid = decoded.uid;

    // Verifica se o adminUid é admin da empresa
    const adminRole = await this.empresaService.getRole(empresaId, adminUid);
    if (adminRole !== 'admin') {
      throw new UnauthorizedException('Apenas administradores podem atribuir cargos.');
    }

    await this.empresaService.assignRole(empresaId, userId, role);
    return { message: 'Cargo atribuído com sucesso!' };
  }

  @Get("me")
  async getMyCompanies(@Headers("authorization") authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException("Token não fornecido");
    }
    const token = authorization.split(" ")[1];
    if (!token) throw new UnauthorizedException("Token mal formatado");

    const decoded = await admin.auth().verifyIdToken(token); // verifica token
    const uid = decoded.uid;

    return this.empresaService.findByUserId(uid);
  }
}