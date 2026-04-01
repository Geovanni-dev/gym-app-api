// Models responsáveis por armazenar os planos de treino e o histórico de execução
const WorkoutPlan = require("../../models/WorkoutPlan");
const WorkoutHistory = require("../../models/WorkoutHistory");
const { z } = require("zod");


//=============================================validação de dados com zod


// schema para criar/buscar planos de treino do usuário
const createPlanSchema = z.object({
  name: z.string().min(1, "O nome do plano é obrigatório"),
  days: z.array(z.object({
    name: z.string(),
    exercises: z.array(z.object({
      name: z.string(),
      sets: z.number(),
      reps: z.string(),
      weight: z.number()
    }))
  }))
});


// schema para validar a adição de um exercício ao plano
const exerciseSchema = z.object({
  name: z.string().min(1, "O nome do exercício é obrigatório"),
  sets: z.number().min(1, "O número de séries deve ser pelo menos 1"),
  reps: z.string().min(1, "O número de repetições é obrigatório"),
  weight: z.number().min(0, "O peso deve ser um número positivo")
});


const updateWeightSchema = z.object({
  weight: z.number().min(0, "O peso deve ser um número positivo")
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