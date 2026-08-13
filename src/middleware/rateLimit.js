const rateLimit = require('express-rate-limit');

const blockedIps = {};

exports.globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,

  handler: (req, res) => {
    const ip = req.ip;
    const now = Date.now();

    if (blockedIps[ip] && now < blockedIps[ip]) {
      const secondsLeft = Math.ceil((blockedIps[ip] - now) / 1000);
      return res.status(429).json({
        error: `Ainda bloqueado. Por favor, tente novamente em ${secondsLeft} segundos.`,
      });
    }

    blockedIps[ip] = now + 5 * 60 * 1000;

    return res.status(429).json({
      error: 'Muitas solicitações. Por favor, tente novamente mais tarde.',
    });
  },
});

exports.loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,

  handler: (req, res) => {
    const ip = req.ip;
    const now = Date.now();

    if (blockedIps[ip] && now < blockedIps[ip]) {
      const secondsLeft = Math.ceil((blockedIps[ip] - now) / 1000);
      return res.status(429).json({
        error: `Ainda bloqueado. Por favor, tente novamente em ${secondsLeft} segundos.`,
      });
    }

    blockedIps[ip] = now + 5 * 60 * 1000;

    return res.status(429).json({
      error: 'Muitas solicitações. Por favor, tente novamente mais tarde.',
    });
  },
});
