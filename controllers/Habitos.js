import pool from "../database.js"

//busca os habitos de um usuario
export const HabitosGET = async (req,res) => {
    const {id} = req.query

    if(!id) return res.status(400).json({response:"Id não enviado"})

    try{
        const client = await pool.connect()
    
        const resp = await client.query(`
            SELECT USERS.NAME,HABITOS.*
            FROM USERS INNER JOIN HABITOS
            ON USERS.ID = HABITOS.ID_USER
            WHERE USERS.ID = $1
            `,[id]
        )
    
        const items = resp.rows
    
        if(items.length === 0) return res.status(404).json({response:"Dados não encontrados"})
    
        client.release()
    
        res.status(200).json({response:items})

    }catch(err){
        res.status(500).json({response:"Erro no Servidor"})
        console.log(err)
    }
}
