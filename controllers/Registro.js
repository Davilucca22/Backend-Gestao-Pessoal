import pool from "../database.js"
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'

export const Registro = async (req,res) => {

    const form = req.body?.form
    if (!form || typeof form !== "object" || Array.isArray(form) ||
        typeof form.name !== "string" || !form.name.trim() ||
        typeof form.email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ||
        typeof form.senha !== "string" || form.senha.length < 8) {
        return res.status(400).json({response:"Formulario incompleto ou inválido!"})
    }

    let client
    try{
        const hash = await argon2.hash(form.senha)
        client = await pool.connect()

        const resp = await client.query(`
            INSERT INTO USERS(NAME,EMAIL,SENHA_HASH,STATUS)
            VALUES($1,$2,$3,TRUE)    
            RETURNING ID,NAME,EMAIL,STATUS
        `,[form.name.trim(),form.email.trim().toLowerCase(),hash])

        const user = resp.rows[0]
        const isProduction = process.env.NODE_ENV === 'production'

        const token = jwt.sign(
            {id:user.id,name:user.name},
            process.env.SECRET,
            {expiresIn:'7d',algorithm:'HS256'}
        )

        res.cookie('token',token, {
            httpOnly:true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(201).json({response:user})

    }catch(err){
        if (err.code === "23505") {
            return res.status(409).json({response:"Já existe uma conta com esse email."})
        }

        res.status(500).json({response:"Erro no servidor"})
        console.error("Falha ao registrar usuário:", err)

    }finally{
        client?.release()
    }
}
