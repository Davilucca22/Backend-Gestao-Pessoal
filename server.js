import router from "./routes/router.js"
import helmet from 'helmet'
import cookieParser from "cookie-parser"
import Express from "express"
import cors from 'cors'
const app = Express()

import {testConnect} from "./database.js"

const allowedOrigins = (
  process.env.URLFRONT ||
  (process.env.NODE_ENV !== "production"
    ? "http://localhost:5173,http://127.0.0.1:5173"
    : "")
)
  .split(",")
  .map(origin => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // Permite requisições sem Origin
    // (Postman, Insomnia, monitoramento, etc.)
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(
      new Error(`CORS: origem não permitida (${normalizedOrigin})`)
    );
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With"
  ]
}));

app.use(helmet())

app.use(Express.json({limit:"1mb"}))
app.use(Express.urlencoded({extended:true,limit:"1mb"}))
app.use(cookieParser())

app.use(router)

app.use((err,req,res,next) => {
  console.error("Erro HTTP:", err)
  if (res.headersSent) return next(err)
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600
    ? err.status
    : err.message?.startsWith("CORS:") ? 403 : 500
  const message = status === 413
    ? "Requisição muito grande"
    : status === 400
        ? "Requisição inválida"
        : status === 403
            ? "Origem não autorizada"
            : "Erro no servidor"
  res.status(status).json({response:message})
})

try{
    if (!process.env.SECRET || process.env.SECRET.length < 32) {
        throw new Error("A variável SECRET deve estar configurada com pelo menos 32 caracteres")
    }
    await testConnect()

    app.listen(process.env.PORT || 3000,"0.0.0.0",() => {
        console.log("Servidor Rodando")
    })

}catch(err){
    console.log("Aplicação nao iniciada")
    console.error(err)
    process.exitCode = 1
}
