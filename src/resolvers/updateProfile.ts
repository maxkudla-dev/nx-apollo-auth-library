import { Profile } from '../entities/profile';
import type { AuthGraphQLContext } from '@/utils/src/auth-context';

type UpdateProfileArgs = {
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
};

export const updateProfile = async (
  _parent: unknown,
  args: UpdateProfileArgs,
  context: AuthGraphQLContext,
) => {
  const dataSource = await context.getDataSource();
  const repo = dataSource.getRepository(Profile);
  const profile = await repo.findOne({ where: { email: args.email } });
  if (!profile) {
    throw new Error('Profile not found');
  }
  if (typeof args.first_name === 'string') {
    profile.first_name = args.first_name;
  }
  if (typeof args.last_name === 'string') {
    profile.last_name = args.last_name;
  }
  if (typeof args.phone_number === 'string') {
    profile.phone_number = args.phone_number;
  }
  return repo.save(profile);
};
