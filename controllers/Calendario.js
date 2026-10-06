import pool from "../database.js"

export const CalendarioGET = async (req,res) => {

    const client = await pool.connect()

    try{

        const resp = await client.query(`
            SELECT * FROM CALENDARIO
            WHERE ID_USER = $1
            `,[req.user.id])

        if(resp.rows.length === 0) return res.status(404).json({response:"Evento não encontrado!"})

        res.status(200).json({response:resp.rows})

    }catch(err){
        res.status(500).json({response:"Erro no servidor!"})
        console.log(err)
    }finally{
        client.release()
    }

}

export const CalendarioPOST = async (req,res) => {
    
    const form = req.body?.form

    if (!form || typeof form !== "object" || Array.isArray(form) ||
        [form.titulo,form.data,form.horario,form.descricao].some(value => value === undefined || value === null || value === "")) {
        return res.status(400).json({response:"Formulario Incompleto!"})
    }

    const client = await pool.connect()

    try{

        const resp = await client.query(`
        
            INSERT INTO CALENDARIO(ID_USER,TITULO,DATA,HORARIO,DESCRICAO)
            VALUES($1,$2,$3,$4,$5)
            RETURNING *
        
        `,[req.user.id,form.titulo,form.data,form.horario,form.descricao])

        if(resp.rows.length === 0) return res.status(400).json({response:"Erro ao gravar Dados"})

        res.status(200).json({response:"Evento Salvo!"})

    }catch(err){

        res.status(500).json({response:"Erro no servidor!"})
        console.log(err)

    }finally{
        client.release()
    }

}

export const CalendarioPUT = async (req,res) => {
    const form = req.body?.form

    if (!form || typeof form !== "object" || Array.isArray(form) ||
        [form.titulo,form.data,form.horario,form.descricao,form.id].some(value => value === undefined || value === null || value === "")) {
        return res.status(400).json({response:"Formulario Incompleto"})
    }

    const client = await pool.connect()

    try{

        const resp = await client.query(`
            UPDATE CALENDARIO
            SET
                TITULO = $1,
                DATA = $2,
                HORARIO = $3,
                DESCRICAO = $4
            WHERE ID = $5 AND ID_USER = $6
            RETURNING *
        `,[form.titulo,form.data,form.horario,form.descricao,form.id,req.user.id])

        if(resp.rows.length === 0) return res.status(404).json({response:"Evento não encontrado!"})

        res.status(200).json({response:resp.rows})

    }catch(err){

        res.status(500).json({response:"Erro no servidor"})
        console.log(err)

    }finally{
        client.release()
    }

}

export const CalendarioDELETE = async (req,res) => {
    const {id} = req.query

    if(!id) return res.status(400).json({response:"ID não enviado"})

    const client = await pool.connect()

    try{
        
        const resp = await client.query(`
        
            DELETE FROM CALENDARIO
            WHERE ID = $1 AND ID_USER = $2
            RETURNING *
        `,[id,req.user.id])

        if(resp.rows.length === 0) return res.status(404).json({response:"Evento não encontrado!"})

        res.status(200).json({response:"Evento Deletado!"})

    }catch(err){

        res.status(500).json({response:"Erro no Servidor"})
        console.log(err)

    }finally{
        client.release()
    }
}