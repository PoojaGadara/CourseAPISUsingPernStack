import pkg from 'pg';

const { Pool } = pkg;
import { config as dotenvConfig } from 'dotenv';
dotenvConfig()

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

export default pool;