import  { Router } from 'express'
const router = Router()

import { Registro } from '../controllers/Registro.js'
import { Login } from '../controllers/Login.js'
import { FinanciasPOST,FinanciasGET, FinaciasDELETE } from '../controllers/Financias.js'
import { HabitosGET, HabitosPUT, HabitosDELETE, HabitosPOST, RegistraHabito, DeletaRegistro } from '../controllers/Habitos.js'
import { AgendaDELETE, AgendaGET, AgendaPOST, AgendaPUT } from '../controllers/Agenda.js'
import { CalendarioGET,CalendarioPOST,CalendarioPUT,CalendarioDELETE } from '../controllers/Calendario.js'
import { TreinoGET, TreinoPOST, TreinoPUT, TreinoDELETE } from '../controllers/Treino.js'
import { ExercicioPOST,ExercicioPUT,ExercicioDELETE } from '../controllers/Exercicios.js'
import { CurrentUser, GetUserData, ImportUserData, ReplaceUserData } from '../controllers/UserData.js'

import { verifyToken } from '../midlewares/authMiddleware.js'
import { authLimiter } from '../midlewares/rate_limit.js'


router.get('/',(req,res) => {
    res.send('Ola, Filho da Puta')
})

router.post("/registro",authLimiter,Registro)
router.post("/login",authLimiter,Login)
router.get("/me",verifyToken,CurrentUser)
router.get("/me/data",verifyToken,GetUserData)
router.put("/me/data",verifyToken,ReplaceUserData)
router.post("/me/data/import",verifyToken,ImportUserData)
router.post("/logout",verifyToken,(req,res) => {
    const isProduction = process.env.NODE_ENV === "production"
    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/"
    })
    res.status(200).json({response: "Sessão encerrada"})
})

router.post("/financias",verifyToken,FinanciasPOST)
router.get("/financias",verifyToken,FinanciasGET)
router.delete("/financias",verifyToken,FinaciasDELETE)

router.get("/habitos",verifyToken,HabitosGET)
router.post("/habitos",verifyToken, HabitosPOST)
router.put("/habitos",verifyToken,HabitosPUT)
router.delete("/habitos",verifyToken,HabitosDELETE)

router.post("/habitos/registrar",verifyToken,RegistraHabito)
router.delete("/habitos/registrar",verifyToken,DeletaRegistro)

router.get("/agenda",verifyToken,AgendaGET)
router.post("/agenda",verifyToken,AgendaPOST)
router.put("/agenda",verifyToken,AgendaPUT)
router.delete("/agenda",verifyToken,AgendaDELETE)

router.get("/calendario",verifyToken,CalendarioGET)
router.post("/calendario",verifyToken,CalendarioPOST)
router.put("/calendario",verifyToken,CalendarioPUT)
router.delete("/calendario",verifyToken,CalendarioDELETE)

router.get("/treino",verifyToken,TreinoGET),
router.post("/treino",verifyToken,TreinoPOST),
router.put("/treino",verifyToken,TreinoPUT),
router.delete("/treino",verifyToken,TreinoDELETE)

router.post("/treino/exercicios",verifyToken,ExercicioPOST),
router.put("/treino/exercicios",verifyToken,ExercicioPUT),
router.delete("/treino/exercicios",verifyToken,ExercicioDELETE)

export default router