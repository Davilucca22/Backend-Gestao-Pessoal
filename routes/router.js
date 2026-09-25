import  { Router } from 'express'
const router = Router()

import { FinanciasPOST,FinanciasGET, FinaciasDELETE } from '../controllers/Financias.js'
import { HabitosGET, HabitosPUT, HabitosDELETE, HabitosPOST, RegistraHabito, DeletaRegistro } from '../controllers/Habitos.js'
import { AgendaDELETE, AgendaGET, AgendaPOST, AgendaPUT } from '../controllers/Agenda.js'

router.get('/',(req,res) => {
    res.send('Ola, Filho da Puta')
})

router.post("/financias",FinanciasPOST)
router.get("/financias",FinanciasGET)
router.delete("/financias",FinaciasDELETE)

router.get("/habitos",HabitosGET)
router.post("/habitos", HabitosPOST)
router.put("/habitos",HabitosPUT)
router.delete("/habitos",HabitosDELETE)

router.post("/habitos/registrar",RegistraHabito)
router.delete("/habitos/registrar",DeletaRegistro)

router.get("/agenda",AgendaGET)
router.post("/agenda",AgendaPOST)
router.put("/agenda",AgendaPUT)
router.delete("/agenda",AgendaDELETE)

export default router
