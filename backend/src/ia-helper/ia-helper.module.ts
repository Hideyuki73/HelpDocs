import { Module } from '@nestjs/common';
import { IaHelperService } from './ia-helper.service';
import { IaHelperController } from './ia-helper.controller';

@Module({
  controllers: [IaHelperController],
  providers: [IaHelperService],
  exports: [IaHelperService],
})
export class IaHelperModule {}
