const Exercise = require('../../models/Exercise');
const { z } = require('zod');

const createExerciseSchema = z.object({
  name: z.string().min(1, 'O nome do exercício é obrigatório'),
  muscle: z.string().optional(),
  sets: z.coerce.number().min(1).optional(),
  reps: z.string().min(1).optional(),
});

const exerciseOutputSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'O nome do exercício é obrigatório'),
  muscle: z.string().optional(),
  sets: z.number().min(1),
  reps: z.string().min(1),
});

const exerciseMultSchema = z.array(
  z.object({
    name: z.string().min(1, 'O nome do exercício é obrigatório'),
    muscle: z.string().optional(),
    sets: z.coerce.number().min(1).optional(),
    reps: z.string().min(1).optional(),
  }),
);

const deleteExerciseSchema = z.object({
  id: z.string().min(1, 'O ID do exercício é obrigatório'),
});

exports.createExercise = async (req, res) => {
  try {
    const validateData = createExerciseSchema.parse(req.body);
    const exercise = await Exercise.create(validateData);

    res.status(201).json({
      message: 'Exercício criado com sucesso',
      exercise,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return res.status(500).json({ message: 'Erro ao criar exercício' });
  }
};

exports.createMultipleExercises = async (req, res) => {
  try {
    const validateData = exerciseMultSchema.parse(req.body);
    const exercises = await Exercise.insertMany(validateData);
    res.status(201).json({
      message: 'Exercícios criados com sucesso',
      exercises,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return res.status(500).json({ message: 'Erro ao criar exercícios' });
  }
};

exports.getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find();
    const validExercises = z.array(exerciseOutputSchema).parse(exercises);

    res.json(validExercises);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Erro ao listar exercícios' });
  }
};

exports.deleteExercise = async (req, res) => {
  try {
    const { id } = deleteExerciseSchema.parse(req.params);
    const deleted = await Exercise.findOneAndDelete({
      _id: id,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Exercício não encontrado' });
    }

    res.json({ message: 'Exercício deletado com sucesso' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return res.status(500).json({ message: 'Erro ao deletar exercício' });
  }
};
