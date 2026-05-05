// Models responsáveis por armazenar os planos de treino e o histórico de execução
const WorkoutPlan = require("../../models/WorkoutPlan");
const { z } = require("zod"); // importa o zod
const mongoose = require("mongoose"); // importa o mongoose



//==============================================funçaos auxiliares


/*tentei criar a funçao direto no model usando "default" mas ele nao aceita funçoes assíncronas, optei por criar aqui mesmo no controller ao inves de deixar o default gerar um valor padrao temporario "ex PENDENTE" e depois atualizar com o valor correto do shareCode apos gerar o plano de treino, assim garantindo que o shareCode seja unico e no formato correto antes de salvar o plano no banco de dados*/
function gerarCodigoFormatado() {
  // Atualizei para incluir todas as letras de A-Z, removendo apenas 0 e 1 para evitar confusão visual com O e I
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789'; // caracteres permitidos
  let codigo = '';
  
  for (let i = 0; i < 12; i++) {
    codigo += characters.charAt(Math.floor(Math.random() * characters.length)); // gera um código aleatório de 12 caracteres
  }
  
  const part1 = codigo.slice(0, 4);
  const part2 = codigo.slice(4, 8);
  const part3 = codigo.slice(8, 12);
  
  return `${part1}-${part2}-${part3}`; // formata o código como XXXX-XXXX-XXXX
}

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


// schema para validaçao do shereCode
const shareCodeSchema = z.object({
  shareCode: z.string().regex(
    /^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/, 
    "Formato de código inválido"
  )
});


//=============================================criar planos de treinos

// CRIAR PLANO DE TREINO
exports.createWorkoutPlan = async (req, res) => {
    try {
    const validateData = createPlanSchema.parse(req.body ); // validação dos dados com zod

    let codigoUnico; // variável para armazenar o código único gerado
    let codigoExiste = true; // variável para verificar se o código é único

    while (codigoExiste) {// função q gera um código único e verifica se já existe no banco de dados, se existir, gera outro até encontrar um código único
  codigoUnico = gerarCodigoFormatado();
  const planoExistente = await WorkoutPlan.findOne({ shareCode: codigoUnico }); // verifica se já existe um plano com o código gerado
  codigoExiste = !!planoExistente; // se existir, repete o loop
}
      const plan = await WorkoutPlan.create({ // cria o plano de treino no banco de dados com os dados validados e o usuário logado
      user: req.user.id, // associa o plano de treino ao usuário logado
      name: validateData.name, // nome do plano de treino vindo do body
      days: validateData.days, // dias do plano de treino vindo do body
      shareCode: codigoUnico // codigo unico gerado para o plano de treino
    });
    res.status(201).json({
      message: "Plano de treino criado com sucesso",
      plan
    });
    } catch (error) { // tratamento de erros
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
exports.getWorkoutPlans = async (req, res) => { // busca os planos de treino do usuário logado
  try {
    const plans = await WorkoutPlan.find({ user: req.user.id }); // busca os planos de treino do usuário logado no banco de dados
    res.json(plans);
  } catch (error) { // tratamento de erros
    console.log(error);
    return res.status(500).json({ message: "Erro ao buscar planos de treino" });
  }
};


// ADICIONAR EXERCÍCIO AO PLANO
exports.addExerciseToPlan = async (req, res) => {
  try {
    const { planId } = req.params; // recebe o id do plano de treino pela rota
    const { dayName, ...exerciseData } = req.body; // recebe o nome do dia e os dados do exercício pelo corpo da requisição
    const result = exerciseSchema.parse(exerciseData); // validação dos dados do exercício com zod
    
    // usando findOneAndUpdate com $push para adicionar o exercício no array do dia encontrado, buscando o dia pelo nome (case insensitive)
    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { 
        _id: planId,
        user: req.user.id,
        "days.name": { $regex: new RegExp(`^${dayName}$`, 'i') } // busca o dia pelo nome
      },
      { 
        $push: { 
          "days.$.exercises": result // adiciona o exercício no array do dia encontrado
        } 
      },
      { returnDocument: 'after', runValidators: true } // retorna o documento atualizado
    );

    if (!workoutPlan) { // se o plano ou dia não for encontrado, retorna erro 404
      return res.status(404).json({ message: "Plano ou dia não encontrado" });
    }

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
    
    // usando findOneAndUpdate com arrayFilters para atualizar no array do dia e exercício encontrados
    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { 
        _id: planId,
        user: req.user.id
      },
      { 
        $set: { 
          "days.$[day].exercises.$[exercise].weight": result.weight // atualiza apenas o peso do exercício específico
        } 
      },
      { 
        arrayFilters: [
          { "day.name": { $regex: new RegExp(`^${day}$`, 'i') } }, // filtra o dia pelo nome > case insensitive)
          { "exercise.name": { $regex: new RegExp(`^${exerciseName}$`, 'i') } } // filtra o exercício pelo nome > case insensitive
        ],
        returnDocument: 'after', // retorna o documento atualizado
        runValidators: true 
      }
    );

    if (!workoutPlan) { // se o plano não for encontrado, retorna erro 404
      return res.status(404).json({
        message: "Plano não encontrado"
      });
    }

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
    const workoutPlan = await WorkoutPlan.findOneAndUpdate({ // busca o plano de treino pelo id e pelo usuário logado
      _id: planId,
      user: req.user.id,
      "days.name": { $regex: new RegExp(`^${day}$`, 'i') } // busca o dia dentro do plano de treino pelo nome do dia, ignorando maiúsculas e minúsculas
      },
      { 
        $pull: { 
          "days.$.exercises": {  
            name: { $regex: new RegExp(`^${exerciseName}$`, 'i') } 
          } 
        } 
      },
      { returnDocument: 'after', runValidators: true } // retorna o documento atualizado e executa as validações do schema do Mongoose
    );
    if (!workoutPlan) { // se o plano não for encontrado, retorna erro 404
      return res.status(404).json({
        message: "Plano não encontrado"
      });
    }
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
    
    // usando findOneAndUpdate para atualizar o nome atomicamente
    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: planId, user: req.user.id }, // busca o plano pelo id e pelo usuário logado
      { $set: { name } }, // atualiza o nome do plano
      { returnDocument: 'after', runValidators: true } // retorna o documento atualizado
    );
    
    // Se o plano não for encontrado, retorna erro 404
    if (!workoutPlan) {
      return res.status(404).json({
        message: "Plano não encontrado"
      });
    }
    
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

