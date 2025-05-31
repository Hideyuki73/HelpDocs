import { Module } from '@nestjs/common';
import { EquipeService } from './equipe.service';
import { EquipeController } from './equipe.controller';

@Module({
  controllers: [EquipeController],
  providers: [EquipeService],
  exports: [EquipeService],
})
export class EquipeModule {}
