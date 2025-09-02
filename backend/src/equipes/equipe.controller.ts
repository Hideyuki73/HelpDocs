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
import { EquipeService } from './equipe.service';
import { CreateEquipeDto } from './dto/create-equipe.dto';
import { UpdateEquipeDto } from './dto/update-equipe.dto';
import * as admin from 'firebase-admin';

@Controller('equipes')
export class EquipeController {
  constructor(private readonly equipeService: EquipeService) {}

  private async getUidFromAuthHeader(authorization: string): Promise<string> {
    if (!authorization) throw new UnauthorizedException('Token não fornecido');
    const token = authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token mal formatado');

    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
  }

  @Post()
  async create(
    @Body() createEquipeDto: CreateEquipeDto,
    @Headers('authorization') authorization: string,
  ) {
    const usuarioId = await this.getUidFromAuthHeader(authorization);
    return this.equipeService.create(createEquipeDto, usuarioId);
  }

  @Get()
  async findAll(@Headers('authorization') authorization: string) {
    const usuarioId = await this.getUidFromAuthHeader(authorization);
    return this.equipeService.findAll(usuarioId);
  }

  @Get('stats')
  async getStats(@Headers('authorization') authorization: string) {
    const usuarioId = await this.getUidFromAuthHeader(authorization);
    return this.equipeService.getEquipeStats(usuarioId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const usuarioId = await this.getUidFromAuthHeader(authorization);
    return this.equipeService.findOne(id, usuarioId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEquipeDto: UpdateEquipeDto,
    @Headers('authorization') authorization: string,
  ) {
    const usuarioId = await this.getUidFromAuthHeader(authorization);
    return this.equipeService.update(id, updateEquipeDto, usuarioId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('authorization') authorization: string,
  ) {
    const usuarioId = await this.getUidFromAuthHeader(authorization);
    return this.equipeService.remove(id, usuarioId);
  }

  @Post(':id/adicionar-membros')
  async addMembros(
    @Param('id') equipeId: string,
    @Body('membros') membros: string[],
    @Headers('authorization') authorization: string,
  ) {
    const usuarioId = await this.getUidFromAuthHeader(authorization);
    return this.equipeService.addMembros(equipeId, membros, usuarioId);
  }

  @Delete(':id/remover-membro/:membroId')
  async removeMembro(
    @Param('id') equipeId: string,
    @Param('membroId') membroId: string,
    @Headers('authorization') authorization: string,
  ) {
    const usuarioId = await this.getUidFromAuthHeader(authorization);
    return this.equipeService.removeMembro(equipeId, membroId, usuarioId);
  }
}
