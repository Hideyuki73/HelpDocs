import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import { FuncionarioService } from './funcionario.service';
import * as admin from 'firebase-admin';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';

@Controller('funcionarios')
export class FuncionarioController {
  constructor(private readonly funcionarioService: FuncionarioService) {}

  @Post()
  async create(
    @Body() createFuncionarioDto: CreateFuncionarioDto,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) throw new UnauthorizedException('Token não fornecido');
    const token = authorization.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // chama o serviço com o uid verificado
    return this.funcionarioService.createWithUid(uid, createFuncionarioDto);
  }

  @Post(':id/associar')
  async associateWithEmpresa(
    @Param('id') funcionarioId: string,
    @Body('empresaId') empresaId: string,
  ) {
    return this.funcionarioService.associateWithEmpresa(
      funcionarioId,
      empresaId,
    );
  }

  @Post(':id/criar-empresa')
  createEmpresa(@Param('id') funcionarioId: string, @Body() empresaData: any) {
    return this.funcionarioService.createEmpresa(funcionarioId, empresaData);
  }

  @Patch(':id/cargo') // NOVO ENDPOINT
  async updateCargo(
    @Param('id') funcionarioId: string,
    @Body('cargo') cargo: string,
    @Headers('authorization') authorization: string,
  ) {
    if (!authorization) throw new UnauthorizedException('Token não fornecido');
    const token = authorization.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(token);
    
    return this.funcionarioService.updateCargo(funcionarioId, cargo, decoded.uid);
  }

  @Get()
  findAll() {
    return this.funcionarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.funcionarioService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFuncionarioDto: UpdateFuncionarioDto,
  ) {
    return this.funcionarioService.update(id, updateFuncionarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.funcionarioService.remove(id);
  }
}
