import { response } from "express"
import pool from "../database.js"

//busca os habitos de um usuario
export const HabitosGET = async (req,res) => {
    const {id} = req.query

    if(!id) return res.status(400).json({response:"Id não enviado"})

    const client = await pool.connect()

    try{
    
        const resp = await client.query(`
            SELECT USERS.NAME,HABITOS.*
            FROM USERS INNER JOIN HABITOS
            ON USERS.ID = HABITOS.ID_USER
            WHERE USERS.ID = $1
            `,[id]
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

    const {habito, id} = req.query

    if(!habito || !id) return res.status(400).json({response:"dados Incompletos!"})

    const client = await pool.connect()

    try{

        const resp = await client.query(`
            INSERT INTO HABITOS(ID_USER,HABITO)
            VALUES($1,$2) RETURNING *
            `,[id,habito])

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

    const {idHabito,idUser,habito} = req.query
    
    if(!idHabito || !idUser || !habito) return res.status(400).json({response:"Dados Incompletos!"})
        
        const client = await pool.connect()
        
        try{

        console.log(idHabito, idUser, habito)
            
        const resp = await client.query(`
            UPDATE HABITOS
            SET habito = $1
            WHERE ID = $2 AND ID_USER = $3
            RETURNING *
            `,[habito,idHabito,idUser])

        console.log(resp)
    
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

    const {idHabito,idUser} = req.query

    if(!idHabito || !idUser) return res.status(404).json({response:"Dados Incompletos!"})

    const client = await pool.connect()

    try{
        const resp = await client.query(`
            DELETE FROM HABITOS
            WHERE ID = $1 AND ID_USER = $2
            RETURNING *
            `,[idHabito,idUser])

        if(resp.rows.length === 0) return res.status(404).json({response:"habito nao encontrado!"})

        res.status(200).json({response:"Deletado!"})

    }catch(err){
        res.status(500).json({response:"Erro no Servidor"})
    }finally{
        client.release()
    }
}


export const RegistraHabito = async (req,res) => {
    const {idHabito,idUser,data} = req.query

    if(!idHabito || !idUser || !data) return res.status(404).json({response:"Dados Incompletos"})

    const client = await pool.connect()

    try{

        const  resp = await client.query(`
            INSERT INTO dias_habitos(ID_HABITO,ID_USER,DATA)
            VALUES($1,$2,$3)
            RETURNING *
            `,[idHabito,idUser,data])

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
            WHERE ID = $1 
            `,[id])

        res.status(200).json({response:"Deletado!"})

    }catch(err){
        res.status(500).json({response:"Erro no servidor"})
        console.log(err)
    }finally{
        client.release()
    }

}