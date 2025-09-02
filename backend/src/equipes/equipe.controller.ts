import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Request,
} from '@nestjs/common';
import { EquipeService } from './equipe.service';
import { CreateEquipeDto } from './dto/create-equipe.dto';
import { UpdateEquipeDto } from './dto/update-equipe.dto';

@Controller('equipes')
export class EquipeController {
  constructor(private readonly equipeService: EquipeService) {}

  @Post()
  create(@Body() createEquipeDto: CreateEquipeDto, @Request() req: any) {
    const usuarioId = req.user.uid;
    return this.equipeService.create(createEquipeDto, usuarioId);
  }

  @Get()
  findAll(@Request() req: any) {
    const usuarioId = req.user.uid;
    return this.equipeService.findAll(usuarioId);
  }

  @Get('stats')
  getStats(@Request() req: any) {
    const usuarioId = req.user.uid;
    return this.equipeService.getEquipeStats(usuarioId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    const usuarioId = req.user.uid;
    return this.equipeService.findOne(id, usuarioId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEquipeDto: UpdateEquipeDto,
    @Request() req: any,
  ) {
    const usuarioId = req.user.uid;
    return this.equipeService.update(id, updateEquipeDto, usuarioId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    const usuarioId = req.user.uid;
    return this.equipeService.remove(id, usuarioId);
  }

  @Post(':id/adicionar-membros')
  addMembros(
    @Param('id') equipeId: string,
    @Body('membros') membros: string[],
    @Request() req: any,
  ) {
    const usuarioId = req.user.uid;
    return this.equipeService.addMembros(equipeId, membros, usuarioId);
  }

  @Delete(':id/remover-membro/:membroId')
  removeMembro(
    @Param('id') equipeId: string,
    @Param('membroId') membroId: string,
    @Request() req: any,
  ) {
    const usuarioId = req.user.uid;
    return this.equipeService.removeMembro(equipeId, membroId, usuarioId);
  }
}
