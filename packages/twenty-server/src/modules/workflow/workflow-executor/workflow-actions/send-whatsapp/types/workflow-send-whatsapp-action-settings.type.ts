import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import { type WorkflowSendWhatsappActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp/types/workflow-send-whatsapp-action-input.type';

export type WorkflowSendWhatsappActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowSendWhatsappActionInput;
};
