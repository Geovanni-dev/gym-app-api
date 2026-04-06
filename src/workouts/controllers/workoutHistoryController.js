// Model responsável por armazenar o histórico de execuções de exercícios
const Workout = require("../../models/WorkoutHistory");
const { z } = require("zod");// importa o zod

//===============================validação de dados com zod

// schema para validar a consulta do historico de um exercicio especifico
const getExerciseHistorySchema = z.object({
  exerciseName: z.string().min(1, "O nome do exercício é obrigatório").transform((val) => decodeURIComponent(val)) // decodifica o nome do exercício
});


//============================= histórico de treinos e exercícios



// HISTÓRICO DE TREINOS
exports.getWorkoutHistory = async (req, res) => {
  try {

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

// HISTÓRICO DE UM EXERCÍCIO (validado com zod)
exports.getExerciseHistory = async (req, res) => {
  try {
    const { exerciseName } = getExerciseHistorySchema.parse(req.params); // validação com zod

    const history = await Workout.find({  // busca pelo nome do exercício e usuário
      user: req.user.id,
      // Usando RegExp com "i" para a busca não ser sensível a maiúsculas/minúsculas
      exerciseName: new RegExp(`^${exerciseName}$`, "i"), 
    }).sort({ date: -1 });  //mantido date que é o campo correto

    res.json(history);
  } catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
      return res.status(400).json({ 
        error: "Erro de validação", 
        detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
      });
    }
    console.log(error); // se n for do zod
    return res.status(500).json({ error: "Erro ao buscar histórico de exercícios" });
  }
};