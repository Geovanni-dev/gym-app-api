const dns = require('dns'); // Importa o módulo DNS para configurar os servidores DNS
dns.setServers(['8.8.8.8', '1.1.1.1']); // Define servidores DNS do Google e Cloudflare
dns.setDefaultResultOrder('ipv4first'); // define a ordem de resolução para priorizar IPv4, o que pode ajudar a evitar problemas de conexão em ambientes onde IPv6 não é totalmente suportado

//importa o mongoose
const mongoose = require("mongoose");
// importa o app reponsavel pelas rotas e configurações
const app = require("./app");

//================================ INICIALIZAÇÃO DO SERVIDOR

const PORT = process.env.PORT 

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

//=======================CONEXÃO COM O MONGODB

// Conecta ao MongoDB usando a URL definida no .env
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    // confirmação de conexão bem-sucedida com o MongoDB
    console.log("Atlas conectado");
  })
  .catch((err) => {
    // erro caso a conexão com o banco falhe
    console.log("Erro ao conectar no MongoDB:", err);
  });

// Tratamento de erros não capturados
process.on("unhandledRejection", (error) => {
  console.error("Erro não tratado:", error);
});
