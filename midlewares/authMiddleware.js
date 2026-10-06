import jwt from 'jsonwebtoken'

export const verifyToken = (req,res,next) => {
    const authorization = req.header("Authorization")
    const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
    const cookieToken = req.cookies?.token
    const token = bearerToken || cookieToken

    if(!token) return res.status(401).json({response:"Autenticação necessária"})

    try{

        if (!process.env.SECRET) {
            return res.status(500).json({response:"Autenticação indisponível"})
        }

        if (!bearerToken && cookieToken && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
            const allowedOrigins = (process.env.URLFRONT || "")
                .split(",")
                .map(origin => origin.trim().replace(/\/+$/, ""))
                .filter(Boolean)
            const origin = req.get("Origin")?.replace(/\/+$/, "")

            if (!origin || !allowedOrigins.includes(origin)) {
                return res.status(403).json({response:"Origem não autorizada"})
            }
        }

        const decoded = jwt.verify(token,process.env.SECRET,{algorithms:["HS256"]})
        if (!decoded || typeof decoded !== "object" || decoded.id === undefined || decoded.id === null) {
            return res.status(401).json({response:"Token inválido ou expirado"})
        }
        req.user = decoded
        next()

    }catch(err){

        res.status(401).json({response:"Token inválido ou expirado"})

    }

}