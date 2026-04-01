// Model responsável por armazenar o histórico de execuções de exercícios
const Workout = require("../../models/WorkoutHistory");

//============================= histórico de treinos e exercícios

// HISTÓRICO DE TREINOS
exports.getWorkoutHistory = async (req, res) => {
  try {
    // Busca todos os treinos do usuário logado
    const workouts = await Workout.find({
      user: req.user.id,
    }).sort({ date: -1 }); 

    res.json(workouts);
  } catch (error) {
    // erro na consulta
    console.error("Erro ao buscar histórico:", error); // adicionado log
    res.status(500).json({
      message: "Erro ao buscar histórico",
    });
  }
};

// HISTÓRICO DE UM EXERCÍCIO
exports.getExerciseHistory = async (req, res) => {
  try {
    const { exerciseName } = req.params;

    //  Validação básica
    if (!exerciseName) {
      return res.status(400).json({
        message: "Nome do exercício é obrigatório",
      });
    }

    // Tratamento para decodeURIComponent
    let decodedExerciseName;
    try {
      decodedExerciseName = decodeURIComponent(exerciseName);
    } catch (decodeError) {
      return res.status(400).json({
        message: "Nome do exercício inválido",
      });
    }

    // Busca todos os registros do exercício específico do usuário
    const history = await Workout.find({
      user: req.user.id,
      exerciseName: decodedExerciseName,
    }).sort({ date: -1 });  //mantido date que é o campo correto

    res.json(history);
  } catch (error) {
    console.error("Erro ao buscar histórico do exercício:", error); //  adicionado log
    res.status(500).json({
      message: "Erro ao buscar histórico do exercício",
    });
  }
};
