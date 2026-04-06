// Models responsáveis por armazenar os planos de treino e o histórico de execução
const WorkoutPlan = require("../../models/WorkoutPlan");
const { z } = require("zod");
const mongoose = require("mongoose");


//=============================================validação de dados com zod


// schema para criar/buscar planos de treino do usuário
const createPlanSchema = z.object({
  name: z.string().min(1, "O nome do plano é obrigatório"),
  days: z.array(z.object({
    name: z.string(), 
    exercises: z.array(z.object({
      name: z.string(),
      sets: z.coerce.number(), 
      reps: z.string(),
      weight: z.coerce.number() 
    }))
  }))
}).passthrough();


// schema para validar a adição de um exercício ao plano
const exerciseSchema = z.object({
  name: z.string().min(1, "O nome do exercício é obrigatório"),
  sets: z.number().min(1, "O número de séries deve ser pelo menos 1"),
  reps: z.string().min(1, "O número de repetições é obrigatório"),
  weight: z.number().min(0, "O peso deve ser um número positivo")
});

// schema para validar a atualização do peso do exercício
const updateWeightSchema = z.object({
  weight: z.number().min(0, "O peso deve ser um número positivo")
});


// schema para um plano de treino
const deletePlanSchema = z.object({
  planId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: "ID de plano inválido"
})
});

// schema pra deletar exercicio especifico do plano
const deleteExerciseSchema = z.object({
  planId: z.string().min(1, "O id do plano de treino é obrigatório"),
  day: z.string().min(1, "O nome do dia é obrigatório"), 
  exerciseName: z.string().min(1, "O nome do exercício é obrigatório") 
}); // Schema para editar o nome do plano
const updatePlanNameSchema = z.object({
  name: z.string().min(1, "O nome do plano é obrigatório")
});

// Schema para editar um exercício existente
const updateExerciseSchema = z.object({
  name: z.string().min(1, "O nome do exercício é obrigatório").optional(),
  sets: z.number().min(1, "O número de séries deve ser pelo menos 1").optional(),
  reps: z.string().min(1, "O número de repetições é obrigatório").optional(),
  weight: z.number().min(0, "O peso deve ser um número positivo").optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "Pelo menos um campo deve ser fornecido para atualização"
});

// Schema para validar os parâmetros da rota de editar dia (planId e day)
const updateDayParamsSchema = z.object({
  planId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "ID de plano inválido"
  }),
  day: z.string().min(1, "O nome do dia é obrigatório")
});

// Schema para editar o nome do dia (body)
const updateDaySchema = z.object({
  name: z.string().min(1, "O nome do dia é obrigatório")
});

// Schema para reordenar dias
const reorderDaysSchema = z.object({
  daysOrder: z.array(z.string(), "Array com a nova ordem dos nomes dos dias")
});

// Schema para adicionar dia
const addDaySchema = z.object({
  name: z.string().min(1, "O nome do dia é obrigatório"),
  exercises: z.array(z.object({
    name: z.string(),
    sets: z.coerce.number(),
    reps: z.string(),
    weight: z.coerce.number()
  })).optional().default([])
});

// Schema para deletar dia
const deleteDaySchema = z.object({
  planId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "ID de plano inválido"
  }),
  dayName: z.string().min(1, "O nome do dia é obrigatório")
});

//=============================================criar planos de treinos

// CRIAR PLANO DE TREINO
exports.createWorkoutPlan = async (req, res) => {
    try {
    const validateData = createPlanSchema.parse(req.body ); // validação dos dados com zod
    const plan = await WorkoutPlan.create({
      user: req.user.id,
      ...validateData
    });
    res.status(201).json({
      message: "Plano de treino criado com sucesso",
      plan
    });
    } catch (error) {
       if (error instanceof z.ZodError) { // se o erro for do zod
            return res.status(400).json({ error: "Erro de validação", 
                detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
        });
        }
        console.log(error); // se n for do zod
        return res.status(500).json({ message: "Erro ao criar plano de treino" });
  }
};



