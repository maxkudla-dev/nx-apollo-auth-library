import { accountResolvers } from './account';
import { accounts } from './accounts';
import { profileResolvers } from './profile';
import { resetPassword } from './resetPassword';
import { signIn } from './signIn';
import { signUp } from './signUp';
import { updateProfile } from './updateProfile';

export type { AuthGraphQLContext } from './../utils/auth-context';

export const authResolvers = {
  Query: {
    accounts,
  },
  Mutation: {
    signUp,
    signIn,
    resetPassword,
    updateProfile,
  },
  Account: accountResolvers,
  Profile: profileResolvers,
};
