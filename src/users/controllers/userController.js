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
const cloudinary = require('../../configs/cloudinary');

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

// schema para verificçao de email
const verifyEmailSchema = z.object({
  email: z.string().email("Email inválido"),
  code: z.string().length(6, "O código de verificação deve conter exatamente 6 caracteres")
});

// schema para recuperação de senha (publico)
const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido")
});

// schema para redefinição de senha (publico)
const resetPasswordSchema = z.object({
  code: z.string().length(6, "O código de redefinição deve conter exatamente 6 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve conter pelo menos 6 caracteres")
});

// schema para redefinição de senha (logado)
const updatePasswordSchema = z.object({
  oldPassword: z.string().min(6, "A senha atual deve conter pelo menos 6 caracteres"),
  newPassword: z.string().min(6, "A nova senha deve conter pelo menos 6 caracteres")
});




//====================================================controllers de usuário




// REGISTRO DE USUÁRIO
exports.registerUser = async (req, res) => {
  try {
   const { name, email, password } = registerSchema.parse(req.body);  // Valida os dados recebidos
    const userExists = await User.findOne({ email }); // Verifica se o email ja existe no banco de dados
    if (userExists) { // Se o email já estiver cadastrado, retorna um erro
      return res.status(400).json({
        message: "Email já cadastrado"
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Criptografia da senha utilizando bcrypt com um salt de 10 rounds
    const verificationCode = emailService.generateVerificationCode(); // Gera um código de verificação 
    const newUser = new User({ // Cria um novo usuário com os dados fornecidos e o código de verificação gerado
  name,
  email,
  password: hashedPassword,
  verificationCode,
  isVerified: false
});
      await newUser.save();
    try { // coloquei um try/catch para tratar erros de envio de email separadamente
      await emailService.sendVerificationEmail( // Envia um email de verificação estilizado
        email,
        verificationCode,
        newUser.name // nome do novo usuario ainda não verificado
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

// VERIFICAÇÃO DE CODIGO DE VERIFICAÇÃO PELO EMAIL
exports.verifyEmail = async (req, res) => {
try {
    const { email, code } = verifyEmailSchema.parse(req.body); // Valida os dados recebidos
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
      const newCode = emailService.generateVerificationCode();
      user.verificationCode = newCode;
      await user.save();
      try { // coloquei um try/catch para tratar erros de envio de email separadamente
        await emailService.sendVerificationEmail(email, newCode, user.name);
      } catch (emailError) {
        console.log("Erro ao enviar email:", emailError);
      }
      return res.status(403).json({
        message: "Email ainda não verificado. Verifique seu email.",
        notVerified: true,
        email: user.email
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
      { expiresIn: "365d" } // token válido por 1 ano
    );
    res.json({ // Retorna o token e os dados do usuário logado
      message: "Login realizado com sucesso",
      token, 
      user: {
        name: user.name,
        email: user.email,
        profileImg: user.profileImg
      }
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



// SOLICITAÇÃO DE RECUPERAÇÃO DE SENHA PUBLICO
exports.forgotPassword = async (req, res) => {
  try {
    const{ email } = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email }); // Busca o usuário pelo email fornecido
    if (!user) { // Se o usuário nao for encontrado, retorna um erro
      return res.status(200).json({
        message: "Se o email estiver cadastrado, um codigo de recuperação será enviado."
      });
    }
    
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // Gera um código de recuperação aleatório
    user.resetPasswordCode = resetCode; // Armazena o código de recuperação no banco de dados
    user.resetPasswordExpires = Date.now() +  300000; // tempo de redefiniçao de 5 minutos
    await user.save();
    
    try { // coloquei um try/catch para tratar erros de envio de email separadamente
    await emailService.sendPasswordResetEmail(email, resetCode, user.name);// Envia o email de recuperação de senha utilizando o serviço de email(estilizado)
    } catch (emailError) {
      console.log("Erro ao enviar email de recuperação:", emailError);
    }
    res.json({
      message: "Código de recuperação enviado para seu email"
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

// REDEFINIÇÃO DE SENHA PUBLICO
exports.resetPassword = async (req, res) => {
  try {
    
    const { password,email, code} = resetPasswordSchema.parse(req.body); // Validação dos dados recebidos e extração da senha 
    const user = await User.findOne({  // busca o usuário pelo email fornecido e codigo de recuperação nao expirado
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        message: "Usuário não encontrado ou código inválido ou expirado"
      });
    }
      const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) { // Verifica se a nova senha eh igual a senha atual
      return res.status(400).json({
        message: "A nova senha deve ser diferente da senha atual"
      });
    } 
    const hashedPassword = await bcrypt.hash(password, 10); // Criptografa a nova senha
    user.password = hashedPassword; // Atualiza a senha do usuário
    user.resetPasswordCode = null;// Remove o token de recuperação de senha após o uso
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


// redefiniçao de senha logado
exports.updatePassword = async (req, res) => {
  try {
      const { oldPassword, newPassword } = updatePasswordSchema.parse(req.body); // Validação dos dados recebidos e extração da senha 
      const user = await User.findById(req.user.id); // Busca usuário com token válido e n expirado (1hr)
      
      if (!user) { // Adicionado: Garantia que o usuário logado existe no banco
        return res.status(404).json({
          message: "Usuário não encontrado"
        });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password); // Compara a senha fornecida com a senha armazenada no banco de dados utilizando bcrypt
      if (!isMatch) {
        return res.status(401).json({
          message: "Senha antiga incorreta"
        });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10); // Criptografa a nova senha
      user.password = hashedPassword; // Atualiza a senha do usuário
      await user.save();
      res.json({
        message: "Senha redefinida com sucesso"
      });
  } catch (error) {
       if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", detalhes: error.flatten().fieldErrors });
        }
        console.log(error); // se n for do zod
        res.status(500).json({ error: "Erro ao redefinir senha" });
    }
};


// ADICIONAR IMG AO PERFIL
exports.addToImg = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Nenhuma imagem fornecida"
      });
    }
    // upload pra Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "profile_images" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(req.file.buffer);
    });

    const imageUrl = uploadResult.secure_url;

      const user = await User.findByIdAndUpdate(req.user.id,
        { profileImg: imageUrl}, // Atualiza o campo profileImg com a URL da imagem
        { new: true } // Retorna o documento atualizado
      );
      if (!user) {
        return res.status(404).json({
          message: "Usuário não encontrado"
        });
      }
      res.json({
        message: "Imagem adicionada ao perfil com sucesso",
        profileImg: user.profileImg
      });
 } catch (error) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({ error: "Erro de validação", detalhes: error.flatten().fieldErrors });
  }
  
  console.log("=== ERRO NO UPLOAD ===");
  console.log("Mensagem:", error.message);
  console.log("Stack:", error.stack);
  

  if (error.http_code) {
    console.log("Cloudinary HTTP Code:", error.http_code);
    console.log("Cloudinary Error:", error.message);
  }
  
  res.status(500).json({ 
    error: "Erro ao adicionar imagem ao perfil",
    details: error.message  // ← envia o erro para o frontend também
  });
}
};