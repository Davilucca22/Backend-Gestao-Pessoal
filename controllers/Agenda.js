import pool from "../database.js"

export const AgendaGET = async (req,res) => {
    const client = await pool.connect()

    try{

        const resp = await client.query(`
            SELECT USERS.NAME,AGENDA.* FROM
            USERS INNER JOIN AGENDA ON
            USERS.ID = AGENDA.ID_USER
            WHERE USERS.ID = $1
            `,[req.user.id])

        if(resp.rows.length === 0) return res.status(404).json({response:"Registros não encontrados!"})

        res.status(200).json({response:resp.rows})

    }catch(err){

        res.status(500).json({response:"Erro no servidor"})
        console.log(err)

    }finally{
        client.release()
    }
}

export const AgendaPOST = async (req,res) => {
    const form = req.body?.form

    if (!form || typeof form !== "object" || Array.isArray(form) ||
        [form.titulo,form.anotacao,form.data].some(value => value === undefined || value === null || value === "")) {
        return res.status(400).json({response:"Formulario incompleto"})
    }

    const client = await pool.connect()

    try{

        const resp = await client.query(`
            INSERT INTO AGENDA(ID_USER,TITULO,ANOTACAO,DATA)
            VALUES($1,$2,$3,$4)
            RETURNING *
            `,[req.user.id,form.titulo,form.anotacao,form.data])

        if(resp.rows.length === 0) return res.status(404).json({response:"Usuario não encontrado!"})

        res.status(200).json({response:"Salvo!"})

    }catch(err){
        if(err.code === '23503') return res.status(404).json({response:"Usuario não encontrado!"})
        
        res.status(500).json({response:"Erro no servidor"})
        console.log(err)
    }finally{
        client.release()
    }

}

export const AgendaPUT = async (req,res) => {
    const form = req.body?.form

    if (!form || typeof form !== "object" || Array.isArray(form) ||
        [form.titulo,form.anotacao,form.data,form.id].some(value => value === undefined || value === null || value === "")) {
        return res.status(400).json({response:"Formulario Incompleto!"})
    }

    const client = await pool.connect()

    try{
        
        const resp = await client.query(`
            UPDATE AGENDA
            SET 
                TITULO = $1,
                ANOTACAO = $2,
                DATA = $3
            WHERE ID = $4 AND ID_USER = $5
            RETURNING *
            `,[form.titulo,form.anotacao,form.data,form.id,req.user.id])

        if(resp.rows.length === 0) return res.status(404).json({response:"Anotação não encontrada"})

        res.status(200).json({response:"Atualizado"})


    }catch(err){

        res.status(500).json({response:"Erro no Servidor"})
        console.log(err)

    }finally{
        client.release()
    }

}

export const AgendaDELETE = async (req,res) => {
    const {id} = req.query

    if(!id) return res.status(400).json({response:"id não enviado"})

    const client = await pool.connect()

    try{

        const resp = await client.query(`
            DELETE FROM AGENDA
            WHERE ID = $1 AND ID_USER = $2
            RETURNING *
            `,[id,req.user.id])

        if(resp.rows.length === 0) return res.status(404).json({response:"anotação nao encontrada!"})

        res.status(200).json({response:"Deletado"})

    }catch(err){

        res.status(500).json({reponse:"Erro no servidor"})
        console.log(err)

    }finally{
        client.release()
    }

}
