const Workout = require('../../models/Workout');
const WorkoutHistory = require('../../models/WorkoutHistory');
const exercises = require('../../data/exercises');
const { z } = require('zod');

function getRandomExercisesAsObjects(exerciseArray, count, sets, reps) {
  if (!exerciseArray || exerciseArray.length === 0) return [];

  // Fisher-Yates, para não devolver sempre os mesmos exercícios
  const shuffled = [...exerciseArray];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count).map((ex) => ({
    name: ex.name,
    sets,
    reps,
    weight: 0, // Carga é individual, o usuário ajusta depois
  }));
}

const generateWorkoutSchema = z.object({
  goal: z.enum(['força', 'resistência', 'hipertrofia']),
  days: z
    .number({ required_error: 'days é obrigatório' })
    .min(2, 'days deve ser entre 2 e 6')
    .max(6, 'days deve ser entre 2 e 6'),
});

const getPRSchema = z.object({
  exercise: z
    .string()
    .min(1, 'O nome do exercício é obrigatório')
    .transform((val) => decodeURIComponent(val)),
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

const deleteWorkoutSchema = z.object({
  Id: z.string().min(1, 'O id do treino é obrigatório'),
});

const updatePRSchema = z
  .object({
    workoutId: z.string().optional(),
    exerciseName: z.string().optional(),
    newPR: z.number().min(0, 'O PR deve ser um número positivo'),
  })
  .refine((data) => data.workoutId && data.exerciseName, {
    message: 'É necessário fornecer workoutId e exerciseName',
  });

exports.generateWorkout = async (req, res) => {
  try {
    const { goal, days } = generateWorkoutSchema.parse(req.body);

    let sets;
    let reps;

    if (goal === 'força') {
      sets = 5;
      reps = '3-5'; // Poucas repetições, muito peso
    } else if (goal === 'resistência') {
      sets = 3;
      reps = '15-20'; // Muitas repetições, menos peso
    } else {
      sets = 4;
      reps = '8-12'; // Meio termo, hipertrofia
    }

    let split = [];

    if (days === 2) {
      // 2 dias: Fullbody A e Fullbody B (6 exercícios cada)
      split = [
        {
          day: 'Fullbody A - Força e Potência',
          exercises: getRandomExercisesAsObjects(
            exercises.fullbody1,
            6,
            sets,
            reps,
          ),
        },
        {
          day: 'Fullbody B - Resistência e Hipertrofia',
          exercises: getRandomExercisesAsObjects(
            exercises.fullbody2,
            6,
            sets,
            reps,
          ),
        },
      ];
    } else if (days === 3) {
      // 3 dias: PPL 6 exercícios cada
      split = [
        {
          day: 'Push - Peito, Ombros e Tríceps',
          exercises: getRandomExercisesAsObjects(exercises.push, 6, sets, reps),
        },
        {
          day: 'Pull - Costas e Bíceps',
          exercises: getRandomExercisesAsObjects(exercises.pull, 6, sets, reps),
        },
        {
          day: 'Legs - Pernas Completas',
          exercises: getRandomExercisesAsObjects(exercises.legs, 6, sets, reps),
        },
      ];
    } else if (days === 4) {
      // 4 dias: Upper/Lower 2x
      split = [
        {
          day: 'Upper A - Força Superior',
          exercises: getRandomExercisesAsObjects(
            exercises.upper,
            6,
            sets,
            reps,
          ),
        },
        {
          day: 'Lower A - Força Inferior',
          exercises: getRandomExercisesAsObjects(
            exercises.lower,
            6,
            sets,
            reps,
          ),
        },
        {
          day: 'Upper B - Hipertrofia Superior',
          exercises: getRandomExercisesAsObjects(
            exercises.upper,
            6,
            sets,
            reps,
          ),
        },
        {
          day: 'Lower B - Hipertrofia Inferior',
          exercises: getRandomExercisesAsObjects(
            exercises.lower,
            6,
            sets,
            reps,
          ),
        },
      ];
    } else if (days === 5) {
      // 5 dias: PPL  Upper  Lower (5 exercícios cada)
      split = [
        {
          day: 'Push - Peito, Ombros, Tríceps',
          exercises: getRandomExercisesAsObjects(exercises.push, 5, sets, reps),
        },
        {
          day: 'Pull - Costas e Bíceps',
          exercises: getRandomExercisesAsObjects(exercises.pull, 5, sets, reps),
        },
        {
          day: 'Legs - Pernas Completas',
          exercises: getRandomExercisesAsObjects(exercises.legs, 5, sets, reps),
        },
        {
          day: 'Upper - Superiores',
          exercises: getRandomExercisesAsObjects(
            exercises.upper,
            5,
            sets,
            reps,
          ),
        },
        {
          day: 'Lower - Inferiores + Core',
          exercises: getRandomExercisesAsObjects(
            exercises.lower,
            5,
            sets,
            reps,
          ),
        },
      ];
    } else if (days >= 6) {
      // 6 dias: Peito, Costas, Pernas, Ombros, Braços, Posterior
      split = [
        {
          day: 'Dia A - Peito e Tríceps',
          exercises: getRandomExercisesAsObjects(
            exercises.chest,
            5,
            sets,
            reps,
          ),
        },
        {
          day: 'Dia B - Costas e Bíceps',
          exercises: getRandomExercisesAsObjects(exercises.back, 5, sets, reps),
        },
        {
          day: 'Dia C - Quadríceps e Panturrilha',
          exercises: getRandomExercisesAsObjects(
            exercises.quads,
            5,
            sets,
            reps,
          ),
        },
        {
          day: 'Dia D - Ombros e Trapézio',
          exercises: getRandomExercisesAsObjects(
            exercises.shoulders,
            5,
            sets,
            reps,
          ),
        },
        {
          day: 'Dia E - Braços (Bíceps + Tríceps)',
          exercises: getRandomExercisesAsObjects(exercises.arms, 5, sets, reps),
        },
        {
          day: 'Dia F - Posterior e Glúteos',
          exercises: getRandomExercisesAsObjects(
            exercises.posterior,
            5,
            sets,
            reps,
          ),
        },
      ];
    }

    // Adiciona um exercício de abdomen em todos os treinos (ninguém gosta, mas é necessário kkkkj)
    if (exercises.abs) {
      split.forEach((day) => {
        const absExercises = getRandomExercisesAsObjects(
          exercises.abs,
          1,
          sets,
          reps,
        );
        if (absExercises.length > 0) {
          day.exercises.push(...absExercises);
        }
      });
    }

    const workout = new Workout({
      user: req.user.id,
      goal,
      days,
      sets,
      reps,
      split,
    });

    await workout.save();

    res.json({
      message: `Treino de ${days} dias gerado com sucesso!`,
      workout,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    res.status(500).json({ message: 'Erro ao gerar treino' });
  }
};

exports.getMyWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id });
    res.json(workouts);
  } catch {
    res.status(500).json({ message: 'Erro ao buscar treinos' });
  }
};

