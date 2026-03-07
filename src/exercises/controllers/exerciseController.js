
// Modelo responsável pelos exercícios cadastrados no sistema
const Exercise = require("../../models/Exercise");



// CRIAÇÃO DE EXERCÍCIO.
exports.createExercise = async (req, res) => {

  // Dados enviados pelo usuário na requisição
  const { name, muscle } = req.body;

  try {

    /* Cria um novo exercício associado ao user autenticado
     req.user.id vem do middleware de autenticação (JWT)*/
    const exercise = new Exercise({
      user: req.user.id,
      name,
      muscle
    });

    // Salva o exercício no banco
    await exercise.save();

    res.json({
      message: "Exercício criado",
      exercise
    });

  } catch (error) {

    // Caso alguma coisa dê errado durante o processo de criação
    res.status(500).json({
      message: "Erro ao criar exercício"
    });

  }

};




// LISTAR EXERCÍCIOS DO USUÁRIO
exports.getExercises = async (req, res) => {

  try {

    /*Busca só os exercícios pertencentes ao usuário logado.
     Isso evita q um user consiga acessar exercícios de outro*/
    const exercises = await Exercise.find({ user: req.user.id });

    res.json(exercises);

  } catch (error) {

    res.status(500).json({
      message: "Erro ao buscar exercícios"
    });

  }

};



// DELETAR EXERCÍCIO.
exports.deleteExercise = async (req, res) => {

  // ID do exercício enviado pela rota
  const { id } = req.params;

  try {

    // Camada de segurança pra impedir exclusão de dados de outros usuários
    await Exercise.deleteOne({
      _id: id,
      user: req.user.id
    });

    res.json({
      message: "Exercício deletado"
    });

  } catch (error) {

    // erro durante a exclusão
    res.status(500).json({
      message: "Erro ao deletar exercício"
    });

  }

};