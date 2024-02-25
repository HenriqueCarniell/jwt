const { verify } = require('jsonwebtoken');
const authConfig = require('../auth');

let ensureAuthenticated = (req,res,next) => {
    const authHeader = req.headers.authorization;

    if(!authHeader) {
        return res.json({msg: "Token inválido"});
    }

    const [, token] = authHeader.split(" ")

    try {
       const {sub: idusuario} = verify(token, authConfig.jwt.secret)
    
       req.user = {
        id: Number(idusuario)
       }

       return next();
    } catch {
        return res.json({error: "JWT Token não informado"});
    }
}

module.exports = ensureAuthenticated;
