const dns = require('dns');
/* IPv4 primeiro e DNS público: em alguns ambientes a resolução via IPv6
falha ao conectar no Atlas. */
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log('Atlas conectado');
  })
  .catch((err) => {
    console.log('Erro ao conectar no MongoDB:', err);
  });

process.on('unhandledRejection', (error) => {
  console.error('Erro não tratado:', error);
});
