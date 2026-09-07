import { Pool } from 'pg'

const shouldUseSsl = String(process.env.DB_SSL || 'true').toLowerCase() === 'true'
const connectionString = process.env.DATABASE_URL || ''

const connectionConfig = connectionString
    ? { connectionString }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'postgres',
    }

export const pool = new Pool({
    ...connectionConfig,
    max: Number(process.env.DB_POOL_SIZE || 10),
    ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
})

export async function checkDatabaseConnection() {
    await pool.query('SELECT 1')
}
