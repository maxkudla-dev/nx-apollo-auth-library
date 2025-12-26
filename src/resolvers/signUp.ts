import { Account } from '../entities/account';
import { Profile } from '../entities/profile';
import { createAccessToken } from '../utils/jwt';
import { hashPassword } from '../utils/password';
import type { AuthGraphQLContext } from '@/utils/src/auth-context';

type SignUpArgs = {
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
};

type AuthPayload = {
  token: string;
  account: Account;
};

export const signUp = async (
  _parent: unknown,
  args: SignUpArgs,
  context: AuthGraphQLContext,
) => {
  const dataSource = await context.getDataSource();
  const passwordHash = await hashPassword(args.password);
  return dataSource.transaction<AuthPayload>(async (manager) => {
    const accountRepo = manager.getRepository(Account);
    const profileRepo = manager.getRepository(Profile);
    const account = accountRepo.create({
      username: args.username,
      password: passwordHash,
    });
    await accountRepo.save(account);
    const token = createAccessToken({ sub: account.id, username: account.username });
    const profile = profileRepo.create({
      first_name: args.first_name,
      last_name: args.last_name,
      email: args.email,
      phone_number: args.phone_number,
      account_id: account.id,
      account,
    });
    await profileRepo.save(profile);
    return { token, account };
  });
};
