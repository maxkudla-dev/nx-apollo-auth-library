import { Account } from '../entities/account';
import type { AuthGraphQLContext } from '@/utils/src/auth-context';

export const accounts = async (_parent: unknown, _args: unknown, context: AuthGraphQLContext) => {
  const dataSource = await context.getDataSource();
  return dataSource.getRepository(Account).find({ order: { created_at: 'DESC' } });
};
