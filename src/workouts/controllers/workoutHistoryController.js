// Model responsável por armazenar o histórico de execuções de exercícios
const WorkoutHistory = require("../../models/WorkoutHistory");
const { z } = require("zod"); // importa o zod

//===============================validação de dados com zod

// schema para validar a consulta do historico de um exercicio especifico
const getExerciseHistorySchema = z.object({
  exerciseName: z.string().min(1, "O nome do exercício é obrigatório").transform((val) => decodeURIComponent(val)) // decodifica o nome do exercício
});

//schema para deletar historico completo do usuário (opcional, não implementado ainda)
const deleteWorkoutHistorySchema = z.object({
  confirm: z.literal("CONFIRM").refine(val => val === "CONFIRM", {
    message: "Você deve digitar 'CONFIRM' para deletar seu histórico completo."
  })
});

//============================= histórico de treinos e exercícios

// HISTÓRICO DE TREINOS 
exports.getWorkoutHistory = async (req, res) => {
  try {
    const workouts = await WorkoutHistory.find({ user: req.user.id }).sort({ date: -1, _id: -1 }); // ordena por data e id para garantir a ordem correta
    res.json(workouts);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    res.status(500).json({ message: "Erro ao buscar histórico" });
  }
};

// HISTÓRICO DE UM EXERCÍCIO (validado com zod)
exports.getExerciseHistory = async (req, res) => {
  try {
    const { exerciseName } = getExerciseHistorySchema.parse(req.params); // validação com zod

    const history = await WorkoutHistory.find({  // busca pelo nome do exercício e usuário
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

// DELETAR HISTÓRICO DE UM EXERCÍCIO (validado com zod)
exports.deleteWorkoutHistory = async (req, res) => {
  try {
    const { confirm } = deleteWorkoutHistorySchema.parse(req.body); // validação com zod
    await WorkoutHistory.deleteMany({ user: req.user.id });
    res.json({ message: "Histórico de exercícios deletado com sucesso" });
  } catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
      return res.status(400).json({ error: "Erro de validação", 
          detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
      });
      }
      console.log(error); // se n for do zod
      return res.status(500).json({ error: "Erro ao deletar histórico de exercícios" });
  }
};