// BUSCAR PLANOS DO USUÁRIO
exports.getWorkoutPlans = async (req, res) => {
  try {

  const plans = await WorkoutPlan.find({ user: req.user.id });
  const validatePlans = z.array(createPlanSchema).parse(plans); // validação dos planos com zod 
  res.json(validatePlans); // retorna os planos validados

  } catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
      return res.status(400).json({ error: "Erro de validação", 
          detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
      });
      }
      console.log(error); // se n for do zod
      return res.status(500).json({ message: "Erro ao buscar planos de treino" });
  }
};


// ADICIONAR EXERCÍCIO AO PLANO
exports.addExerciseToPlan = async (req, res) => {
  
  try {

    const { planId } = req.params;
    const { dayName, ...exerciseData } = req.body;
    const result = exerciseSchema.parse(exerciseData);
    const workoutPlan = await WorkoutPlan.findOne({
      _id: planId,
      user: req.user.id
    });

    if (!workoutPlan) {
      return res.status(404).json({
        message: "Plano não encontrado"
      });
    }

 const dayToUpdate = workoutPlan.days.find( // busca o dia dentro do plano de treino pelo nome do dia, ignorando maiúsculas e minúsculas
  d => d.name.toLowerCase() === dayName.toLowerCase()
);

if (!dayToUpdate) { // se o dia não for encontrado, retorna erro 404
  return res.status(404).json({ message: "Dia não encontrado" });
}

if (dayToUpdate.exercises.some(e => e.name.toLowerCase() === result.name.toLowerCase())) { // Verifica se o exercício já existe no dia, ignorando maiúsculas e minúsculas, se sim retorna erro 400
  return res.status(400).json({ message: "Exercício já existe" });
}

dayToUpdate.exercises.push(result); // Adiciona o exercício validado
await workoutPlan.save(); // Salva no banco

res.json({ message: "Exercício adicionado!", workoutPlan });

  } catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
      return res.status(400).json({ error: "Erro de validação", 
          detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
      });
      }
      console.log(error); // se n for do zod
      return res.status(500).json({ message: "Erro ao adicionar exercício" });
  }
};   



// ATUALIZAR PESO DO EXERCÍCIO
exports.updateExerciseWeight = async (req, res) => {
    try {

    const { planId, day, exerciseName } = req.params; // recebe o id do plano, o dia e o nome do exercício pela rota
    const result = updateWeightSchema.parse(req.body); // validação do peso com zod
    const workoutPlan = await WorkoutPlan.findOne({ // busca o plano de treino pelo id e pelo usuário logado
      _id: planId,
      user: req.user.id
    });

    if (!workoutPlan) { // se o plano não for encontrado, retorna erro 404
      return res.status(404).json({
        message: "Plano não encontrado"
      });
    }

    const dayToUpdate = workoutPlan.days.find( // busca o dia dentro do plano de treino pelo nome do dia, ignorando maiúsculas e minúsculas
  d => d.name.toLowerCase() === day.toLowerCase()
);

if (!dayToUpdate) {
  return res.status(404).json({
    message: "Dia não encontrado"
  });
}

const exerciseToUpdate = dayToUpdate.exercises.find( // busca o exercício dentro do dia pelo nome do exercício, ignorando maiúsculas e minúsculas
  e => e.name.toLowerCase() === exerciseName.toLowerCase()
);

if (!exerciseToUpdate) {
  return res.status(404).json({
    message: "Exercício não encontrado"
  });
} 
  exerciseToUpdate.weight = result.weight; // atualiza o peso do exercício
  await workoutPlan.save(); // salva no banco
  res.json({ message: "Peso atualizado!", workoutPlan });

  } catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
      return res.status(400).json({ error: "Erro de validação", 
          detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
      });
      }
      console.log(error); // se n for do zod
      return res.status(500).json({ message: "Erro ao atualizar peso" });
  }
};

