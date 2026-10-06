import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, //10 min
    max:5,
    standardHeaders:true,
    legacyHeaders:false,
    message:{
        message:"Limite de tentativas atingido. Tente novamente em 10 minutos"
    }
})