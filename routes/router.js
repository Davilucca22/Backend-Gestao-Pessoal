import  { Router } from 'express'
const router = Router()

import { FinanciasPOST,FinanciasGET, FinaciasDELETE } from '../controllers/Financias.js'
import { HabitosGET } from '../controllers/Habitos.js'

router.get('/',(req,res) => {
    res.send('Ola, Filho da Puta')
})

router.post("/financias",FinanciasPOST)
router.get("/financias",FinanciasGET)
router.delete("/financias",FinaciasDELETE)

router.get("/habitos",HabitosGET)

export default router