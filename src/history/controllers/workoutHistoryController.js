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

const setSchema = z.object({
  reps: z.coerce.number().min(0, 'Reps deve ser um número positivo'),
  weight: z.number().min(0, 'Weight deve ser um número positivo'),
});

const exerciseSchema = z.object({
  name: z.string().min(1, 'O nome do exercício é obrigatório'),
  sets: z.array(setSchema).optional(),
  reps: z.coerce.number().optional(),
  weight: z.number().optional(),
  workoutName: z.string().optional().nullable(),
});

const logWorkoutSchema = z.object({
  exercises: z
    .array(exerciseSchema)
    .min(1, 'É necessário enviar pelo menos um exercício'),
});

const getPRSchema = z.object({
  exercise: z
    .string()
    .min(1, 'O nome do exercício é obrigatório')
    .transform((val) => decodeURIComponent(val)),
});

// -----------------------------

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

exports.logWorkout = async (req, res) => {
  try {
    const { exercises } = logWorkoutSchema.parse(req.body);
    const savedExercises = [];

    for (const exercise of exercises) {
      // Se o exercício tem múltiplas séries, salva cada uma individualmente
      if (exercise.sets && exercise.sets.length > 0) {
        const entries = exercise.sets.map((set) => ({
          user: req.user.id,
          exerciseName: exercise.name,
          weight: set.weight || 0,
          reps: set.reps || 0,
          workoutName: exercise.workoutName || null,
        }));
        const saved = await WorkoutHistory.insertMany(entries);
        savedExercises.push(...saved);
      } else {
        // Se for um registro simples de um exercício, salva apenas um
        const saved = await WorkoutHistory.create({
          user: req.user.id,
          exerciseName: exercise.name,
          weight: exercise.weight || 0,
          reps: exercise.reps || 0,
          workoutName: exercise.workoutName || null,
        });
        savedExercises.push(saved);
      }
    }

    res.json({
      message: 'Treino registrado com sucesso!',
      count: savedExercises.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    res.status(500).json({ message: 'Erro ao registrar treino' });
  }
};

exports.getPR = async (req, res) => {
  try {
    const { exercise } = getPRSchema.parse(req.query);
    const name = exercise.trim();

    /* collation com strength 1 ignora maiúscula e acento na comparação,
    dos dois lados. Como é igualdade exata, "Supino" não casa com "Supino Inclinado". */
    const record = await WorkoutHistory.findOne({
      user: req.user.id,
      exerciseName: name,
    })
      .collation({ locale: 'pt', strength: 1 })
      .sort({ weight: -1 });

    res.json({
      exercise: name,
      personalRecord: record?.weight || 0,
      reps: record?.reps || 0,
      date: record?.date || null,
      found: Boolean(record),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }

    console.error('Erro ao buscar PR:', error);
    res
      .status(500)
      .json({ message: 'Erro ao buscar PR', error: error.message });
  }
};
