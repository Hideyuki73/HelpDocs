// empresa.controller.ts
import {
  Controller,
  Post,
  Body,
  Headers,
  UnauthorizedException,
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
}
