import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const SEND_WHATSAPP_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'SEND_WHATSAPP'>;
  icon: string;
} = {
  defaultLabel: 'Send WhatsApp',
  type: 'SEND_WHATSAPP',
  icon: 'IconBrandWhatsapp',
};
