const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: 'Token não fornecido',
    });
  }

  // O header vem como "Bearer TOKEN"
  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({
      message: 'Token inválido',
    });
  }
};

module.exports = authMiddleware;
