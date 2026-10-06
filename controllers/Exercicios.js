import pool from "../database.js"

export const ExercicioPOST = async (req,res) => {
  const form = req.body?.form

  if (!form || typeof form !== "object" || Array.isArray(form) ||
      [form.treino_id,form.nome,form.series,form.repeticoes].some(value => value === undefined || value === null || value === "")) {
    return res.status(400).json({response:"formulario incompleto!"})
  }

  const client = await pool.connect()

  try{

    const resp = await client.query(`
      INSERT INTO EXERCICIOS(TREINO_ID,NOME,SERIES,REPETICOES)
      SELECT ID,$2,$3,$4 FROM TREINOS
      WHERE ID = $1 AND USER_ID = $5
      RETURNING *
      `,[form.treino_id,form.nome,form.series,form.repeticoes,req.user.id])
      
      if (resp.rows.length === 0) return res.status(404).json({response:"Treino não encontrado!"})
      res.status(200).json({response:resp.rows})
      
    }catch(err){
      
    if(err.code === '23503') return res.status(404).json({response:"Treino associado não encontrado!"})
    
    res.status(500).json({response:"Erro no servidor!"})
    console.log(err)

  }finally{
    client.release()
  }

}

export const ExercicioPUT = async (req,res) => {

  const form = req.body?.form

  if (!form || typeof form !== "object" || Array.isArray(form) ||
      [form.treino_id,form.nome,form.series,form.repeticoes,form.exercicio_id].some(value => value === undefined || value === null || value === "")) {
    return res.status(400).json({response:"formulario incompleto!"})
  }

  const client = await pool.connect()  

  try{

    const resp = await client.query(`
      UPDATE EXERCICIOS
      SET
        TREINO_ID = $1,
        NOME = $2,
        SERIES = $3,
        REPETICOES = $4
      WHERE ID = $5
        AND TREINO_ID IN (SELECT ID FROM TREINOS WHERE USER_ID = $6)
        AND $1 IN (SELECT ID FROM TREINOS WHERE USER_ID = $6)
      RETURNING *
    `,[form.treino_id,form.nome,form.series,form.repeticoes,form.exercicio_id,req.user.id])

    if (resp.rows.length === 0) return res.status(404).json({response:"Exercício não encontrado!"})
    res.status(200).json({response:resp.rows})

  }catch(err){

    if(err.code === '23503') return res.status(404).json({response:"exercicio não encontrado!"})

    res.status(500).json({response:"Erro no servidor"})
    console.log(err)

  }finally{
    client.release()
  }

}

export const ExercicioDELETE = async (req,res) => {

  const {id_exercicio,id_treino} = req.query

  if(!id_exercicio || !id_treino) return res.status(400).json({response:"ID não enviado!"})

  const client = await pool.connect()

  try{

    const resp = await client.query(`
      DELETE FROM EXERCICIOS
      WHERE ID = $1 AND TREINO_ID = $2
        AND TREINO_ID IN (SELECT ID FROM TREINOS WHERE USER_ID = $3)
      RETURNING *
    `,[id_exercicio,id_treino,req.user.id])

    if (resp.rows.length === 0) return res.status(404).json({response:"Exercício não encontrado!"})
    res.status(200).json({response:"Exercicio Deletado!"})

  }catch(err){

    if(err.code === '23503') return res.status(404).json({response:"Exercicio não encontrado!"})

    res.status(500).json({response:"Erro no Servidor"})
    console.log(err)

  }finally{
    client.release()
  }
    
}
