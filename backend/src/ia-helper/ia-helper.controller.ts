import { Controller, Get, Post, Body } from '@nestjs/common';
import { IaHelperService } from './ia-helper.service';
import { CreateIaHelperDto } from './dto/create-ia-helper.dto';

@Controller('ia-helper')
export class IaHelperController {
  constructor(private readonly iaHelperService: IaHelperService) {}

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
  ) {
    console.log('Requisição recebida para /ia-helper/message');
    return this.iaHelperService.getIaResponse(message, contextoDocumento);
  }
}
