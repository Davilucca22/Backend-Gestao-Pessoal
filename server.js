import router from "./routes/router.js"
import helmet from 'helmet'
import cookieParser from "cookie-parser"
import Express from "express"
const app = Express()

import {testConnect} from "./database.js"

app.use(helmet())

app.use(Express.json())
app.use(Express.urlencoded({extended:true}))
app.use(cookieParser())

app.use(router)

try{
    await testConnect()

    app.listen(process.env.PORT,"0.0.0.0",() => {
        console.log("Servidor Rodando")
    })

}catch(err){
    console.log("Aplicação nao iniciada")
    process.emit(1)
}

