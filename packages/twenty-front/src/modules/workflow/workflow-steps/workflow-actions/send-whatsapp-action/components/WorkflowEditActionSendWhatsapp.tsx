import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type WorkflowSendWhatsappAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import { t } from '@lingui/core/macro';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

type SendWhatsappFormData = WorkflowSendWhatsappAction['settings']['input'];

type WorkflowEditActionSendWhatsappProps = {
  action: WorkflowSendWhatsappAction;
  actionOptions:
    | {
        readonly: true;
      }
    | {
        readonly?: false;
        onActionUpdate: (action: WorkflowSendWhatsappAction) => void;
      };
};

export const WorkflowEditActionSendWhatsapp = ({
  action,
  actionOptions,
}: WorkflowEditActionSendWhatsappProps) => {
  const [formData, setFormData] = useState<SendWhatsappFormData>(
    action.settings.input,
  );

  const saveAction = useDebouncedCallback(
    (nextFormData: SendWhatsappFormData) => {
      if (actionOptions.readonly === true) {
        return;
      }

      actionOptions.onActionUpdate({
        ...action,
        settings: {
          ...action.settings,
          input: nextFormData,
        },
      });
    },
    1_000,
  );

  useEffect(() => {
    return () => {
      saveAction.flush();
    };
  }, [saveAction]);

  const handleTextFieldChange = (
    fieldName: 'phone' | 'templateName' | 'language',
    value: string,
  ) => {
    const nextFormData = { ...formData, [fieldName]: value };

    setFormData(nextFormData);
    saveAction(nextFormData);
  };

  // WhatsApp template variables cannot contain line breaks, so one line is one variable.
  const handleVariablesChange = (value: string) => {
    const nextFormData = { ...formData, variables: value.split('\n') };

    setFormData(nextFormData);
    saveAction(nextFormData);
  };

  return (
    <>
      <WorkflowStepBody>
        <FormTextFieldInput
          label={t`Phone`}
          placeholder={t`Phone number of the recipient`}
          readonly={actionOptions.readonly}
          defaultValue={formData.phone}
          onChange={(value) => handleTextFieldChange('phone', value)}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormTextFieldInput
          label={t`Template name`}
          placeholder={t`Name of the approved WhatsApp template`}
          readonly={actionOptions.readonly}
          defaultValue={formData.templateName}
          onChange={(value) => handleTextFieldChange('templateName', value)}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormTextFieldInput
          label={t`Language`}
          placeholder={t`pt_BR`}
          readonly={actionOptions.readonly}
          defaultValue={formData.language}
          onChange={(value) => handleTextFieldChange('language', value)}
          VariablePicker={WorkflowVariablePicker}
        />
        <FormTextFieldInput
          label={t`Template variables`}
          placeholder={t`One per line: line 1 is variable 1, line 2 is variable 2`}
          multiline
          readonly={actionOptions.readonly}
          defaultValue={formData.variables.join('\n')}
          onChange={handleVariablesChange}
          VariablePicker={WorkflowVariablePicker}
        />
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
