import { Controller, Get, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { IaHelperService } from './ia-helper.service';
import { CreateIaHelperDto } from './dto/create-ia-helper.dto';
import * as admin from 'firebase-admin';

@Controller('ia-helper')
export class IaHelperController {
  constructor(private readonly iaHelperService: IaHelperService) {}

  private async getUidFromAuthHeader(authorization: string): Promise<string> {
    if (!authorization) throw new UnauthorizedException('Token não fornecido');
    const token = authorization.split(' ')[1];
    if (!token) throw new UnauthorizedException('Token mal formatado');

    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
  }

  @Post()
  create(@Body() createIaHelperDto: CreateIaHelperDto) {
    return this.iaHelperService.create(createIaHelperDto);
  }

  @Get()
  findAll() {
    return this.iaHelperService.findAll();
  }

  @Post('message')
  async handleMessage(
    @Body('message') message: string,
    @Body('contextoDocumento') contextoDocumento: string,
    @Headers('authorization') authorization: string,
  ) {
    console.log('Requisição recebida para /ia-helper/message');
    const usuarioId = await this.getUidFromAuthHeader(authorization);
    return this.iaHelperService.getIaResponse(message, contextoDocumento, usuarioId);
  }
}