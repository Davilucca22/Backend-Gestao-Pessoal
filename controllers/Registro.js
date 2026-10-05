import pool from "../database.js"
import argon2 from 'argon2'

export const Registro = async (req,res) => {

    const {form} = req.body

    //verifica campos vazios no formulario
    const vazio = Object.values(form).some(
        val => val === null || val === undefined || (typeof val === "string" && val.trim() === "")
    )

    if(vazio) return res.status(400).json({response:"Formulario incompleto!"})

    const client = await pool.connect()

    try{

        const hash = await argon2.hash(form.senha)

        const resp = await client.query(`
            INSERT INTO USERS(NAME,EMAIL,SENHA_HASH,STATUS)
            VALUES($1,$2,$3,TRUE)    
            RETURNING ID,NAME,EMAIL,STATUS
        `,[form.name,form.email,hash])

        res.status(200).json({response:resp.rows})

    }catch(err){

        res.status(500).json({response:"Erro no servidor"})
        console.log(err)

    }finally{
        client.release()
    }
}