// EDITAR EXERCÍCIO DENTRO DE UM DIA DO PLANO 
exports.updateExerciseInPlan = async (req, res) => {
  try {
    // Valida os parâmetros da rota: ID do plano, nome do dia e nome do exercício
    const { planId, day, exerciseName } = deleteExerciseSchema.parse(req.params);
    
    // Valida os dados do exercício que serão atualizados q vem do body
    const updateData = updateExerciseSchema.parse(req.body);
    
    // prepara os campos para atualização dinâmica
    const updateFields = {};
    if (updateData.name !== undefined) updateFields["days.$[day].exercises.$[exercise].name"] = updateData.name;
    if (updateData.sets !== undefined) updateFields["days.$[day].exercises.$[exercise].sets"] = updateData.sets;
    if (updateData.reps !== undefined) updateFields["days.$[day].exercises.$[exercise].reps"] = updateData.reps;
    if (updateData.weight !== undefined) updateFields["days.$[day].exercises.$[exercise].weight"] = updateData.weight;
    
    // usando findOneAndUpdate com arrayFilters para atualizar atomicamente
    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: planId, user: req.user.id },
      { $set: updateFields },
      { 
        arrayFilters: [
          { "day.name": { $regex: new RegExp(`^${day}$`, 'i') } }, // filtra o dia pelo nome (case insensitive)
          { "exercise.name": { $regex: new RegExp(`^${exerciseName}$`, 'i') } } // filtra o exercício pelo nome (case insensitive)
        ],
        returnDocument: 'after', // retorna o documento atualizado
        runValidators: true 
      }
    );
    
    // Se o plano não for encontrado, retorna erro 404
    if (!workoutPlan) {
      return res.status(404).json({
        message: "Plano não encontrado"
      });
    }
    
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
    const { planId, day } = updateDayParamsSchema.parse(req.params);
    const { name: newDayName } = updateDaySchema.parse(req.body);
    
    // primeiro verifica se o dia com o novo nome já existe (para evitar duplicação)
    const existingPlan = await WorkoutPlan.findOne({
      _id: planId,
      user: req.user.id,
      "days.name": { $regex: new RegExp(`^${newDayName}$`, 'i') }
    });
    
    if (existingPlan) {
      return res.status(400).json({ message: "Já existe um dia com este nome neste plano" });
    }
    
    // usando findOneAndUpdate com arrayFilters para atualizar atomicamente
    const workoutPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: planId, user: req.user.id },
      { $set: { "days.$[day].name": newDayName } },
      { 
        arrayFilters: [
          { "day.name": { $regex: new RegExp(`^${day}$`, 'i') } } // filtra o dia pelo nome original (case insensitive)
        ],
        returnDocument: 'after', // retorna o documento atualizado
        runValidators: true 
      }
    );
    
    if (!workoutPlan) { // Se o plano não for encontrado, retorna erro 404
      return res.status(404).json({
        message: "Plano não encontrado"
      });
    }
    
    res.json({
      message: "Dia atualizado com sucesso!",
      workoutPlan
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) { /// Tratamento de erro de validação do Zod
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
    
    // busca o plano para verificar se os dias existem
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
    const reorderedDays = daysOrder.map(dayName => 
      workoutPlan.days.find(d => d.name === dayName)
    );
    
    // usando findOneAndUpdate para atualizar atomicamente
    const updatedPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: planId, user: req.user.id },
      { $set: { days: reorderedDays } },
      { returnDocument: 'after', runValidators: true }
    );
    
    res.json({
      message: "Ordem dos dias atualizada com sucesso!",
      workoutPlan: updatedPlan
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
    
    // Busca o plano para validação
    const plan = await WorkoutPlan.findOne({ _id: planId, user: req.user.id });
    if (!plan) {
      return res.status(404).json({ message: "Plano não encontrado" });
    }
    
    // Verifica se o dia já existe (case insensitive)
    const dayExists = plan.days.some(d => d.name.toLowerCase() === name.toLowerCase());
    if (dayExists) {
      return res.status(400).json({ message: "Já existe um dia com este nome neste plano" });
    }
    
    // Adiciona o dia usando findOneAndUpdate com $push
    const updatedPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: planId, user: req.user.id },
      { $push: { days: { name, exercises } } },
      { returnDocument: 'after', runValidators: true }
    );
    
    res.json({ message: "Dia adicionado com sucesso!", workoutPlan: updatedPlan });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Erro de validação", detalhes: error.flatten().fieldErrors });
    }
    console.log(error);
    res.status(500).json({ message: "Erro ao adicionar dia" });
  }
};

