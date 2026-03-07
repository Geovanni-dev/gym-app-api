// Importação do modelo de usuário responsável por interagir com o banco de dados
const User = require("../models/User");

// Biblioteca utilizada para gerar e validar tokens de autenticação (JWT)
const jwt = require("jsonwebtoken");

// Biblioteca para criptografia segura das senhas
const bcrypt = require("bcrypt");

// Módulo nativo do Node.js utilizado para gerar tokens seguros
const crypto = require("crypto");

// Serviço responsável pelo envio de emails (verificação e recuperação de senha)
const emailService = require("../services/emailService");

// Chave secreta utilizada para assinar os tokens JWT
const SECRET = process.env.JWT_SECRET;



// REGISTRO DE USUÁRIO
exports.registerUser = async (req, res) => {

  // Dados enviados pelo cliente no corpo da requisição
  const { name, email, password } = req.body;

  try {

    // Verifica se já existe um usuário cadastrado com o mesmo email
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "Email já cadastrado"
      });
    }

    /* Criptografa a senha antes de armazenar no banco
     O número 10 representa o salt rounds utilizado pelo bcrypt */
    const hashedPassword = await bcrypt.hash(password, 10);

    // Geração de um código numérico de verificação (6 dígitos)
    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    // Criação do novo usuário no banco de dados
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      isVerified: false // usuário so podera logar após confirmar o email
    });

    await newUser.save();

    // Envio do código de verificação para o email do user
    try {
      await emailService.sendEmail(
        email,
        "Código de verificação",
        `Seu código é: ${verificationCode}`
      );
    } catch (emailError) {
      console.log("Erro ao enviar email:", emailError);
    }

    res.json({
      message: "Usuário criado com sucesso. Verifique seu email."
    });

  } catch (error) {

    // Erro durante o processo de cadastro
    console.log(error);

    res.status(500).json({
      message: "Erro ao criar usuário"
    });

  }

};



// LOGIN DO USUÁRIO.
exports.loginUser = async (req, res) => {

  const { email, password } = req.body;

  try {

    // Busca o usuário pelo email informado
    const user = await User.findOne({ email });

    // Caso não exista usuário com esse email
    if (!user) {
      return res.status(401).json({
        message: "Email ou senha inválidos"
      });
    }

    // Impede login caso o email ainda n tenha sido verificado
    if (!user.isVerified) {
      return res.status(403).json({
        message: "Verifique seu email antes de fazer login"
      });
    }

    // Compara a senha enviada com a senha criptografada no banco
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Email ou senha inválidos"
      });
    }

    // Geração do token JWT contendo o ID do usuário
    const token = jwt.sign(
      { id: user._id },
      SECRET,
      { expiresIn: "1h" } // token válido por 1 hora
    );

    res.json({
      message: "Login realizado com sucesso",
      token
    });

  } catch (error) {

    res.status(500).json({
      message: "Erro no login"
    });

  }

};



// LISTAR USUÁRIOS.
exports.getUsers = async (req, res) => {

  try {

    // Retorna todos os usuários cadastrados no banco
    const users = await User.find();

    res.json(users);

  } catch (error) {

    res.status(500).json({
      message: "Erro ao buscar usuários"
    });

  }

};




// VERIFICAÇÃO DE EMAIL.
exports.verifyEmail = async (req, res) => {

  const { email, code } = req.body;

  try {

    // Busca um usuário q corresponde ao email informado
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado"
      });
    }

    // Verifica se o código enviado é o mesmo código salvo na memória
    if (user.verificationCode !== code) {
      return res.status(400).json({
        message: "Código inválido"
      });
    }

    // Marca o usuário como verificado
    user.isVerified = true;

    // Remove o código de verificação dps do uso
    user.verificationCode = null;

    await user.save();

    res.json({
      message: "Email verificado com sucesso"
    });

  } catch (error) {

    res.status(500).json({
      message: "Erro ao verificar email"
    });

  }

};



// SOLICITAÇÃO DE RECUPERAÇÃO DE SENHA.
exports.forgotPassword = async (req, res) => {

  const { email } = req.body;

  try {

    // Busca o usuário pelo email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado"
      });
    }

    // Gera um token seguro para redefinição da senha
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Armazena token ---- tempo de expiração 1hr
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    // Link que será enviado ao user para redefinir a senha
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    await emailService.sendEmail(
      email,
      "Recuperação de senha",
      `Clique no link para redefinir sua senha: ${resetLink}`
    );

    res.json({
      message: "Email de recuperação enviado"
    });

  } catch (error) {

    res.status(500).json({
      message: "Erro ao solicitar recuperação de senha"
    });

  }

};



// REDEFINIÇÃO DE SENHA.
exports.resetPassword = async (req, res) => {

  const { token } = req.params;
  const { password } = req.body;

  try {

    // Busca usuário com token válido e n expirado (1hr)
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Token inválido ou expirado"
      });
    }

    // Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualiza a senha do usuário
    user.password = hashedPassword;

    // Remove token dps do uso
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.json({
      message: "Senha redefinida com sucesso"
    });

  } catch (error) {

    res.status(500).json({
      message: "Erro ao redefinir senha"
    });

  }

};