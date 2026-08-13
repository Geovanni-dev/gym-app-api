const WorkoutHistory = require('../../models/WorkoutHistory');
const { z } = require('zod');
const getExerciseHistorySchema = z.object({
  exerciseName: z
    .string()
    .min(1, 'O nome do exercício é obrigatório')
    .transform((val) => decodeURIComponent(val)),
});

//schema para deletar historico completo do usuário (opcional, não implementado ainda)
const deleteWorkoutHistorySchema = z.object({
  confirm: z.literal('CONFIRM').refine((val) => val === 'CONFIRM', {
    message: "Você deve digitar 'CONFIRM' para deletar seu histórico completo.",
  }),
});
exports.getWorkoutHistory = async (req, res) => {
  try {
    const workouts = await WorkoutHistory.find({ user: req.user.id })
      .sort({
        date: -1,
        _id: -1,
      })
      .limit(20);
    res.json(workouts);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico' });
  }
};
exports.getExerciseHistory = async (req, res) => {
  try {
    const { exerciseName } = getExerciseHistorySchema.parse(req.params);

    const history = await WorkoutHistory.find({
      user: req.user.id,
      // Usando RegExp com "i" para a busca não ser sensível a maiúsculas/minúsculas
      exerciseName: new RegExp(`^${exerciseName}$`, 'i'),
    }).sort({ date: -1 });

    res.json(history);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return res
      .status(500)
      .json({ error: 'Erro ao buscar histórico de exercícios' });
  }
};
exports.deleteWorkoutHistory = async (req, res) => {
  try {
    deleteWorkoutHistorySchema.parse(req.body);
    await WorkoutHistory.deleteMany({ user: req.user.id });
    res.json({ message: 'Histórico de exercícios deletado com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return res
      .status(500)
      .json({ error: 'Erro ao deletar histórico de exercícios' });
  }
};
