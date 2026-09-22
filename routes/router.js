import  { Router } from 'express'
const router = Router()

import { FinanciasPOST,FinanciasGET, FinaciasDELETE } from '../controllers/Financias.js'

router.get('/',(req,res) => {
    res.send('Ola, Filho da Puta')
})

router.post("/financias",FinanciasPOST)
router.get("/financias",FinanciasGET)
router.delete("/financias",FinaciasDELETE)

export default router