// EXCLUIR PLANO
exports.deleteWorkoutPlan = async (req, res) => {
  try {
  const { planId } = deletePlanSchema.parse(req.params); // recebe o id do plano de treino pela rota
  const workoutPlan = await WorkoutPlan.findOne({ // busca o plano de treino pelo id e pelo usuário logado
    _id: planId,
    user: req.user.id
  });
  if (!workoutPlan) { // se o plano não for encontrado, retorna erro 404
    return res.status(404).json({
      message: "Plano não encontrado"
    });
  }
  await WorkoutPlan.findByIdAndDelete(planId); // deleta o plano de treino do banco de dados
  res.json({ message: "Plano de treino deletado!"});
  } catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
      return res.status(400).json({ error: "Erro de validação", 
          detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
      });
      }
    console.log(error); // se n for do zod
    return res.status(500).json({ message: "Erro ao deletar plano de treino" });
  }
};

// EXCLUIR EXERCÍCIO
exports.deleteExercisePlan = async (req, res) => {
  try{
    const { planId, day, exerciseName } = deleteExerciseSchema.parse(req.params); // recebe o id do plano, o dia e o nome do exercício pela rota
    const workoutPlan = await WorkoutPlan.findOne({ // busca o plano de treino pelo id e pelo usuário logado
      _id: planId,
      user: req.user.id
    });

    if (!workoutPlan) { // se o plano não for encontrado, retorna erro 404
      return res.status(404).json({
        message: "Plano não encontrado"
      });
    }

    const dayToUpdate = workoutPlan.days.find( // busca o dia dentro do plano de treino pelo nome do dia, ignorando maiúsculas e minúsculas
  d => d.name.toLowerCase() === day.toLowerCase()
);

if (!dayToUpdate) {
  return res.status(404).json({
    message: "Dia não encontrado"
  });
}

const exerciseToUpdate = dayToUpdate.exercises.some( // busca o exercício dentro do dia pelo nome do exercício, ignorando maiúsculas e minúsculas
  e => e.name.toLowerCase() === exerciseName.toLowerCase()
);

if (!exerciseToUpdate) {
  return res.status(404).json({
    message: "Exercício não encontrado"
  });
} 
      dayToUpdate.exercises = dayToUpdate.exercises.filter(
      e => e.name.toLowerCase() !== exerciseName.toLowerCase()
    );

    await workoutPlan.save();
    res.json({ message: "Exercício excluído com sucesso!", workoutPlan });
  } catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
      return res.status(400).json({ error: "Erro de validação", 
          detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
      });
      }
      console.log(error); // se n for do zod
      return res.status(500).json({ message: "Erro ao excluir exercício" });
  }
};

// EDITAR NOME DO PLANO
exports.updateWorkoutPlanName = async (req, res) => {
  try {
    // Valida o ID do plano vindo dos parâmetros da URL
    const { planId } = deletePlanSchema.parse(req.params);
    
    // Valida o novo nome vindo do corpo da requisição
    const { name } = updatePlanNameSchema.parse(req.body);
    
    // Busca o plano pelo ID e verifica se pertence ao usuário logado
    const workoutPlan = await WorkoutPlan.findOne({
      _id: planId,
      user: req.user.id
    });
    
    // Se o plano não for encontrado, retorna erro 404
    if (!workoutPlan) {
      return res.status(404).json({
        message: "Plano não encontrado"
      });
    }
    
    // Atualiza o nome do plano
    workoutPlan.name = name;
    
    // Salva as alterações no banco de dados
    await workoutPlan.save();
    
    // Retorna sucesso com o plano atualizado
    res.json({
      message: "Nome do plano atualizado com sucesso!",
      workoutPlan
    });
    
  } catch (error) {
    // Tratamento de erro de validação do Zod
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Erro de validação",
        detalhes: error.flatten().fieldErrors
      });
    }
    // Log do erro e retorno genérico para outros erros
    console.log(error);
    return res.status(500).json({ message: "Erro ao atualizar nome do plano" });
  }
};

