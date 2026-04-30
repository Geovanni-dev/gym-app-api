// Importa o Nodemailer, biblioteca usada para envio de emails no Node.js
const nodemailer = require("nodemailer");

// Verifica se as variáveis de ambiente de email foram carregadas corretamente
console.log("Email User:", process.env.EMAIL_USER);
console.log("Email Pass carregado?", !!process.env.EMAIL_PASS);

//=========================================Configuração do transporte de email


// Cria o transporter responsável por fazer a comunicação com o servidor de email (agora com brevo e IPv4)
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.BREVO_EMAIL,
    pass: process.env.BREVO_API_KEY,
  },
});


// Função para gerar um código de verificação aleatório
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Gera 6 dígitos
};

/*Função responsável por enviar emails da aplicação, 
tbm pode ser usada para verificação de conta, recuperação de senha, etc etc*/
exports.sendEmail = async (to, subject, text, html) => {
  try {
    // Configura as opções do email a ser enviado
    const finalText = text || "Seu código de verificação do Super Frango";
    const finalHtml = html || finalText;
    const mailOptions = {
      from: `"EQUIPE SUPER FRANGO" <${process.env.BREVO_EMAIL}>`,
      to,
      subject,
      text: finalText,
      html: finalHtml,
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

//====================================== /* FUNÇÃO PARA ENVIAR EMAIL COM CODIGO DE VERIFICAÇÃO DE RECUPERAÇÃO DE SENHA ESTILIZADO, OPCIONAL, MAS VAI SER DO MEU USO PESSOAL O APP ENTÃO TO CAPRICHANDO*/

// Função para enviar email de verificação 
exports.sendVerificationEmail = async (to, code, name) => {
  const html = `
    <!DOCTYPE html>
    <html lang="pt-pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verificação Super Frango</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #000000; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #000000;">
            <tr>
                <td align="center" style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 500px; width: 100%; background-color: #0a0a0a; border-radius: 4px; border-top: 4px solid #ff6600;">
                        <tr>
                            <td style="padding: 40px;">
                                <div style="margin-bottom: 40px;">
                                    <h1 style="color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: 2px; margin: 0; text-transform: uppercase;">SUPER FRANGO</h1>
                                </div>
                                
                                <h2 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Verifique o seu acesso.</h2>
                                
                                <p style="color: #a0a0a0; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0;">
                                    Olá, <strong>${name}</strong>. Use o código abaixo para validar a sua sessão. Este código expira em 5 minutos.
                                </p>
                                
                                <div style="background-color: #141414; padding: 24px; text-align: center; border: 1px solid #222222; margin-bottom: 24px;">
                                    <span style="font-size: 32px; font-weight: 900; font-style: italic; letter-spacing: 8px; color: #ff6600;">
                                        ${code}
                                    </span>
                                </div>
                                
                                <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #222222;">
                                    <p style="font-size: 11px; color: #666666; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                                        Equipe Super Frango. Não responda a este e-mail.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;

  const text = `Olá ${name}. Seu código de verificação é: ${code}`;

  await exports.sendEmail(to, "Verifique seu acesso - Super Frango", text, html);
};

// Função para redefinição de senha
exports.sendPasswordResetEmail = async (to, code, name) => {
  const html = `
    <!DOCTYPE html>
    <html lang="pt-pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de Senha - Super Frango</title>
    </head>
    <body style="margin: 0; padding: 20px; background-color: #000000; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #000000;">
            <tr>
                <td align="center" style="padding: 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 500px; width: 100%; background-color: #0a0a0a; border-radius: 4px; border-top: 4px solid #ff6600;">
                        <tr>
                            <td style="padding: 40px;">
                                <div style="margin-bottom: 40px;">
                                    <h1 style="color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: 2px; margin: 0; text-transform: uppercase;">SUPER FRANGO</h1>
                                </div>
                                
                                <h2 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">Recuperação de senha</h2>
                                
                                <p style="color: #a0a0a0; font-size: 16px; line-height: 1.5; margin: 0 0 32px 0;">
                                    Olá, <strong>${name}</strong>. Use o código abaixo para redefinir sua senha. Este código expira em 5 minutos.
                                </p>
                                
                                <div style="background-color: #141414; padding: 24px; text-align: center; border: 1px solid #222222; margin-bottom: 24px;">
                                    <span style="font-size: 32px; font-weight: 900; font-style: italic; letter-spacing: 8px; color: #ff6600;">
                                        ${code}
                                    </span>
                                </div>
                                
                                <div style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #222222;">
                                    <p style="font-size: 11px; color: #666666; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                                        Equipe Super Frango. Não responda a este e-mail.
                                    </p>
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
  `;

  const text = `Olá ${name}. Seu código de recuperação de senha é: ${code}`;

  await exports.sendEmail(to, "Recuperação de senha - Super Frango", text, html);
};
// 
module.exports = { // Exporta as funções para serem usadas em outros arquivos
  sendEmail: exports.sendEmail, 
  generateVerificationCode, 
  sendVerificationEmail: exports.sendVerificationEmail,
  sendPasswordResetEmail: exports.sendPasswordResetEmail,
};