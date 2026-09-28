import pool from "../database.js"

export const CalendarioGET = async (req,res) => {

    const {id} = req.query

    if(!id) return res.status(400).json({response:"ID não enviado!"})

    const client = await pool.connect()

    try{

        const resp = await client.query(`
            SELECT * FROM CALENDARIO
            WHERE ID_USER = $1
            `,[id])

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
    
    const {form} = req.body

    //verifica campos vazios no formulario
    const vazio = Object.values(form).some(
        val => val === null || val === undefined || (typeof val === "string" && val.trim() === "")
    )

    if(vazio) return res.status(400).json({response:"Formulario Incompleto!"})

    const client = await pool.connect()

    try{

        const resp = await client.query(`
        
            INSERT INTO CALENDARIO(ID_USER,TITULO,DATA,HORARIO,DESCRICAO)
            VALUES($1,$2,$3,$4,$5)
            RETURNING *
        
        `,[form.id_user,form.titulo,form.data,form.horario,form.descricao])

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
    const {form} = req.body

    //verifica campos vazios no formulario
    const vazio = Object.values(form).some(
        val => val === null || val === undefined || (typeof val === "string" && val.trim() === "")
    )

    if(vazio) res.status(400).json({response:"Formulario Incompleto"})

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
        `,[form.titulo,form.data,form.horario,form.descricao,form.id,form.id_user])

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
    const {id,id_user} = req.query

    if(!id || !id_user) res.status(400).json({response:"IDs não enviados"})

    const client = await pool.connect()

    try{
        
        const resp = await client.query(`
        
            DELETE FROM CALENDARIO
            WHERE ID = $1 AND ID_USER = $2
            RETURNING *
        `,[id,id_user])

        if(resp.rows.length === 0) return res.status(404).json({response:"Evento não encontrado!"})

        res.status(200).json({response:"Evento Deletado!"})

    }catch(err){

        res.status(500).json({response:"Erro no Servidor"})
        console.log(err)

    }finally{
        client.release()
    }
}