// ============================================= EDITAR EXERCÍCIO DO PLANO

// EDITAR EXERCÍCIO DENTRO DE UM DIA DO PLANO
exports.updateExerciseInPlan = async (req, res) => {
  try {
    // Valida os parâmetros da rota: ID do plano, nome do dia e nome do exercício
    const { planId, day, exerciseName } = deleteExerciseSchema.parse(req.params);
    
    // Valida os dados do exercício que serão atualizados (vem do body)
    const updateData = updateExerciseSchema.parse(req.body);
    
    // Busca o plano pelo ID e verifica se pertence ao usuário logado
    const workoutPlan = await WorkoutPlan.findOne({
      _id: planId,
      user: req.user.id
    });
    
    // Se o plano não for encontrado, retorna erro 404
    if (!workoutPlan) {
      return res.status(404).json({
        message: "Plano não encontrado"
      });
    }
    
    // Busca o dia dentro do plano pelo nome (case insensitive)
    const dayToUpdate = workoutPlan.days.find(
      d => d.name.toLowerCase() === day.toLowerCase()
    );
    
    // Se o dia não for encontrado, retorna erro 404
    if (!dayToUpdate) {
      return res.status(404).json({
        message: "Dia não encontrado"
      });
    }
    
    // Busca o exercício dentro do dia pelo nome (case insensitive)
    const exerciseToUpdate = dayToUpdate.exercises.find(
      e => e.name.toLowerCase() === exerciseName.toLowerCase()
    );
    
    // Se o exercício não for encontrado, retorna erro 404
    if (!exerciseToUpdate) {
      return res.status(404).json({
        message: "Exercício não encontrado"
      });
    }
    
    // Atualiza APENAS os campos que foram enviados no body
    // Ex: se enviar { sets: 5 }, só o sets será atualizado
    if (updateData.name !== undefined) exerciseToUpdate.name = updateData.name;
    if (updateData.sets !== undefined) exerciseToUpdate.sets = updateData.sets;
    if (updateData.reps !== undefined) exerciseToUpdate.reps = updateData.reps;
    if (updateData.weight !== undefined) exerciseToUpdate.weight = updateData.weight;
    
    // Salva as alterações no banco de dados
    await workoutPlan.save();
    
    // Retorna sucesso com o plano atualizado
    res.json({
      message: "Exercício atualizado com sucesso!",
      workoutPlan
    });
    
  } catch (error) {
    // Tratamento de erro de validação do Zod
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Erro de validação",
        detalhes: error.flatten().fieldErrors
      });
    }
    // Log do erro e retorno genérico para outros erros
    console.log(error);
    return res.status(500).json({ message: "Erro ao atualizar exercício" });
  }
};

// EDITAR NOME DE UM DIA ESPECÍFICO DO PLANO
exports.updateDayInPlan = async (req, res) => {
  try {
    // USANDO O SCHEMA CORRETO PARA OS PARAMS
    const { planId, day } = updateDayParamsSchema.parse(req.params);
    
    // USANDO O SCHEMA QUE VOCÊ JÁ TEM PARA O BODY
    const { name: newDayName } = updateDaySchema.parse(req.body);
    
    const workoutPlan = await WorkoutPlan.findOne({
      _id: planId,
      user: req.user.id
    });
    
    if (!workoutPlan) {
      return res.status(404).json({
        message: "Plano não encontrado"
      });
    }
    
    const dayToUpdate = workoutPlan.days.find(
      d => d.name.toLowerCase() === day.toLowerCase()
    );
    
    if (!dayToUpdate) {
      return res.status(404).json({
        message: "Dia não encontrado"
      });
    }
    
    const dayExists = workoutPlan.days.some(
      d => d.name.toLowerCase() === newDayName.toLowerCase() && d !== dayToUpdate
    );
    
    if (dayExists) {
      return res.status(400).json({
        message: "Já existe um dia com este nome neste plano"
      });
    }
    
    dayToUpdate.name = newDayName;
    await workoutPlan.save();
    
    res.json({
      message: "Dia atualizado com sucesso!",
      workoutPlan
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Erro de validação",
        detalhes: error.flatten().fieldErrors
      });
    }
    console.log(error);
    return res.status(500).json({ message: "Erro ao atualizar dia do plano" });
  }
};

