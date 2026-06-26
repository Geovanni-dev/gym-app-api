// Biblioteca usada para gerar e validar tokens JWT
const jwt = require('jsonwebtoken');

// Chave secreta utilizada para assinar e validar os tokens
const SECRET = process.env.JWT_SECRET;

// Middleware responsável por verificar se é um usuário autenticado
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization; // O token geralmente vem no header Authorization
  if (!authHeader) {
    // Se não houver token na requisição o acesso é negado
    return res.status(401).json({
      message: 'Token não fornecido',
    });
  }
  const token =
    authHeader.split(' ')[1]; /* O header normalmente vem no formato:
    "Bearer TOKEN_AQUI" então separei o token da palavra "Bearer" com um espaço*/
  try {
    const decoded = jwt.verify(token, SECRET); // Verifica se o token é válido usando a chave secreta
    req.user = decoded; /* Salva os dados do usuário dentro da requisição,
     assim outras partes da aplicação conseguem acessar */
    next(); // Passa o controle para o próximo middleware ou controller
  } catch (error) {
    return res.status(401).json({
      // Se o token estiver inválido ou expirado a requisição vai ser bloqueada
      message: 'Token inválido',
    });
  }
};

// Exporta o middleware para ser usado nas rotas protegidas
module.exports = authMiddleware;
