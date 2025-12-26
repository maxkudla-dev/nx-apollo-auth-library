import { toIso } from '@/utils/src/date-formatters';

export const profileResolvers = {
  created_at: (profile: { created_at: Date }) => toIso(profile.created_at),
  updated_at: (profile: { updated_at: Date }) => toIso(profile.updated_at),
};