// REORDENAR DIAS DO PLANO
exports.reorderDaysInPlan = async (req, res) => {
  try {
    const { planId } = deletePlanSchema.parse(req.params);
    const { daysOrder } = reorderDaysSchema.parse(req.body);
    
    const workoutPlan = await WorkoutPlan.findOne({
      _id: planId,
      user: req.user.id
    });
    
    if (!workoutPlan) {
      return res.status(404).json({ message: "Plano não encontrado" });
    }
    
    // Verifica se todos os dias enviados existem no plano
    const existingDayNames = workoutPlan.days.map(d => d.name);
    const allDaysExist = daysOrder.every(dayName => 
      existingDayNames.includes(dayName)
    );
    
    if (!allDaysExist || daysOrder.length !== existingDayNames.length) {
      return res.status(400).json({ message: "Ordem de dias inválida" });
    }
    
    // Reordena os dias conforme a ordem enviada
    workoutPlan.days.sort((a, b) => {
      return daysOrder.indexOf(a.name) - daysOrder.indexOf(b.name);
    });
    
    await workoutPlan.save();
    
    res.json({
      message: "Ordem dos dias atualizada com sucesso!",
      workoutPlan
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Erro de validação",
        detalhes: error.flatten().fieldErrors
      });
    }
    console.log(error);
    return res.status(500).json({ message: "Erro ao reordenar dias" });
  }
};

// ADICIONAR DIA AO PLANO
exports.addDayToPlan = async (req, res) => {
  try {
    const { planId } = deletePlanSchema.parse(req.params);
    const { name, exercises = [] } = addDaySchema.parse(req.body);
    
    const workoutPlan = await WorkoutPlan.findOne({
      _id: planId,
      user: req.user.id
    });
    
    if (!workoutPlan) {
      return res.status(404).json({ message: "Plano não encontrado" });
    }
    
    // Verifica se já existe um dia com esse nome
    const dayExists = workoutPlan.days.some(
      d => d.name.toLowerCase() === name.toLowerCase()
    );
    
    if (dayExists) {
      return res.status(400).json({ message: "Já existe um dia com este nome neste plano" });
    }
    
    workoutPlan.days.push({ name, exercises });
    await workoutPlan.save();
    
    res.json({ message: "Dia adicionado com sucesso!", workoutPlan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Erro de validação", detalhes: error.flatten().fieldErrors });
    }
    console.log(error);
    return res.status(500).json({ message: "Erro ao adicionar dia" });
  }
};

// DELETAR DIA DO PLANO
exports.deleteDayFromPlan = async (req, res) => {
  try {
    const { planId, dayName } = deleteDaySchema.parse(req.params);
    
    const workoutPlan = await WorkoutPlan.findOne({
      _id: planId,
      user: req.user.id
    });
    
    if (!workoutPlan) {
      return res.status(404).json({ message: "Plano não encontrado" });
    }
    
    // Encontra o índice do dia pelo nome (case insensitive)
    const dayIndex = workoutPlan.days.findIndex(
      d => d.name.toLowerCase() === dayName.toLowerCase()
    );
    
    if (dayIndex === -1) {
      return res.status(404).json({ message: "Dia não encontrado" });
    }
    
    // Remove o dia do array
    workoutPlan.days.splice(dayIndex, 1);
    await workoutPlan.save();
    
    res.json({ message: "Dia excluído com sucesso!", workoutPlan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Erro de validação", detalhes: error.flatten().fieldErrors });
    }
    console.log(error);
    return res.status(500).json({ message: "Erro ao excluir dia" });
  }
};