// PR vem do histórico de execução, não da carga planejada no treino
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

exports.deleteWorkouts = async (req, res) => {
  try {
    const { Id } = deleteWorkoutSchema.parse(req.params);
    const workout = await Workout.findOne({ _id: Id, user: req.user.id });

    if (!workout) {
      return res.status(404).json({ message: 'Treino não encontrado' });
    }

    await workout.deleteOne();
    res.json({ message: 'Treino excluído com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    res.status(500).json({ message: 'Erro ao excluir treino' });
  }
};

exports.updatePR = async (req, res) => {
  try {
    const { workoutId, exerciseName, newPR } = updatePRSchema.parse(req.body);

    const workout = await Workout.findOne({
      _id: workoutId,
      user: req.user.id,
    });

    if (!workout) {
      return res.status(404).json({ message: 'Treino não encontrado' });
    }

    let exerciseFound = false;

    workout.split.forEach((day) => {
      day.exercises.forEach((exercise) => {
        if (exercise.name === exerciseName) {
          exercise.weight = newPR;
          exerciseFound = true;
        }
      });
    });

    if (!exerciseFound) {
      return res.status(404).json({
        message: `Exercício "${exerciseName}" não encontrado no treino`,
      });
    }

    await workout.save();

    res.json({
      message: 'PR atualizado com sucesso ',
      workout: {
        id: workout._id,
        exerciseName,
        newWeight: newPR,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }

    console.error('Erro no updatePR:', error);
    res.status(500).json({ message: 'Erro ao atualizar PR' });
  }
};
