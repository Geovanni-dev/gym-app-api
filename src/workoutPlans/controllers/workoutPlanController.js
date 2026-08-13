const WorkoutPlan = require('../../models/WorkoutPlan');
const { z } = require('zod');
const mongoose = require('mongoose');
const { prompt: promptSystem } = require('../prompts/prompt');
const { GoogleGenAI } = require('@google/genai');
const User = require('../../models/User');
const Exercise = require('../../models/Exercise');

//----- funçoes auxiliares

/* O model não aceita função assíncrona em "default", e gerar um valor temporário
para atualizar depois não garantiria unicidade. Por isso o código é gerado aqui,
antes de salvar. */
function gerarCodigoFormatado() {
  // 0 e 1 ficam de fora para não confundir com O e I
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789';
  let codigo = '';

  for (let i = 0; i < 12; i++) {
    codigo += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  const part1 = codigo.slice(0, 4);
  const part2 = codigo.slice(4, 8);
  const part3 = codigo.slice(8, 12);

  return `${part1}-${part2}-${part3}`;
}

/* Nomes de dia e de exercício vêm do usuário e são usados dentro de RegExp.
Sem escapar, um nome como ".*" viraria um padrão que casa com tudo. */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function nomeExato(valor) {
  return { $regex: new RegExp(`^${escapeRegex(valor)}$`, 'i') };
}
//-------- schemas zod

const createPlanSchema = z
  .object({
    name: z.string().min(1, 'O nome do plano é obrigatório'),
    days: z.array(
      z.object({
        name: z.string(),
        exercises: z.array(
          z.object({
            name: z.string(),
            sets: z.coerce.number(),
            reps: z.string(),
            weight: z.coerce.number(),
          }),
        ),
      }),
    ),
  })
  .passthrough();

const exerciseSchema = z.object({
  name: z.string().min(1, 'O nome do exercício é obrigatório'),
  sets: z.number().min(1, 'O número de séries deve ser pelo menos 1'),
  reps: z.string().min(1, 'O número de repetições é obrigatório'),
  weight: z.number().min(0, 'O peso deve ser um número positivo'),
});

const deletePlanSchema = z.object({
  planId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'ID de plano inválido',
  }),
});

const deleteExerciseSchema = z.object({
  planId: z.string().min(1, 'O id do plano de treino é obrigatório'),
  dayName: z.string().min(1, 'O nome do dia é obrigatório'),
  exerciseName: z.string().min(1, 'O nome do exercício é obrigatório'),
});

const updatePlanNameSchema = z.object({
  name: z.string().min(1, 'O nome do plano é obrigatório'),
});

const updateExerciseSchema = z
  .object({
    name: z.string().min(1, 'O nome do exercício é obrigatório').optional(),
    sets: z
      .number()
      .min(1, 'O número de séries deve ser pelo menos 1')
      .optional(),
    reps: z.string().min(1, 'O número de repetições é obrigatório').optional(),
    weight: z.number().min(0, 'O peso deve ser um número positivo').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Pelo menos um campo deve ser fornecido para atualização',
  });

const updateDayParamsSchema = z.object({
  planId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'ID de plano inválido',
  }),
  dayName: z.string().min(1, 'O nome do dia é obrigatório'),
});

const updateDaySchema = z.object({
  name: z.string().min(1, 'O nome do dia é obrigatório'),
});

const reorderDaysSchema = z.object({
  daysOrder: z.array(z.string(), 'Array com a nova ordem dos nomes dos dias'),
});

const addDaySchema = z.object({
  name: z.string().min(1, 'O nome do dia é obrigatório'),
  exercises: z
    .array(
      z.object({
        name: z.string(),
        sets: z.coerce.number(),
        reps: z.string(),
        weight: z.coerce.number(),
      }),
    )
    .optional()
    .default([]),
});

const deleteDaySchema = z.object({
  planId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'ID de plano inválido',
  }),
  dayName: z.string().min(1, 'O nome do dia é obrigatório'),
});

const shareCodeSchema = z.object({
  shareCode: z
    .string()
    .regex(
      /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/,
      'Formato de código inválido',
    ),
});

const reorderExSchema = z.object({
  dayName: z.string().min(1, 'O nome do dia é obrigatório'),
  exercisesOrder: z.array(
    z.string(),
    'Array com a nova ordem dos IDs dos exercícios',
  ),
});

