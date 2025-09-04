export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
}

export const databaseConfig: DatabaseConfig = {
  host: process.env.SHOPENUP_DB_HOST || 'localhost',
  port: parseInt(process.env.SHOPENUP_DB_PORT || '5432'),
  database: process.env.SHOPENUP_DB_NAME || 'shopenup_dev',
  username: process.env.SHOPENUP_DB_USER || 'postgres',
  password: process.env.SHOPENUP_DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production'
};

export const getDatabaseUrl = (): string => {
  const { host, port, database, username, password, ssl } = databaseConfig;
  return `postgresql://${username}:${password}@${host}:${port}/${database}${ssl ? '?sslmode=require' : ''}`;
};

