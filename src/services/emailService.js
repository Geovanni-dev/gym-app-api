// Importa o Nodemailer, biblioteca usada para envio de emails no Node.js
const nodemailer = require("nodemailer");


// Cria o transporter responsável por fazer a comunicação com o servidor de email
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // email utilizado para enviar as mensagens
    pass: process.env.EMAIL_PASS  // senha ou app password do email
  }
});


/*Função responsável por enviar emails da aplicação, 
 tbm ode ser usada para verificação de conta, recuperação de senha, etc etc*/
exports.sendEmail = async (to, subject, text) => {

  await transporter.sendMail({
    from: process.env.EMAIL_USER, // remetente
    to, // destinatário
    subject, // assunto do email
    text // conteúdo da mensagem
  });

};