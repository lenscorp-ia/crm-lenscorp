import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isAxiosError } from 'axios';
import { isDefined, resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input.type';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { findStepOrThrow } from 'src/modules/workflow/workflow-executor/utils/find-step-or-throw.util';
import { isWorkflowSendWhatsappAction } from 'src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp/guards/is-workflow-send-whatsapp-action.guard';
import { type WorkflowSendWhatsappActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/send-whatsapp/types/workflow-send-whatsapp-action-input.type';

const SEND_TEMPLATE_PATH = '/whatsapp/api/send-template';

@Injectable()
export class SendWhatsappWorkflowAction implements WorkflowAction {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context,
    runInfo,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = findStepOrThrow({ stepId: currentStepId, steps });

    if (!isWorkflowSendWhatsappAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not a send WhatsApp action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const { phone, templateName, language, variables } = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowSendWhatsappActionInput;

    if (!isNonEmptyString(phone)) {
      throw new WorkflowStepExecutorException(
        'Phone is required',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    if (!isNonEmptyString(templateName) || !isNonEmptyString(language)) {
      throw new WorkflowStepExecutorException(
        'Template name and language are required',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
      );
    }

    const serviceUrl = this.twentyConfigService.get('WHATSAPP_SERVICE_URL');
    const serviceKey = this.twentyConfigService.get('WHATSAPP_SERVICE_KEY');

    if (!isNonEmptyString(serviceUrl) || !isNonEmptyString(serviceKey)) {
      throw new WorkflowStepExecutorException(
        'WhatsApp service is not configured',
        WorkflowStepExecutorExceptionCode.INTERNAL_ERROR,
      );
    }

    try {
      const response = await this.secureHttpClientService
        .getHttpClient(undefined, {
          workspaceId: runInfo.workspaceId,
          source: 'workflow-http',
        })
        .post(
          `${serviceUrl.replace(/\/+$/, '')}${SEND_TEMPLATE_PATH}`,
          {
            phone,
            name: templateName,
            language,
            variables: (variables ?? []).map(String),
          },
          { headers: { 'x-inbox-key': serviceKey } },
        );

      const message = response.data?.message;

      return {
        result: {
          messageId: message?.id ?? '',
          text: message?.text ?? '',
        },
      };
    } catch (error) {
      if (!isAxiosError(error)) {
        throw error;
      }

      // The service answers 4xx with a readable reason (template not approved,
      // invalid phone, missing variable) — that is a problem with the step's
      // input, not an outage, so it is flagged as a user error.
      const status = error.response?.status;
      const reason = error.response?.data?.error;

      return {
        error: isNonEmptyString(reason) ? reason : error.message,
        isUserError: isDefined(status) && status >= 400 && status < 500,
      };
    }
  }
}
