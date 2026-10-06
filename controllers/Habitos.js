import pool from "../database.js"

//busca os habitos de um usuario
export const HabitosGET = async (req,res) => {
    const client = await pool.connect()

    try{
    
        const resp = await client.query(`
            SELECT USERS.NAME,HABITOS.*
            FROM USERS INNER JOIN HABITOS
            ON USERS.ID = HABITOS.ID_USER
            WHERE USERS.ID = $1
            `,[req.user.id]
        )
    
        const items = resp.rows
    
        if(items.length === 0) return res.status(404).json({response:"Dados não encontrados"})

            res.status(200).json({response:items})
            
        }catch(err){
            res.status(500).json({response:"Erro no Servidor"})
            console.log(err)
        }finally{
            
            client.release()
        }
}

export const HabitosPOST = async (req,res) => {

    const {habito} = req.query

    if(typeof habito !== "string" || !habito.trim()) return res.status(400).json({response:"dados Incompletos!"})

    const client = await pool.connect()

    try{

        const resp = await client.query(`
            INSERT INTO HABITOS(ID_USER,HABITO)
            VALUES($1,$2) RETURNING *
            `,[req.user.id,habito.trim()])

        const items = resp.rows

        if(items.length === 0) return res.status(400).json({response:"Dados não encontrados"})

            res.status(200).json({response:"habito  adicionado"})
            
        }catch(err){
            
            res.status(500).json({response:"Erro no servidor"})

        }finally{
            
            client.release()

        }
}

export const HabitosPUT = async (req,res) => {

    const {idHabito,habito} = req.query
    
    if(!idHabito || typeof habito !== "string" || !habito.trim()) return res.status(400).json({response:"Dados Incompletos!"})
        
        const client = await pool.connect()
        
        try{

        const resp = await client.query(`
            UPDATE HABITOS
            SET habito = $1
            WHERE ID = $2 AND ID_USER = $3
            RETURNING *
            `,[habito.trim(),idHabito,req.user.id])
    
        if(resp.rows.length === 0) return res.status(404).json({response:"habito nao encontrado!"})
            
        res.status(200).json({response:"Atualizado!"})
            
        }catch(err){
            res.status(500).json({response:"Erro no servidor"})
            console.log(err)
        }finally{

            client.release()

        }
}

export const HabitosDELETE = async (req,res) => {

    const {idHabito} = req.query

    if(!idHabito) return res.status(400).json({response:"Dados Incompletos!"})

    const client = await pool.connect()

    try{
        const resp = await client.query(`
            DELETE FROM HABITOS
            WHERE ID = $1 AND ID_USER = $2
            RETURNING *
            `,[idHabito,req.user.id])

        if(resp.rows.length === 0) return res.status(404).json({response:"habito nao encontrado!"})

        res.status(200).json({response:"Deletado!"})

    }catch(err){
        res.status(500).json({response:"Erro no Servidor"})
    }finally{
        client.release()
    }
}


export const RegistraHabito = async (req,res) => {
    const {idHabito,data} = req.query

    if(!idHabito || !data) return res.status(400).json({response:"Dados Incompletos"})

    const client = await pool.connect()

    try{

        const  resp = await client.query(`
            INSERT INTO dias_habitos(ID_HABITO,ID_USER,DATA)
            SELECT HABITOS.ID, HABITOS.ID_USER, $2
            FROM HABITOS
            WHERE HABITOS.ID = $1 AND HABITOS.ID_USER = $3
            RETURNING *
            `,[idHabito,data,req.user.id])

        if (resp.rows.length === 0) return res.status(404).json({response:"Hábito não encontrado"})

        res.status(200).json({response:"Gravado!"})

    }catch(err){
        res.status(500).json({response:"Erro no servidor"})
        console.log(err)
    }finally{
        client.release()
    }

}

export const DeletaRegistro = async (req,res) => {
    const {id} = req.query

    if(!id) return res.status(404).json({response:"Dados Incompletos"})

    const client = await pool.connect()

    try{

        const  resp = await client.query(`
            DELETE FROM dias_habitos
            WHERE ID = $1 AND ID_USER = $2
            RETURNING ID
            `,[id,req.user.id])

        if (resp.rows.length === 0) return res.status(404).json({response:"Registro não encontrado"})
        res.status(200).json({response:"Deletado!"})

    }catch(err){
        res.status(500).json({response:"Erro no servidor"})
        console.log(err)
    }finally{
        client.release()
    }

}