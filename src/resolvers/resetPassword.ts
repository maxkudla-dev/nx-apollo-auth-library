import { Account } from '../entities/account';
import { hashPassword } from '../utils/password';
import type { AuthGraphQLContext } from '@/utils/src/auth-context';

type ResetPasswordArgs = {
  username: string;
  new_password: string;
};

export const resetPassword = async (
  _parent: unknown,
  args: ResetPasswordArgs,
  context: AuthGraphQLContext,
) => {
  const dataSource = await context.getDataSource();
  const repo = dataSource.getRepository(Account);
  const account = await repo.findOne({
    where: { username: args.username, deleted_at: null },
  });
  if (!account) {
    throw new Error('Account not found');
  }
  account.password = await hashPassword(args.new_password);
  return repo.save(account);
};
