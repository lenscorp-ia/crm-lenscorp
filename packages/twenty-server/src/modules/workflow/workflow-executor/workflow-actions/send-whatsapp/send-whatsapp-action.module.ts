import { Module } from '@nestjs/common';

import { SecureHttpClientModule } from 'src/engine/core-modules/secure-http-client/secure-http-client.module';
import { SendWhatsappWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp/send-whatsapp.workflow-action';

@Module({
  imports: [SecureHttpClientModule],
  providers: [SendWhatsappWorkflowAction],
  exports: [SendWhatsappWorkflowAction],
})
export class SendWhatsappActionModule {}
