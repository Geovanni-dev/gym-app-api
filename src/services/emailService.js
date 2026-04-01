// Importa o Nodemailer, biblioteca usada para envio de emails no Node.js
const nodemailer = require("nodemailer");

// Verifica se as variáveis de ambiente de email foram carregadas corretamente
console.log("Email User:", process.env.EMAIL_USER);
console.log("Email Pass carregado?", !!process.env.EMAIL_PASS);

//=========================================Configuração do transporte de email


// Cria o transporter responsável por fazer a comunicação com o servidor de email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // email utilizado para enviar as mensagens
    pass: process.env.EMAIL_PASS, // senha ou app password do email
  },
});

/*Função responsável por enviar emails da aplicação, 
tbm pode ser usada para verificação de conta, recuperação de senha, etc etc*/
exports.sendEmail = async (to, subject, text) => {
  try {
    // Configura as opções do email a ser enviado
    const mailOptions = {
      from: `" Equipe Workout API " <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    };

    const info = await transporter.sendMail(mailOptions); // Envia o email usando o transporter configurado

    console.log("E-mail enviado com sucesso! ID:", info.messageId);
    return info;
  } catch (error) {
    // Em caso de erro, loga o erro e lança a exceção para ser tratada pelo chamador
    console.error("Erro ao enviar e-mail:", error);
    throw error;
  }
};
