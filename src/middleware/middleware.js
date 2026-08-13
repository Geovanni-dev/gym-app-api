const crypto = require('crypto');

function hash(valor) {
  return crypto.createHash('sha256').update(valor).digest();
}

exports.requireApiKey = (req, res, next) => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error('API_KEY não configurada');
    return res.status(503).json({ message: 'Serviço indisponível' });
  }

  const apiKeyHeader = req.headers['x-api-key'];

  if (typeof apiKeyHeader !== 'string' || apiKeyHeader.length === 0) {
    return res.status(401).json({ message: 'Acesso negado' });
  }

  if (!crypto.timingSafeEqual(hash(apiKeyHeader), hash(apiKey))) {
    return res.status(401).json({ message: 'Acesso negado' });
  }

  return next();
};
