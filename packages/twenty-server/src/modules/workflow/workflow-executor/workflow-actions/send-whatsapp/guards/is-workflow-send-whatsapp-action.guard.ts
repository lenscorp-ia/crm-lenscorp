import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  type WorkflowAction,
  type WorkflowSendWhatsappAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowSendWhatsappAction = (
  action: WorkflowAction,
): action is WorkflowSendWhatsappAction =>
  action.type === WorkflowActionType.SEND_WHATSAPP;