// DELETAR DIA DO PLANO
exports.deleteDayFromPlan = async (req, res) => {
  try {
    const { planId, dayName } = deleteDaySchema.parse(req.params);
    
    // Remove o dia usando findOneAndUpdate com $pull
    const updatedPlan = await WorkoutPlan.findOneAndUpdate(
      { _id: planId, user: req.user.id },
      { $pull: { days: { name: dayName } } },
      { returnDocument: 'after', runValidators: true }
    );
    
    if (!updatedPlan) {
      return res.status(404).json({ message: "Plano não encontrado" });
    }
    
    res.json({ message: "Dia excluído com sucesso!", workoutPlan: updatedPlan });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Erro de validação", detalhes: error.flatten().fieldErrors });
    }
    console.log(error);
    res.status(500).json({ message: "Erro ao excluir dia" });
  }
};


// COPIAR PLANO DE TREINO USANDO O SHARE CODE (nova função)
exports.createPlanShareCode = async (req, res) => {
  try { 
    // Validação corrigida: passamos req.params para o parse para o Zod encontrar a chave shareCode
    const { shareCode } = shareCodeSchema.parse({ shareCode: req.params.shareCode }); // validação do shareCode com zod
    
    const workoutPlan = await WorkoutPlan.findOne({ shareCode })
    if (!workoutPlan) {
      return res.status(404).json({ message: "Plano de treino nao encontrado" });
    }
    // cria uma copia de plano de trei no para o usuario atual
    const daysCopy = workoutPlan.days.map(day => {
      return {
        name: day.name,
        exercises: day.exercises.map(exer => {
          return {
            name: exer.name,
            sets: exer.sets,
            reps: exer.reps,
            weight: exer.weight,
            pr: null // tirei o PR (Personal Record) da copia pq e algo individual de pessoa pra pessoa
          }
        })
      }
    });
    let codigoUnico;
    let codigoExiste = true;

    while (codigoExiste) { // Gera um código único e verifica se já existe no banco de dados, se existir, gera outro até encontrar um código único
      codigoUnico = gerarCodigoFormatado();
      const planoExistente = await WorkoutPlan.findOne({ shareCode: codigoUnico });
      codigoExiste = !!planoExistente; // se existir, repete o loop
    }
    const newPlan = await WorkoutPlan.create({ // cria o plano de treino com os dados copiados e o usuário logado
      user: req.user.id,
      name: workoutPlan.name,
      days: daysCopy,
      shareCode: codigoUnico
    });
    res.status(201).json({ message: "Plano de treino criado com sucesso!", plan: newPlan }); // retorna o plano criado
  } catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
      return res.status(400).json({ error: "Erro de validação", detalhes: error.flatten().fieldErrors });
    }
    console.log(error);
    return res.status(500).json({ message: "Erro ao criar plano de treino" }); // retorna erro genérico para outros erros
  }
}