import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowSendWhatsappActionSettingsSchema } from './send-whatsapp-action-settings-schema';

export const workflowSendWhatsappActionSchema = baseWorkflowActionSchema.extend(
  {
    type: z.literal('SEND_WHATSAPP'),
    settings: workflowSendWhatsappActionSettingsSchema,
  },
);
