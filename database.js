import pkg from 'pg';
import { configDotenv } from 'dotenv';

configDotenv()

const {Pool} = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_CONNECT,
    ssl:{
        rejectUnauthorized:false
    }
})

//valida a conexao com o banco de dados
export async function testConnect(){
    try{
        const client = await pool.connect()

        console.log("Banco conectado")

        client.release()
        
    }catch(err){
        console.log("Erro ao conectar com o Banco")
        console.log(err.message)
    }
}

export default pool
