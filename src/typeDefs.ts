import { gql } from '@apollo/server';

export const authTypeDefs = gql`
  extend type Query {
    accounts: [Account!]!
  }

  extend type Mutation {
    signUp(
      username: String!
      password: String!
      first_name: String!
      last_name: String!
      email: String!
      phone_number: String!
    ): AuthPayload!
    signIn(username: String!, password: String!): AuthPayload!
    resetPassword(username: String!, new_password: String!): Account!
    updateProfile(
      email: String!
      first_name: String
      last_name: String
      phone_number: String
    ): Profile!
  }

  type AuthPayload {
    token: String!
    account: Account!
  }

  type Account {
    username: String!
    created_at: String!
    updated_at: String!
    deleted_at: String
  }

  type Profile {
    first_name: String!
    last_name: String!
    email: String!
    phone_number: String!
    account_id: String!
    created_at: String!
    updated_at: String!
  }
`;
