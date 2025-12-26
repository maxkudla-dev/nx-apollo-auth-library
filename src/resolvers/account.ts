import { toIso, toNullableIso } from '@/utils/src/date-formatters';

export const accountResolvers = {
  created_at: (account: { created_at: Date }) => toIso(account.created_at),
  updated_at: (account: { updated_at: Date }) => toIso(account.updated_at),
  deleted_at: (account: { deleted_at: Date | null }) => toNullableIso(account.deleted_at),
};