const payloadSchema = z.object({
  dias: z
    .number()
    .min(3, 'O plano de treino deve ter pelo menos 3 dia')
    .max(6, 'O plano de treino deve ter no máximo 6 dias'),
  foco: z.enum(['força', 'resistência', 'hipertrofia']),
  genero: z.enum(['masculino', 'feminino']),
});

// ---- funções

exports.generatePlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    const payload = payloadSchema.parse(req.body);
    const exercises = await Exercise.find();
    const fullPrompt = `
   Usuário:
   ${user.name}

   Banco de exercicios:
   ${JSON.stringify(exercises)}

   Dias: ${payload.dias}
   Foco: ${payload.foco}
   Genero: ${payload.genero}

   Instruções:
   ${promptSystem}
   `;
    const ApiKey = process.env.API_AI_KEY;
    if (!ApiKey) {
      return res.status(503).json({ message: 'Chave de API indisponível' });
    }
    const genAI = new GoogleGenAI({ apiKey: ApiKey });
    const response = await genAI.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: fullPrompt,
      config: {
        responseMimeType: 'application/json',
      },
    });
    const planData = JSON.parse(response.text);
    const parsedResponse = createPlanSchema.parse(planData);
    return res.json({ plan: parsedResponse });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    if (error instanceof SyntaxError) {
      console.log(error);
      return res
        .status(502)
        .json({ message: 'IA retornou um formato inválido' });
    }
    console.log(error);
    return res.status(500).json({ message: 'Erro ao gerar plano de treino' });
  }
};

