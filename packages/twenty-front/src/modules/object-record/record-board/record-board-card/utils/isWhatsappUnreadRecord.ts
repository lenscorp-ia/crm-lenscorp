import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

// [lenscorp] statusWhatsapp is a custom field kept up to date by the lenscorp-meta-leads service.
// It is only fetched when the field is visible on the board card.
export const isWhatsappUnreadRecord = (
  record: ObjectRecord | null | undefined,
) => record?.statusWhatsapp === 'NAO_LIDA';
