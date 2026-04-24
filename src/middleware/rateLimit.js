const rateLimit = require("express-rate-limit");  // importa a biblioteca express-rate-limit

exports.globalLimiter = rateLimit({ // cria limite de reqs para usar em rotas globais
    windowMs: 60 * 1000, // 1 minuto
    max: 100, // Limite de solicitações por minuto
   
    handler: (req, res) => {
        return res.status(429).json({
            error: "Muitas solicitações. Por favor, tente novamente mais tarde."
        });
        
    }
    /*skip: (req, res) => {
        return req.path === "/login" ||
               req.path === "/register" ||
               req.path === "/forgot-password" ||
               req.path === "/reset-password" ||          //===== nao irei usar o skip por enquanto, vou aplicar globalmente e
               req.path === "/verify-email" ||            //===== nas rotas sensiveis uso o localLimiter
               req.path === "/upload-profile-image" ||
               req.path === "/update-password";
    }*/        
});

exports.loginLimiter = rateLimit({ // cria limite de reqs para usar em rotas de login, register, etc
    windowMs: 60 * 1000, // 1 minuto
    max: 5, // Limite de solicitações por minuto
    handler: (req, res) => {
        return res.status(429).json({
            error: "Muitas solicitações. Por favor, tente novamente mais tarde."
        });
    }
});

