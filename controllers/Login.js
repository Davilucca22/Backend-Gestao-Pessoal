import pool from "../database.js"
import argon2 from 'argon2'

export const Login = async (req,res) => {
    const {form} = req.body

    //verifica campos vazios no formulario
    const vazio = Object.values(form).some(
        val => val === null || val === undefined || (typeof val === "string" && val.trim() === "")
    )

    if(vazio) return res.status(400).json({response:"formulario incompleto!"})

    const client = await pool.connect()

    try{
        
        const resp = await client.query(`
            SELECT * FROM USERS
            WHERE EMAIL = $1    
            `,[form.email])
            
        if(resp.rows.length === 0) res.status(404).json({response:"Usuario não encontrado!"})

        const obj = resp.rows[0]

        const validate = await argon2.verify(obj.senha_hash,form.senha)    

        if(!validate) return res.status(403).json({response:"Senha incorreta!"})

        const response = {
            id: obj.id,
            name: obj.name,
            email: obj.email,
            status: obj.status
        }

        res.status(200).json({response})

    }catch(err){

        res.status(500).json({response:"Erro no servidor"})
        console.log(err)

    }finally{
        client.release()
    }

}
