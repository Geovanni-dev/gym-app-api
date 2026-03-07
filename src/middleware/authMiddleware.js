// Biblioteca usada para gerar e validar tokens JWT
const jwt = require("jsonwebtoken");

// Chave secreta utilizada para assinar e validar os tokens
const SECRET = "geovani_api_segura";


// Middleware responsável por verificar se é um usuário autenticado
const authMiddleware = (req, res, next) => {

  // O token geralmente vem no header Authorization
  const authHeader = req.headers.authorization;

  // Se não houver token na requisição o acesso é negado
  if (!authHeader) {
    return res.status(401).json({
      message: "Token não fornecido"
    });
  }

  /* O header normalmente vem no formato:
   "Bearer TOKEN_AQUI"
    então temos q separar o token da palavra "Bearer" com um espaço*/
  const token = authHeader.split(" ")[1];

  try {

    // Verifica se o token é válido usando a chave secreta
    const decoded = jwt.verify(token, SECRET);

    /* Salva os dados do usuário dentro da requisição,
     assim outras partes da aplicação conseguem acessar */
    req.user = decoded;

    // Passa o controle para o próximo middleware ou controller
    next();

  } catch (error) {

    // Se o token estiver inválido ou expirado a requisição vai ser bloqueada
    return res.status(401).json({
      message: "Token inválido"
    });

  }

};

// Exporta o middleware para ser usado nas rotas protegidas
module.exports = authMiddleware;