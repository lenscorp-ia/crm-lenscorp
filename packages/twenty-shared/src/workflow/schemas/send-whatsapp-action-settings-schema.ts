import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowSendWhatsappActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      phone: z.string(),
      templateName: z.string(),
      language: z.string(),
      variables: z.array(z.string()),
    }),
  });
