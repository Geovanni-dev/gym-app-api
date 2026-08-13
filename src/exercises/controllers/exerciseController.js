const Exercise = require('../../models/Exercise');
const { z } = require('zod');

const createExerciseSchema = z.object({
  name: z.string().min(1, 'O nome do exercício é obrigatório'),
  muscle: z.string().optional(),
});

/* Entrada e saída têm formatos diferentes: o create não recebe id, a listagem devolve. */
const exerciseOutputSchema = z.object({
  id: z.string().min(1, 'O ID do exercício é obrigatório'),
  name: z.string().min(1, 'O nome do exercício é obrigatório'),
  muscle: z.string().optional(),
});

const deleteExerciseSchema = z.object({
  id: z.string().min(1, 'O ID do exercício é obrigatório'),
});

exports.createExercise = async (req, res) => {
  try {
    const validateData = createExerciseSchema.parse(req.body);
    const exercise = await Exercise.create({
      user: req.user.id,
      ...validateData,
    });

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

exports.getExercises = async (req, res) => {
  try {
    const exercises = await Exercise.find({ user: req.user.id });
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
      user: req.user.id,
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
