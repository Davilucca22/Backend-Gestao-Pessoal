import pkg from 'pg';
import 'dotenv/config'

const {Pool} = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_CONNECT,
    ssl: process.env.DATABASE_SSL === "false"
        ? false
        : { rejectUnauthorized: true }
})

export async function testConnect(){
    const client = await pool.connect()
    try {
        await client.query(`
            CREATE TABLE IF NOT EXISTS USER_APP_DATA (
                USER_ID TEXT PRIMARY KEY,
                DATA JSONB NOT NULL DEFAULT '{}'::jsonb,
                UPDATED_AT TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                RELATIONAL_SYNCED_AT TIMESTAMPTZ
            )
        `)
        await client.query(`
            ALTER TABLE USER_APP_DATA
            ADD COLUMN IF NOT EXISTS RELATIONAL_SYNCED_AT TIMESTAMPTZ
        `)
        await client.query(`
            CREATE TABLE IF NOT EXISTS USER_APP_RECORDS (
                USER_ID TEXT NOT NULL,
                COLLECTION TEXT NOT NULL,
                CLIENT_ID TEXT NOT NULL,
                RECORD_ID INTEGER NOT NULL,
                PRIMARY KEY (USER_ID, COLLECTION, CLIENT_ID)
            )
        `)
    } finally {
        client.release()
    }
    console.log("Banco conectado")
}

export default pool