exports.createWorkoutPlan = async (req, res) => {
  try {
    const validateData = createPlanSchema.parse(req.body);

    let codigoUnico;
    let codigoExiste = true;

    while (codigoExiste) {
      codigoUnico = gerarCodigoFormatado();
      const planoExistente = await WorkoutPlan.findOne({
        shareCode: codigoUnico,
      });
      codigoExiste = !!planoExistente;
    }

    const plan = await WorkoutPlan.create({
      user: req.user.id,
      name: validateData.name,
      days: validateData.days,
      shareCode: codigoUnico,
    });

    res.status(201).json({
      message: 'Plano de treino criado com sucesso',
      plan,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return res.status(500).json({ message: 'Erro ao criar plano de treino' });
  }
};

exports.getWorkoutPlans = async (req, res) => {
  try {
    const plans = await WorkoutPlan.find({ user: req.user.id });
    res.json(plans);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Erro ao buscar planos de treino' });
  }
};

exports.addExerciseToPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const { dayName, ...exerciseData } = req.body;
    const result = exerciseSchema.parse(exerciseData);

    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      {
        _id: planId,
        user: req.user.id,
        'days.name': nomeExato(dayName),
      },
      {
        // O $ posicional aponta para o dia que casou no filtro acima
        $push: {
          'days.$.exercises': result,
        },
      },
      { returnDocument: 'after', runValidators: true },
    );

    if (!workoutPlan) {
      return res.status(404).json({ message: 'Plano ou dia não encontrado' });
    }

    res.json({ message: 'Exercício adicionado!', workoutPlan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return res.status(500).json({ message: 'Erro ao adicionar exercício' });
  }
};

exports.deleteWorkoutPlan = async (req, res) => {
  try {
    const { planId } = deletePlanSchema.parse(req.params);
    const workoutPlan = await WorkoutPlan.findOne({
      _id: planId,
      user: req.user.id,
    });

    if (!workoutPlan) {
      return res.status(404).json({
        message: 'Plano não encontrado',
      });
    }

    await WorkoutPlan.findByIdAndDelete(planId);
    res.json({ message: 'Plano de treino deletado!' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return res.status(500).json({ message: 'Erro ao deletar plano de treino' });
  }
};

exports.deleteExercisePlan = async (req, res) => {
  try {
    const { planId, dayName, exerciseName } = deleteExerciseSchema.parse(
      req.params,
    );

    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      {
        _id: planId,
        user: req.user.id,
        'days.name': nomeExato(dayName),
      },
      {
        $pull: {
          'days.$.exercises': {
            name: nomeExato(exerciseName),
          },
        },
      },
      { returnDocument: 'after', runValidators: true },
    );

    if (!workoutPlan) {
      return res.status(404).json({
        message: 'Plano não encontrado',
      });
    }

    res.json({ message: 'Exercício excluído com sucesso!', workoutPlan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return res.status(500).json({ message: 'Erro ao excluir exercício' });
  }
};

exports.updateWorkoutPlanName = async (req, res) => {
  try {
    const { planId } = deletePlanSchema.parse(req.params);
    const { name } = updatePlanNameSchema.parse(req.body);

    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: planId, user: req.user.id },
      { $set: { name } },
      { returnDocument: 'after', runValidators: true },
    );

    if (!workoutPlan) {
      return res.status(404).json({
        message: 'Plano não encontrado',
      });
    }

    res.json({
      message: 'Nome do plano atualizado com sucesso!',
      workoutPlan,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return res.status(500).json({ message: 'Erro ao atualizar nome do plano' });
  }
};

exports.updateExerciseInPlan = async (req, res) => {
  try {
    const { planId, dayName, exerciseName } = deleteExerciseSchema.parse(
      req.params,
    );
    const updateData = updateExerciseSchema.parse(req.body);

    // Só entra no $set o que veio no body, para não sobrescrever campo omitido
    const updateFields = {};
    if (updateData.name !== undefined) {
      updateFields['days.$[day].exercises.$[exercise].name'] = updateData.name;
    }
    if (updateData.sets !== undefined) {
      updateFields['days.$[day].exercises.$[exercise].sets'] = updateData.sets;
    }
    if (updateData.reps !== undefined) {
      updateFields['days.$[day].exercises.$[exercise].reps'] = updateData.reps;
    }
    if (updateData.weight !== undefined) {
      updateFields['days.$[day].exercises.$[exercise].weight'] =
        updateData.weight;
    }

    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: planId, user: req.user.id },
      { $set: updateFields },
      {
        arrayFilters: [
          { 'day.name': nomeExato(dayName) },
          { 'exercise.name': nomeExato(exerciseName) },
        ],
        returnDocument: 'after',
        runValidators: true,
      },
    );

    if (!workoutPlan) {
      return res.status(404).json({
        message: 'Plano não encontrado',
      });
    }

    res.json({
      message: 'Exercício atualizado com sucesso!',
      workoutPlan,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return res.status(500).json({ message: 'Erro ao atualizar exercício' });
  }
};

exports.updateDayInPlan = async (req, res) => {
  try {
    const { planId, dayName } = updateDayParamsSchema.parse(req.params);
    const { name: newDayName } = updateDaySchema.parse(req.body);

    const existingPlan = await WorkoutPlan.findOne({
      _id: planId,
      user: req.user.id,
      'days.name': nomeExato(newDayName),
    });

    if (existingPlan) {
      return res
        .status(400)
        .json({ message: 'Já existe um dia com este nome neste plano' });
    }

    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: planId, user: req.user.id },
      { $set: { 'days.$[day].name': newDayName } },
      {
        arrayFilters: [{ 'day.name': nomeExato(dayName) }],
        returnDocument: 'after',
        runValidators: true,
      },
    );

    if (!workoutPlan) {
      return res.status(404).json({
        message: 'Plano não encontrado',
      });
    }

    res.json({
      message: 'Dia atualizado com sucesso!',
      workoutPlan,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return res.status(500).json({ message: 'Erro ao atualizar dia do plano' });
  }
};

exports.reorderDaysInPlan = async (req, res) => {
  try {
    const { planId } = deletePlanSchema.parse(req.params);
    const { daysOrder } = reorderDaysSchema.parse(req.body);

    const workoutPlan = await WorkoutPlan.findOne({
      _id: planId,
      user: req.user.id,
    });

    if (!workoutPlan) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    /* A ordem enviada precisa conter exatamente os mesmos dias do plano,
    senão a reordenação apagaria ou duplicaria dias. */
    const existingDayNames = workoutPlan.days.map((d) => d.name);
    const allDaysExist = daysOrder.every((dayName) =>
      existingDayNames.includes(dayName),
    );

    if (!allDaysExist || daysOrder.length !== existingDayNames.length) {
      return res.status(400).json({ message: 'Ordem de dias inválida' });
    }

    const reorderedDays = daysOrder.map((dayName) =>
      workoutPlan.days.find((d) => d.name === dayName),
    );

    const updatedPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: planId, user: req.user.id },
      { $set: { days: reorderedDays } },
      { returnDocument: 'after', runValidators: true },
    );

    res.json({
      message: 'Ordem dos dias atualizada com sucesso!',
      workoutPlan: updatedPlan,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return res.status(500).json({ message: 'Erro ao reordenar dias' });
  }
};

exports.addDayToPlan = async (req, res) => {
  try {
    const { planId } = deletePlanSchema.parse(req.params);
    const { name, exercises = [] } = addDaySchema.parse(req.body);

    const plan = await WorkoutPlan.findOne({ _id: planId, user: req.user.id });
    if (!plan) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    const dayExists = plan.days.some(
      (d) => d.name.toLowerCase() === name.toLowerCase(),
    );
    if (dayExists) {
      return res
        .status(400)
        .json({ message: 'Já existe um dia com este nome neste plano' });
    }

    const updatedPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: planId, user: req.user.id },
      { $push: { days: { name, exercises } } },
      { returnDocument: 'after', runValidators: true },
    );

    res.json({
      message: 'Dia adicionado com sucesso!',
      workoutPlan: updatedPlan,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    res.status(500).json({ message: 'Erro ao adicionar dia' });
  }
};

exports.deleteDayFromPlan = async (req, res) => {
  try {
    const { planId, dayName } = deleteDaySchema.parse(req.params);

    const updatedPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: planId, user: req.user.id },
      { $pull: { days: { name: nomeExato(dayName) } } },
      { returnDocument: 'after', runValidators: true },
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    res.json({
      message: 'Dia excluído com sucesso!',
      workoutPlan: updatedPlan,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    res.status(500).json({ message: 'Erro ao excluir dia' });
  }
};

exports.copyPlan = async (req, res) => {
  try {
    const { shareCode } = shareCodeSchema.parse({
      shareCode: req.params.shareCode,
    });

    const workoutPlan = await WorkoutPlan.findOne({ shareCode });
    if (!workoutPlan) {
      return res
        .status(404)
        .json({ message: 'Plano de treino nao encontrado' });
    }

    const daysCopy = workoutPlan.days.map((day) => ({
      name: day.name,
      exercises: day.exercises.map((exer) => ({
        name: exer.name,
        sets: exer.sets,
        reps: exer.reps,
        weight: exer.weight,
        pr: null, // PR é individual, não faz sentido copiar de outra pessoa
      })),
    }));

    let codigoUnico;
    let codigoExiste = true;

    while (codigoExiste) {
      codigoUnico = gerarCodigoFormatado();
      const planoExistente = await WorkoutPlan.findOne({
        shareCode: codigoUnico,
      });
      codigoExiste = !!planoExistente;
    }

    const newPlan = await WorkoutPlan.create({
      user: req.user.id,
      name: workoutPlan.name,
      days: daysCopy,
      shareCode: codigoUnico,
    });

    res
      .status(201)
      .json({ message: 'Plano de treino criado com sucesso!', plan: newPlan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return res.status(500).json({ message: 'Erro ao criar plano de treino' });
  }
};

exports.reorderExercisesInDay = async (req, res) => {
  try {
    const { planId } = deletePlanSchema.parse(req.params);
    const { dayName, exercisesOrder } = reorderExSchema.parse(req.body);

    console.log(
      `[REORDER] Plano: ${planId}, Dia: ${dayName}, Nova ordem: ${exercisesOrder}`,
    );

    const workoutPlan = await WorkoutPlan.findOne({
      _id: planId,
      user: req.user.id,
    });
    if (!workoutPlan) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }

    const day = workoutPlan.days.find(
      (day) => day.name.toLowerCase() === dayName.toLowerCase(),
    );

    if (!day) {
      return res.status(404).json({ message: 'Dia nao encontrado' });
    }

    /* A ordem enviada precisa conter exatamente os mesmos exercícios do dia,
    senão a reordenação apagaria ou duplicaria exercícios. */
    const existingExerciseIds = day.exercises.map((ex) => ex._id.toString());
    const allIdsExist = exercisesOrder.every((id) =>
      existingExerciseIds.includes(id),
    );
    const hasSameLength = exercisesOrder.length === existingExerciseIds.length;

    if (!allIdsExist || !hasSameLength) {
      console.error(
        `[REORDER] Falha: IDs recebidos: ${exercisesOrder}, IDs esperados: ${existingExerciseIds}`,
      );
      return res.status(400).json({
        message: 'Ordem de exercícios inválida',
        receivedIds: exercisesOrder,
        expectedIds: existingExerciseIds,
      });
    }

    const reorderedExercises = exercisesOrder.map((id) =>
      day.exercises.find((ex) => ex._id.toString() === id),
    );

    day.exercises = reorderedExercises;

    await workoutPlan.save();

    res.json({ message: 'Exercícios reordenados com sucesso!', workoutPlan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Erro de validação',
        detalhes: error.flatten().fieldErrors,
      });
    }
    console.log(error);
    return res.status(500).json({ message: 'Erro ao reordenar exercícios' });
  }
};
