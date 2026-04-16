// Carrega variáveis de ambiente do arquivo .env
require("dotenv").config();

// Importa bibliotecas principais da aplicação
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const path = require("path");

// Cria a aplicação Express
const app = express();

// Configura os middlewares basicos 
app.use(cors());
app.use(express.json());  

// Configura o middleware para servir arquivos estaticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Importação das rotas das APIs
const userRoutes = require("./src/users/routes/userRoutes");
const workoutRoutes = require("./src/workouts/routes/workoutsRoutes");
const exerciseRoutes = require("./src/exercises/routes/exerciseRoutes");
const workoutPlanRoutes = require("./src/workoutPlans/routes/workoutPlanRoutes");


//============================= REGISTRO DAS ROTAS


// Rotas relacionadas aos planos de treino
app.use("/workout-plans", workoutPlanRoutes);

// Rotas de exercícios personalizados
app.use("/exercises", exerciseRoutes);

// Rotas de usuários (login, registro, recuperação de senha, up de fts de perfil, etc)
app.use("/users", userRoutes);

// Rotas de treinos e histórico
app.use("/workouts", workoutRoutes);



//================================ INICIALIZAÇÃO DO SERVIDOR

const PORT = process.env.PORT 

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});


// CONEXÃO COM O MONGODB

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
