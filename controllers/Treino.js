import pool from "../database.js"

export const TreinoGET = async (req,res) => {
    
    const client = await pool.connect()

    try{
        //puxa treino + exercicios
        const resp = await client.query(`
            SELECT 
                USERS.ID AS id_user,
                USERS.NAME AS nome_user,
                TREINOS.id as id_treino,
                TREINOS.NOME_TREINO,
                TREINOS.DIA_TREINO,
                EXERCICIOS.ID AS id_exercicio,
                EXERCICIOS.NOME As nome_exercicio,
                EXERCICIOS.SERIES,
                EXERCICIOS.REPETICOES
            FROM USERS
                INNER JOIN TREINOS
                ON USERS.ID = TREINOS.USER_ID
            LEFT JOIN EXERCICIOS
                ON EXERCICIOS.TREINO_ID = TREINOS.ID
            WHERE TREINOS.USER_ID = $1
        `,[req.user.id])

        if(resp.rows.length === 0) return res.status(404).json({response:"Treinos não encontrados"})

        res.status(200).json({response:resp.rows})

    }catch(err){

        res.status(500).json({response:"Erro no servidor"})
        console.log(err)

    }finally{
        client.release()
    }

}

export const TreinoPOST = async (req,res) => {

    const form = req.body?.form

    if (!form || typeof form !== "object" || Array.isArray(form) ||
        [form.nome,form.dia].some(value => value === undefined || value === null || value === "")) {
        return res.status(400).json({response:"Formulario Incompleto!"})
    }

    const client = await pool.connect()

    try{

        const resp = await client.query(`
            INSERT INTO TREINOS(USER_ID,NOME_TREINO,DIA_TREINO)  
            VALUES($1,$2,$3)  
            RETURNING *
        `,[req.user.id,form.nome,form.dia])

        if(resp.rows.length === 0) return res.status(404).json({response:"Erro ao cadastrar treino!"})

        res.status(200).json({response:"Treino Cadastrado!"})
        
    }catch(err){

        res.status(500).json({response:"Erro no Servidor"})
        console.log(err)

    }finally{
        client.release()
    }
    
}

export const TreinoPUT = async (req,res) => {

    const form = req.body?.form

    if (!form || typeof form !== "object" || Array.isArray(form) ||
        [form.nome,form.dia,form.id].some(value => value === undefined || value === null || value === "")) {
        return res.status(400).json({response:"Formulario Incompleto!"})
    }

    const client = await pool.connect()

    try{

        const resp = await client.query(`
            UPDATE TREINOS
            SET
                NOME_TREINO = $1,
                DIA_TREINO = $2
            WHERE ID = $3 AND USER_ID = $4
            RETURNING *
        `,[form.nome,form.dia,form.id,req.user.id])

        if(resp.rows.length === 0) return res.status(404).json({response:"Treino não encontrado"})

        res.status(200).json({response:"Treino Atualizado!"})

    }catch(err){

        res.status(500).json({response:"Erro no servidor!"})
        console.log(err)

    }finally{
        client.release()
    }

}

export const TreinoDELETE = async (req,res) => {
    
    const {id} = req.query

    if(!id) return res.status(400).json({response:"ID não enviado"})

    const client = await pool.connect()

    try{

        const resp = await client.query(`
            DELETE FROM TREINOS
            WHERE ID = $1 AND USER_ID = $2
            RETURNING *
        `,[id,req.user.id])

        if(resp.rows.length === 0) return res.status(404).json({response:"Treino não encontrado!"})

        res.status(200).json({response:"Deletado!"})

    }catch(err){

        res.status(500).json({response:"Erro no servidor!"})
        console.log(err)

    }finally{
        client.release()
    }

}
