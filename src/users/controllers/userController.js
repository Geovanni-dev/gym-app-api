const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { z } = require('zod');
const emailService = require('../../services/emailService');
const cloudinary = require('../../configs/cloudinary');
const SECRET = process.env.JWT_SECRET;
const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve conter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve conter pelo menos 6 caracteres'),
});
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve conter pelo menos 6 caracteres'),
});
const verifyEmailSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z
    .string()
    .length(6, 'O código de verificação deve conter exatamente 6 caracteres'),
});

// schema para recuperação de senha (publico)
const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

// schema para redefinição de senha (publico)
const resetPasswordSchema = z.object({
  code: z
    .string()
    .length(6, 'O código de redefinição deve conter exatamente 6 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve conter pelo menos 6 caracteres'),
});

// schema para redefinição de senha (logado)
const updatePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(6, 'A senha atual deve conter pelo menos 6 caracteres'),
  newPassword: z
    .string()
    .min(6, 'A nova senha deve conter pelo menos 6 caracteres'),
});
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: 'Email já cadastrado',
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = emailService.generateVerificationCode();
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      verificationCode,
      isVerified: false,
    });
    await newUser.save();
    try {
      await emailService.sendVerificationEmail(
        email,
        verificationCode,
        newUser.name,
      );
    } catch (emailError) {
      console.log('Erro ao enviar email:', emailError);
    }
    res.json({
      message: 'Usuário criado com sucesso. Verifique seu email.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    res.status(500).json({ error: 'Erro ao criar o usuario' });
  }
};
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = verifyEmailSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
      });
    }
    if (user.verificationCode !== code) {
      return res.status(400).json({
        message: 'Código inválido',
      });
    }
    user.isVerified = true;
    user.verificationCode = null;
    await user.save();
    const token = jwt.sign(
      { id: user._id },
      SECRET,
      { expiresIn: '365d' }, // token válido por 1 ano
    );
    res.json({
      message: 'Email verificado com sucesso, bem-vindo!',
      token,
      user: {
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    res.status(500).json({ error: 'Erro ao verificar o email' });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Email ou senha inválidos',
      });
    }
    if (!user.isVerified) {
      const newCode = emailService.generateVerificationCode();
      user.verificationCode = newCode;
      await user.save();
      try {
        await emailService.sendVerificationEmail(email, newCode, user.name);
      } catch (emailError) {
        console.log('Erro ao enviar email:', emailError);
      }
      return res.status(403).json({
        message: 'Email ainda não verificado. Verifique seu email.',
        notVerified: true,
        email: user.email,
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Email ou senha inválidos',
      });
    }
    const token = jwt.sign(
      { id: user._id },
      SECRET,
      { expiresIn: '365d' }, // token válido por 1 ano
    );
    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: {
        name: user.name,
        email: user.email,
        profileImg: user.profileImg,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    res.status(500).json({ error: 'Erro ao realizar o login' });
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        message:
          'Se o email estiver cadastrado, um codigo de recuperação será enviado.',
      });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 300000; // tempo de redefiniçao de 5 minutos
    await user.save();

    try {
      await emailService.sendPasswordResetEmail(email, resetCode, user.name);
    } catch (emailError) {
      console.log('Erro ao enviar email de recuperação:', emailError);
    }
    res.json({
      message: 'Código de recuperação enviado para seu email',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    res.status(500).json({ error: 'Erro ao recuperar senha' });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { password, email, code } = resetPasswordSchema.parse(req.body);
    const user = await User.findOne({
      // busca o usuário pelo email fornecido e codigo de recuperação nao expirado
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: 'Usuário não encontrado ou código inválido ou expirado',
      });
    }
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: 'A nova senha deve ser diferente da senha atual',
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.json({
      message: 'Senha redefinida com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
};
exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = updatePasswordSchema.parse(req.body);
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Senha antiga incorreta',
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.json({
      message: 'Senha redefinida com sucesso',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    res.status(500).json({ error: 'Erro ao redefinir senha' });
  }
};
exports.addToImg = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'Nenhuma imagem fornecida',
      });
    }
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'profile_images' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      stream.end(req.file.buffer);
    });

    const imageUrl = uploadResult.secure_url;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImg: imageUrl },
      { new: true },
    );
    if (!user) {
      return res.status(404).json({
        message: 'Usuário não encontrado',
      });
    }
    res.json({
      message: 'Imagem adicionada ao perfil com sucesso',
      profileImg: user.profileImg,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log('=== ERRO NO UPLOAD ===');
    console.log('Mensagem:', error.message);
    console.log('Stack:', error.stack);

    if (error.http_code) {
      console.log('Cloudinary HTTP Code:', error.http_code);
      console.log('Cloudinary Error:', error.message);
    }

    res.status(500).json({
      error: 'Erro ao adicionar imagem ao perfil',
      details: error.message,
    });
  }
};
