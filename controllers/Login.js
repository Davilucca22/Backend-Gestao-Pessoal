import pool from "../database.js"
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'

export const Login = async (req,res) => {
    const form = req.body?.form

    if (!form || typeof form !== "object" || Array.isArray(form) ||
        typeof form.email !== "string" || typeof form.senha !== "string" ||
        !form.email.trim() || !form.senha) {
        return res.status(400).json({response:"Formulario incompleto!"})
    }

    try{
        const resp = await pool.query(`
            SELECT ID, NAME, EMAIL, STATUS, SENHA_HASH FROM USERS
            WHERE LOWER(EMAIL) = $1
            `,[form.email.trim().toLowerCase()])
            
        if (resp.rows.length === 0) {
            return res.status(401).json({response:"Email ou senha incorretos!"})
        }

        const obj = resp.rows[0]

        const validate = await argon2.verify(obj.senha_hash,form.senha)

        if(!validate) return res.status(401).json({response:"Email ou senha incorretos!"})

        const response = {
            id: obj.id,
            name: obj.name,
            email: obj.email,
            status: obj.status
        }

        const isProduction = process.env.NODE_ENV === 'production'

        const token = jwt.sign(
            {id:response.id,name:response.name},
            process.env.SECRET,
            {expiresIn:'7d',algorithm:'HS256'}
        )

        res.cookie('token',token, {
            httpOnly:true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({response})

    }catch(err){

        res.status(500).json({response:"Erro no servidor"})
        console.error("Falha ao autenticar usuário:", err)

    }finally{
    }

}
