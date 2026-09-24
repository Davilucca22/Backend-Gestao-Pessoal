import pool from "../database.js"

//adiciona um novo registro no banco
export const FinanciasPOST = async (req,res) => {
    const client = await pool.connect()
 
    try{
        const {form} = req.body
    
        if(!form) return res.status(404).json({response:"Formulario não enviado"})
    
        //verifica campos vazios no formulario
        const vazio = Object.values(form).some(
            val => val === null || val === undefined || (typeof val === "string" && val.trim() === "")
        )
    
        if(vazio) return res.status(404).json({response:"Formulario incompleto!"})
    
    
        const resp = await client.query(
            `INSERT INTO FINANCIAS(ID_USER,TIPO,DESCRICAO,CATEGORIA,VALOR,DATA)
            VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
            [form.id,form.tipo,form.descricao,form.categoria,form.valor,form.data]
        )
 
        res.status(201).json({response:"Registro Salvo!",obj: resp.rows[0]})
        
    }catch(err){
        res.status(500).json({response:"Erro no servidor"})
        console.log(err)
    }finally{
        client.release()
    }

}

//busca todos os registro financeiros de um usuario
export const FinanciasGET = async (req,res) =>{
    const {id} = req.query

    if(!id) return res.status(404).json({response:"Id não enviado!"})

    const client = await pool.connect()
    
    try{

        const user = await client.query(`
                SELECT USERS.NAME,FINANCIAS.* FROM
                USERS INNER JOIN FINANCIAS
                ON USERS.ID = FINANCIAS.ID_USER
                WHERE USERS.ID = $1
            `,[id])
        
        const resp = user.rows

        if(resp.length === 0) return res.status(404).json({response:"Dados não encontrados"})
    
            res.status(200).json({response:resp})
            
        }catch(err){
        
            res.status(500).json({response:"Erro no Servidor"})
            console.log(err)
        
        }finally{
            
            client.release()

        }   

}

//deleta um registro financeiro do usuario
export const FinaciasDELETE = async (req,res) =>{
    const {id} = req.query

    if(!id) return res.status(404).json({response:"Id não enviado!"})

    const client = await pool.connect()

    try{

        const resp = await client.query(`
                DELETE FROM FINANCIAS
                WHERE ID = $1
        `,[id])

        res.status(200).json({response:"Registro Apagado"})

    }catch(err){
        res.status(500).json({response:"Erro no Servidor"})
        console.log(err)
    }finally{
        client.release()
    }
}
