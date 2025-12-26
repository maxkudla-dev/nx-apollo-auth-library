import { Account } from '../entities/account';
import { createAccessToken } from '../utils/jwt';
import { hashPassword, isHashedPassword, verifyPassword } from '../utils/password';
import type { AuthGraphQLContext } from '@/utils/src/auth-context';

type SignInArgs = {
  username: string;
  password: string;
};

type AuthPayload = {
  token: string;
  account: Account;
};

export const signIn = async (
  _parent: unknown,
  args: SignInArgs,
  context: AuthGraphQLContext,
) => {
  const dataSource = await context.getDataSource();
  const repo = dataSource.getRepository(Account);
  const account = await repo.findOne({
    where: { username: args.username, deleted_at: null },
  });
  if (!account) {
    throw new Error('Invalid credentials');
  }
  const passwordMatches = await verifyPassword(args.password, account.password);
  if (!passwordMatches) {
    throw new Error('Invalid credentials');
  }
  if (!isHashedPassword(account.password)) {
    account.password = await hashPassword(args.password);
    await repo.save(account);
  }
  const token = createAccessToken({ sub: account.id, username: account.username });
  return { token, account };
};
