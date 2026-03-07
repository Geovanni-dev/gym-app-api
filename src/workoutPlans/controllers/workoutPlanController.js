// Models responsáveis por armazenar os planos de treino e o histórico de execução
const WorkoutPlan = require("../../models/WorkoutPlan");
const WorkoutHistory = require("../../models/WorkoutHistory");



// CRIAR PLANO DE TREINO

exports.createWorkoutPlan = async (req, res) => {

  try {

    // Dados enviados pelo cliente
    const { name, days } = req.body;

    // Cria um novo plano associado ao user logado
    const workoutPlan = new WorkoutPlan({
      user: req.user.id,
      name,
      days
    });

    await workoutPlan.save();

    res.json({
      message: "Plano criado com sucesso",
      workoutPlan
    });

  } catch (error) {

    // erro durante a criação do plano
    res.status(500).json({
      message: "Erro ao criar plano"
    });

  }

};


// BUSCAR PLANOS DO USUÁRIO
exports.getWorkoutPlans = async (req, res) => {

  try {

    // Retorna apenas os planos pertencentes ao usuário autenticado
    const plans = await WorkoutPlan.find({
      user: req.user.id
    });

    res.json(plans);

  } catch (error) {

    res.status(500).json({
      message: "Erro ao buscar planos"
    });

  }

};



// ADICIONAR EXERCÍCIO AO PLANO

exports.addExerciseToPlan = async (req, res) => {

  try {

    const { planId } = req.params;
    const { day, exercise } = req.body;

    // Busca o plano do usuário
    const workoutPlan = await WorkoutPlan.findOne({
      _id: planId,
      user: req.user.id
    });

    if (!workoutPlan) {
      return res.status(404).json({
        message: "Plano não encontrado"
      });
    }

    // Verifica se o dia já existe no plano
    let dayExists = workoutPlan.days.find(d => d.day === day);

    // Se o dia ainda não existir, cria um novo
    if (!dayExists) {
      workoutPlan.days.push({
        day,
        exercises: [exercise]
      });
    } else {
      // se o dia já existir, apenas adiciona o exercício
      dayExists.exercises.push(exercise);
    }

    await workoutPlan.save();

    res.json({
      message: "Exercício adicionado",
      workoutPlan
    });

  } catch (error) {

    res.status(500).json({
      message: "Erro ao adicionar exercício"
    });

  }

};



// ATUALIZAR PESO DO EXERCÍCIO

exports.updateExerciseWeight = async (req, res) => {

  try {

    const { planId, day, exerciseName } = req.params;
    const { weight } = req.body;

    // Busca o plano do usuário
    const workoutPlan = await WorkoutPlan.findOne({
      _id: planId,
      user: req.user.id
    });

    if (!workoutPlan) {
      return res.status(404).json({
        message: "Plano não encontrado"
      });
    }

    // Localiza o dia dentro do plano
    const dayData = workoutPlan.days.find(d => d.day === day);

    if (!dayData) {
      return res.status(404).json({
        message: "Dia não encontrado"
      });
    }

    // Procura o exercício específico dentro do dia
    const exercise = dayData.exercises.find(e => e.name === exerciseName);

    if (!exercise) {
      return res.status(404).json({
        message: "Exercício não encontrado"
      });
    }

    // Atualiza o peso do exercício
    exercise.weight = weight;

    // Se o peso atual for maior que o PR registrado, atualiza o PR
    if (weight > exercise.pr) {
      exercise.pr = weight;
    }

    await workoutPlan.save();

    res.json({
      message: "Peso atualizado",
      exercise
    });

    // Registra essa execução no histórico de treinos
    const history = new WorkoutHistory({
      user: req.user.id,
      plan: workoutPlan._id,
      exerciseName: exercise.name,
      weight: weight,
      reps: exercise.reps
    });

    await history.save();

  } catch (error) {

    res.status(500).json({
      message: "Erro ao atualizar peso"
    });

  }

};