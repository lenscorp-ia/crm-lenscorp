# CRM LensCorp (fork do Twenty)

> Regras do fork. Carregado pelo `CLAUDE.md` do upstream via `@LENSCORP.md`. As regras do upstream no `CLAUDE.md` continuam valendo para o código.

Este repositório é um fork de `twentyhq/twenty`, usado como CRM interno da LensCorp.
Hospedagem: Railway, projeto `CRM-Lenscorp` (serviços `twenty-server`, `twenty-worker`, Postgres, Redis, bucket `twenty-files`).
Versão em produção: `v2.45.8` (imagem oficial `twentycrm/twenty`).
Base do código neste fork: tag `twenty/v2.46.0` (branch `update/v2.46.0`, ainda não publicada).
As tags de release do upstream seguem o padrão `twenty/vX.Y.Z`.
URL: https://twenty-server-production-66417.up.railway.app

## Remotes
- `origin`   → fork da LensCorp (é para cá que fazemos push)
- `upstream` → https://github.com/twentyhq/twenty (só leitura, fonte das atualizações)

## Regra principal: mexer o mínimo possível no core
O Twenty lança versões com frequência. Cada alteração no código deles vira conflito na próxima atualização.

Ordem de preferência para qualquer mudança:
1. **Interface do Twenty** (objetos, campos, views, workflows, permissões): resolver por lá, sem código.
2. **API / webhooks**: integrações (WhatsApp, Meta Ads, formulários de site) ficam em um serviço separado, fora deste repo, consumindo a API REST/GraphQL do Twenty.
3. **Código do core**: só quando não houver alternativa.

Quando precisar alterar o core:
- Commits pequenos e isolados, prefixados com `[lenscorp]` na mensagem.
- Registrar cada alteração na seção "Customizações no core" abaixo (arquivo + motivo).
- Não refatorar nem reformatar código do upstream que não tem relação com a mudança.

## Atualizar a partir do upstream
1. Fazer backup do banco antes (pg_dump do Postgres do Railway).
2. `git fetch upstream --tags`
3. Criar branch: `git checkout -b update/<versao> main`
4. `git merge twenty/<versao>` (ex.: `twenty/v2.46.0`). Preferir tags estáveis, nunca `main` do upstream.
5. Resolver conflitos preservando as customizações listadas abaixo.
6. Rodar build e testes localmente antes de abrir PR para `main`.
7. As migrations do banco rodam sozinhas quando o `twenty-server` sobe (o worker tem `DISABLE_DB_MIGRATIONS=true`).

## Ambiente local
- Seguir o guia oficial de setup local para contribuidores: https://docs.twenty.com (Developers → Local Setup).
- Nunca usar o banco de produção do Railway localmente.

## Segredos
- `ENCRYPTION_KEY` fica só nas variáveis do Railway. Nunca commitar `.env`.
- Perder a `ENCRYPTION_KEY` = perder acesso a todos os segredos salvos no banco (tokens OAuth etc.).

## Customizações no core
<!-- Liste aqui cada alteração feita no código do Twenty -->
- `CLAUDE.md`: linha `@LENSCORP.md` adicionada no topo para carregar estas regras. Em conflito de merge, manter a versão do upstream e reinserir essa linha.
- **Ação de workflow "Send WhatsApp"** (`SEND_WHATSAPP`, menu Núcleo, ao lado de Send Email). Motivo: disparar modelo de WhatsApp para o lead direto do fluxo de trabalho, sem expor a chave do serviço dentro do workflow. O servidor chama `POST /whatsapp/api/send-template` do `lenscorp-meta-leads` (o envio em si continua fora deste repo). Modelada sobre `SEND_CHAT_MESSAGE`. Em conflito de merge, preservar as linhas do `SEND_WHATSAPP`:
  - `twenty-shared`: `workflow/types/WorkflowActionType.ts`, `workflow/schemas/workflow-action-schema.ts`, `workflow/index.ts`, novos `workflow/schemas/send-whatsapp-action-schema.ts` e `send-whatsapp-action-settings-schema.ts`.
  - `twenty-server`: `engine/core-modules/twenty-config/config-variables.ts` (variáveis `WHATSAPP_SERVICE_URL` e `WHATSAPP_SERVICE_KEY`), `modules/workflow/workflow-executor/factories/workflow-action.factory.ts`, `workflow-executor.module.ts`, `workflow-actions/types/workflow-action.type.ts`, `workflow-actions/types/workflow-action-settings.type.ts`, `modules/workflow/workflow-builder/workflow-version-step/workflow-version-step-operations.workspace-service.ts` e a pasta nova `workflow-actions/send-whatsapp/`.
  - `twenty-front`: `modules/workflow/types/Workflow.ts`, `workflow-variables/utils/generate/computeStepOutputSchema.ts`, `workflow-steps/components/WorkflowStepDetail.tsx`, `WorkflowRunStepNodeDetail.tsx`, `workflow-actions/constants/CoreActions.ts`, `utils/getActionIcon.ts`, `getActionIconColorOrThrow.ts`, `getActionIconStrokeOrThrow.ts`, `generated/graphql.ts` (valor do enum, ajuste manual), e os novos `constants/actions/SendWhatsappAction.ts` e `send-whatsapp-action/`.
  - Variáveis no Railway (`twenty-server` e `twenty-worker`): `WHATSAPP_SERVICE_URL` (ex.: `https://meta-leads-production-f9af.up.railway.app`) e `WHATSAPP_SERVICE_KEY` (o mesmo valor de `WHATSAPP_ONBOARDING_KEY` do `lenscorp-meta-leads`).
  - **Só funciona com imagem própria.** Produção roda a imagem oficial `twentycrm/twenty`, que não tem essa ação; ela só aparece no menu depois que `twenty-server` e `twenty-worker` passarem a rodar uma imagem construída a partir deste fork.
