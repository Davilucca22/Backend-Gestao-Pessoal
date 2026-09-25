import pool from "../database.js"

export const AgendaGET = async (req,res) => {
    const {IDuser} = req.query

    if(!IDuser) return res.status(404).json({response:"Dados Incompletos"})

    const client = await pool.connect()

    try{

        const resp = await client.query(`
            SELECT USERS.NAME,AGENDA.* FROM
            USERS INNER JOIN AGENDA ON
            USERS.ID = AGENDA.ID_USER
            WHERE USERS.ID = $1
            `,[IDuser])

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
    const {form} = req.body

    //verifica campos vazios no formulario
    const vazio = Object.values(form).some(
        val => val === null || val === undefined || (typeof val === "string" && val.trim() === "")
    )

    if(vazio) return res.status(404).json({response:"Formulario incompleto"})

    const client = await pool.connect()

    try{

        const resp = await client.query(`
            INSERT INTO AGENDA(ID_USER,TITULO,ANOTACAO,DATA)
            VALUES($1,$2,$3,$4)
            RETURNING *
            `,[form.id,form.titulo,form.anotacao,form.data])

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
    const {form} = req.body

    //verifica campos vazios no formulario
    const vazio = Object.values(form).some(
        val => val === null || val === undefined || (typeof val === "string" && val.trim() === "")
    )

    if(vazio) return res.status(400).json({response:"Formulario Incompleto!"})

    const client = await pool.connect()

    try{
        
        const resp = await client.query(`
            UPDATE AGENDA
            SET 
                TITULO = $1,
                ANOTACAO = $2,
                DATA = $3
            WHERE ID = $4
            RETURNING *
            `,[form.titulo,form.anotacao,form.data,form.id])

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
            WHERE ID = $1
            RETURNING *
            `,[id])

        if(resp.rows.length === 0) return res.status(404).json({response:"anotação nao encontrada!"})

        res.status(200).json({response:"Deletado"})

    }catch(err){

        res.status(500).json({reponse:"Erro no servidor"})
        console.log(err)

    }finally{
        client.release()
    }

}
