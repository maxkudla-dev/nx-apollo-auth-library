import type { DataSource } from 'typeorm';

export type AuthGraphQLContext = {
    getDataSource: () => Promise<DataSource>;
};
