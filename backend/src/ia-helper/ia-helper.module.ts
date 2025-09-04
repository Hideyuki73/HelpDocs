import { Module } from '@nestjs/common';
import { IaHelperService } from './ia-helper.service';
import { IaHelperController } from './ia-helper.controller';
import { IaHelperChatService } from './ia-helper-chat.service';
import { IaHelperChatController } from './ia-helper-chat.controller';

@Module({
  controllers: [IaHelperController, IaHelperChatController],
  providers: [IaHelperService, IaHelperChatService],
  exports: [IaHelperService, IaHelperChatService],
})
export class IaHelperModule {}