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
    client.release()
    console.log("Banco conectado")
}

export default pool
