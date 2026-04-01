// Importação do modelo de usuário responsável por interagir com o banco de dados
const User = require("../../models/User");

// Biblioteca utilizada para gerar e validar tokens de autenticação (JWT)
const jwt = require("jsonwebtoken");

// Biblioteca para criptografia segura das senhas
const bcrypt = require("bcrypt");

const { z } = require("zod"); // Biblioteca para validação de dados (opcional, mas recomendado para garantir a integridade dos dados recebidos)

// Módulo nativo do Node.js utilizado para gerar tokens seguros
const crypto = require("crypto");

// Serviço responsável pelo envio de emails (verificação e recuperação de senha)
const emailService = require("../../services/emailService");

// Chave secreta utilizada para assinar os tokens JWT
const SECRET = process.env.JWT_SECRET;


//==================================================schemas de validação de dados


// Schema de validação de dados utilizando a biblioteca Zod
const registerSchema = z.object({
  name: z.string().min(2, "O nome deve conter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve conter pelo menos 6 caracteres")
});

// Schema de validação para o login, garantindo que o email seja válido e a senha tenha um comprimento mínimo de 6 caracteres
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve conter pelo menos 6 caracteres")
});

// Schema de validação para a listagem de usuários
const userSchema = z.object({
_id: z.any(),
name: z.string(),
email: z.string().email(),
isVerified: z.boolean()
});
const listUsersSchema = z.array(userSchema);

// schema para verificçao de email
const verifyEmailSchema = z.object({
  email: z.string().email("Email inválido"),
  code: z.string().length(6, "O código de verificação deve conter exatamente 6 caracteres")
});

// schema para recuperação de senha
const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido")
});

// schema para redefinição de senha
const resetPasswordSchema = z.object({
  password: z.string().min(6, "A senha deve conter pelo menos 6 caracteres")
});




//====================================================controllers de usuário




// REGISTRO DE USUÁRIO
exports.registerUser = async (req, res) => {
  try {
    const validatUser = registerSchema.parse(req.body); // Validação dos dados recebidos
    const { name, email, password } = validatUser;
    const userExists = await User.findOne({ email }); // Verifica se o email ja existe no banco de dados
    if (userExists) { // Se o email já estiver cadastrado, retorna um erro
      return res.status(400).json({
        message: "Email já cadastrado"
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Criptografia da senha utilizando bcrypt com um salt de 10 rounds
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Código de verificação gerado aleatoriamente
    const newUser = new User({
      ...validatUser,
      password: hashedPassword,
      verificationCode,
      isVerified: false // usuário so podera logar após confirmar o codigo
    });
      await newUser.save();
    try { // Envia o email de verificação
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
       if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: "Erro ao criar o usuario" });
    }
};



// LOGIN DO USUÁRIO.
exports.loginUser = async (req, res) => {
try {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email });
    if (!user) { // Se o email não for encontrado, retorna um erro de autenticação
      return res.status(401).json({
        message: "Email ou senha inválidos"
      });
    }
    if (!user.isVerified) { // Verifica se o email do usuário foi verificado
      return res.status(403).json({
        message: "Verifique seu email antes de fazer login"
      });
    }
    const isMatch = await bcrypt.compare(password, user.password); // Compara a senha fornecida com a senha armazenada no banco de dados utilizando bcrypt
    if (!isMatch) {
      return res.status(401).json({
        message: "Email ou senha inválidos"
      });
    }
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
       if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: "Erro ao realizar o login" });
    }
};



// LISTAR USUÁRIOS.
exports.getUsers = async (req, res) => {
  try {
    // Retorna todos os usuários cadastrados no banco
    const users = await User.find();
    const validateUsers = listUsersSchema.parse(users);
    res.json(validateUsers);
  } catch (error) {
       if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: "Erro ao listar os usuarios" });
    }
};



// VERIFICAÇÃO DE EMAIL.
exports.verifyEmail = async (req, res) => {
try {
    const validatEmail = verifyEmailSchema.parse(req.body);
    const { email, code } = validatEmail;
    const user = await User.findOne({ email }); // Busca o usuário pelo email fornecido 
    if (!user) { // Se o usuário não for encontrado, retorna um erro
      return res.status(404).json({
        message: "Usuário não encontrado"
      });
    }
    if (user.verificationCode !== code) { // Compara o código fornecido com o código armazenado no banco de dados
      return res.status(400).json({
        message: "Código inválido"
      });
    }
      user.isVerified = true; // Marca o usuário como verificado
      user.verificationCode = null; // Remove o código de verificação após o uso
      await user.save();
      res.json({
      message: "Email verificado com sucesso"
    });
} catch (error) {
       if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: "Erro ao verificar o email" });
    }
};



// SOLICITAÇÃO DE RECUPERAÇÃO DE SENHA.
exports.forgotPassword = async (req, res) => {
  try {
    const validatEmail = forgotPasswordSchema.parse(req.body);
    const { email } = validatEmail;
    const user = await User.findOne({ email }); // Busca o usuário pelo email fornecido
    if (!user) { // Se o usuário nao for encontrado, retorna um erro
      return res.status(200).json({
        message: "Se o email estiver cadastrado, um link de recuperação será enviado."
      });
    }
    const resetToken = crypto.randomBytes(32).toString("hex"); // Gera um token aleatório para recuperação de senha utilizando o módulo crypto do Node.js
    user.resetPasswordToken = resetToken; // Armazena token ---- tempo de expiração 1hr
    user.resetPasswordExpires = Date.now() + 3600000; 
    await user.save(); // Salva as informações do token e tempo de expiração no banco de dados
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`; // Link de recuperação de senha que será enviado por email, contendo o token gerado
    try { // Envia o email de recuperação de senha utilizando o serviço de email
    await emailService.sendEmail( // Envia o email de recuperação de senha utilizando o serviço de email
      email,
      "Recuperação de senha",
      `Clique no link para redefinir sua senha: ${resetLink}`
    );
    } catch (emailError) {
      console.log("Erro ao enviar email de recuperação:", emailError);
    }
    res.json({
      message: "Email de recuperação enviado"
    });
  } catch (error) {
       if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: "Erro ao recuperar senha" });
    }
};



// REDEFINIÇÃO DE SENHA.
exports.resetPassword = async (req, res) => {
  try {
    
    const { password } = resetPasswordSchema.parse(req.body); // Validação dos dados recebidos e extração da senha 
    const { token } = req.params; // Recebe o token de recuperação de senha a partir dos parâmetros da URL
    const user = await User.findOne({ // Busca usuário com token válido e n expirado (1hr)
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Token inválido ou expirado"
      });
    } // Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(password, 10); // Criptografa a nova senha
    user.password = hashedPassword; // Atualiza a senha do usuário
    user.resetPasswordToken = null;// Remove o token de recuperação de senha após o uso
    user.resetPasswordExpires = null;
    await user.save();
    res.json({
      message: "Senha redefinida com sucesso"
    });
  } catch (error) {
       if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: "Erro ao redefinir senha" });
    }
};