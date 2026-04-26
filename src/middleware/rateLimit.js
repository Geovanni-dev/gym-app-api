const rateLimit = require("express-rate-limit");  // importa a biblioteca express-rate-limit


const blockedIps = {}; // cria um objeto para armazenar os IPs bloqueados

// cria limite de reqs para usar em rotas globais
exports.globalLimiter = rateLimit({ 
    windowMs: 60 * 1000, // 1 minuto
    max: 100, // Limite de solicitações por minuto
    
    handler: (req, res) => {// Função pra lidar com o bloqueio
    const ip = req.ip;
    const now = Date.now();
    // Verifica se o IP foi bloqueado
    if (blockedIps[ip] && now < blockedIps[ip]) {
        const secondsLeft = Math.ceil((blockedIps[ip] - now) / 1000);
        return res.status(429).json({
            error: "Ainda bloqueado. Por favor, tente novamente mais tarde."
        });
        
    }
    // Bloqueia o IP se ele tiver mais de 100 reqs em 1 minuto
    blockedIps[ip] = now + 60 * 1000;

        return res.status(429).json({
            error: "Muitas solicitações. Por favor, tente novamente mais tarde."
        });
        
    }
});

// cria limite de reqs para usar em rotas de login, register, etc
exports.loginLimiter = rateLimit({ 
    windowMs: 60 * 1000, // 1 minuto
    max: 5, // Limite de solicitações por minuto

    handler: (req, res) => {  // Função pra lidar com o bloqueio
    const ip = req.ip;
    const now = Date.now();
    // Verifica se o IP foi bloqueado
    if (blockedIps[ip] && now < blockedIps[ip]) { 
        const secondsLeft = Math.ceil((blockedIps[ip] - now) / 1000);
        return res.status(429).json({
            error: "Ainda bloqueado. Por favor, tente novamente mais tarde."
        });
        
    }
    // Bloqueia o IP se ele tiver mais de 5 reqs em 1 minuto
    blockedIps[ip] = now + 60 * 1000;
        // Retorna uma resposta de erro
        return res.status(429).json({
            error: "Muitas solicitações. Por favor, tente novamente mais tarde."
        });
        
    }
});
