import { authResolvers } from './resolvers';
import { authTypeDefs } from './typeDefs';

export const authSchema = {
  typeDefs: authTypeDefs,
  resolvers: authResolvers,
};
