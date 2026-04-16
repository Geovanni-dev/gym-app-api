// Model de treinos executados
const Workout = require("../../models/Workout");
// Importando o modelo do historico
const WorkoutHistory = require("../../models/WorkoutHistory");
// Lista de exercícios base usada para gerar treinos automaticamente
const exercises = require("../../data/exercises");
// Importa o zod para validação de dados
const { z } = require("zod"); 


//====================================== FUNÇÕES AUXILIARES


/* Função que pega exercícios aleatórios usada para montar os treinos automáticos */
function getRandomExercises(list, count) {
  return list.sort(() => 0.5 - Math.random()).slice(0, count);
}

// Função que pega exercícios aleatórios e transforma em objetos
function getRandomExercisesAsObjects(exerciseArray, count, sets, reps) {
  if (!exerciseArray || exerciseArray.length === 0) return [];
  
  // Embaralha a lista para não repetir sempre os mesmos exercícios
  const shuffled = [...exerciseArray];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Pega os primeiros count exercícios da lista embaralhada e transforma em objetos
  return shuffled.slice(0, count).map(ex => ({
    name: ex.name,
    sets: sets,
    reps: reps,
    weight: 0  // Começa com pr zero pois e individual
  }));
}


//======================================== VALIDAÇÕES COM ZOD 


// schema para criar um treino
const generateWorkoutSchema = z.object({
  goal: z.enum(["força", "resistência", "hipertrofia"]),
  days: z.number({required_error: "days é obrigatório"}).min(2, "days deve ser entre 2 e 6").max(6, "days deve ser entre 2 e 6"),
});

// schema para pegar o PR de um exercício
const getPRSchema = z.object({
  exercise: z.string().min(1, "O nome do exercício é obrigatório").transform((val) => decodeURIComponent(val)),
});

//schema para validar os dados de um set
const setSchema = z.object({
  reps: z.coerce.number().min(0, "Reps deve ser um número positivo"),
  weight: z.number().min(0, "Weight deve ser um número positivo")
});

// schema para validar os dados de um exercício
const exerciseSchema = z.object({
  name: z.string().min(1, "O nome do exercício é obrigatório"),
  sets: z.array(setSchema).optional(),
  reps: z.coerce.number().optional(),
  weight: z.number().optional(),
  workoutName: z.string().optional().nullable(),
});

// Valida os dados para criar um treino
const logWorkoutSchema = z.object({
  exercises: z.array(exerciseSchema).min(1, "É necessário enviar pelo menos um exercício")
});

// Valida os dados para deletar um treino
const deleteWorkoutSchema = z.object({
  Id: z.string().min(1, "O id do treino é obrigatório")
});

// Valida os dados para editar um PR
const updatePRSchema = z.object({
  workoutId: z.string().optional(),
  exerciseName: z.string().optional(),
  newPR: z.number().min(0, "O PR deve ser um número positivo")
}).refine(data => data.workoutId && data.exerciseName, {
  message: "É necessário fornecer workoutId e exerciseName"
});




//====================================== GERAR TREINO AUTOMÁTICO

// Gera um treino completo baseado no objetivo e na quantidade de dias
exports.generateWorkout = async (req, res) => {
  try {
    // Valida os dados que vieram do frontend
    const { goal, days } = generateWorkoutSchema.parse(req.body);

    let sets;
    let reps;

    // Define séries e repetições baseado no objetivo do usuário
    if (goal === "força") {
      sets = 5;
      reps = "3-5";      // Poucas repetições, muito peso
    } else if (goal === "resistência") {
      sets = 3;
      reps = "15-20";    // Muitas repetições, menos peso
    } else {
      sets = 4;
      reps = "8-12";     // Meio termo, hipertrofia
    }

    let split = [];
    
    if (days === 2) {
      // 2 dias: Fullbody A e Fullbody B (6 exercícios cada)
      split = [
        { 
          day: "Fullbody A - Força e Potência", 
          exercises: getRandomExercisesAsObjects(exercises.fullbody1, 6, sets, reps) 
        },
        { 
          day: "Fullbody B - Resistência e Hipertrofia", 
          exercises: getRandomExercisesAsObjects(exercises.fullbody2, 6, sets, reps) 
        }
      ];
    } 
    else if (days === 3) {
      // 3 dias: PPL 6 exercícios cada
      split = [
        { 
          day: "Push - Peito, Ombros e Tríceps", 
          exercises: getRandomExercisesAsObjects(exercises.push, 6, sets, reps) 
        },
        { 
          day: "Pull - Costas e Bíceps", 
          exercises: getRandomExercisesAsObjects(exercises.pull, 6, sets, reps) 
        },
        { 
          day: "Legs - Pernas Completas", 
          exercises: getRandomExercisesAsObjects(exercises.legs, 6, sets, reps) 
        }
      ];
    } 
    else if (days === 4) {
      // 4 dias: Upper/Lower 2x 
      split = [
        { 
          day: "Upper A - Força Superior", 
          exercises: getRandomExercisesAsObjects(exercises.upper, 6, sets, reps) 
        },
        { 
          day: "Lower A - Força Inferior", 
          exercises: getRandomExercisesAsObjects(exercises.lower, 6, sets, reps) 
        },
        { 
          day: "Upper B - Hipertrofia Superior", 
          exercises: getRandomExercisesAsObjects(exercises.upper, 6, sets, reps) 
        },
        { 
          day: "Lower B - Hipertrofia Inferior", 
          exercises: getRandomExercisesAsObjects(exercises.lower, 6, sets, reps) 
        }
      ];
    } 
    else if (days === 5) {
      // 5 dias: PPL  Upper  Lower (5 exercícios cada)
      split = [
        { 
          day: "Push - Peito, Ombros, Tríceps", 
          exercises: getRandomExercisesAsObjects(exercises.push, 5, sets, reps) 
        },
        { 
          day: "Pull - Costas e Bíceps", 
          exercises: getRandomExercisesAsObjects(exercises.pull, 5, sets, reps) 
        },
        { 
          day: "Legs - Pernas Completas", 
          exercises: getRandomExercisesAsObjects(exercises.legs, 5, sets, reps) 
        },
        { 
          day: "Upper - Superiores", 
          exercises: getRandomExercisesAsObjects(exercises.upper, 5, sets, reps) 
        },
        { 
          day: "Lower - Inferiores + Core", 
          exercises: getRandomExercisesAsObjects(exercises.lower, 5, sets, reps) 
        }
      ];
    } 
    else if (days >= 6) {
      // 6 dias: Peito, Costas, Pernas, Ombros, Braços, Posterior
      split = [
        { 
          day: "Dia A - Peito e Tríceps", 
          exercises: getRandomExercisesAsObjects(exercises.chest, 5, sets, reps) 
        },
        { 
          day: "Dia B - Costas e Bíceps", 
          exercises: getRandomExercisesAsObjects(exercises.back, 5, sets, reps) 
        },
        { 
          day: "Dia C - Quadríceps e Panturrilha", 
          exercises: getRandomExercisesAsObjects(exercises.quads, 5, sets, reps) 
        },
        { 
          day: "Dia D - Ombros e Trapézio", 
          exercises: getRandomExercisesAsObjects(exercises.shoulders, 5, sets, reps) 
        },
        { 
          day: "Dia E - Braços (Bíceps + Tríceps)", 
          exercises: getRandomExercisesAsObjects(exercises.arms, 5, sets, reps) 
        },
        { 
          day: "Dia F - Posterior e Glúteos", 
          exercises: getRandomExercisesAsObjects(exercises.posterior, 5, sets, reps) 
        }
      ];
    }

    // Adiciona um exercício de abdomen em todos os treinos (ninguém gosta, mas é necessário kkkkj)
    if (exercises.abs) {
      split.forEach(day => {
        const absExercises = getRandomExercisesAsObjects(exercises.abs, 1, sets, reps);
        if (absExercises.length > 0) {
          day.exercises.push(...absExercises);
        }
      });
    }

    // Cria o documento no banco de dados
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
      return res.status(400).json({ error: "Erro de validação", detalhes: error.flatten().fieldErrors });
    }
    console.log(error);
    res.status(500).json({ message: "Erro ao gerar treino" });
  }
};

//================================== BUSCAR TODOS OS TREINOS DO USUÁRIO

// Retorna todos os treinos gerados pelo usuário (os automáticos)
exports.getMyWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar treinos" });
  }
};


//=======================================HISTÓRICO DE TREINOS EXECUTADOS

// Retorna os últimos 20 treinos que o user finalizou
exports.getWorkoutHistory = async (req, res) => {
  try {
    const workouts = await WorkoutHistory.find({ user: req.user.id })
      .sort({ date: -1 })  // Os mais recentes primeiro
      .limit(20);           // Limitei em 20 para não sobrecarregar
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar histórico de treinos" });
  }
};

//======================================CALCULAR PR (PERSONAL RECORD) DO EXERCÍCIO


/*Busca o maior peso que o usuário já fez em um exercício específico,
procura tanto nos treinos automáticos quanto nos manuais.
OBS: se o exercício for supino, ele vai encontrar Supino, SUPINO,*/
exports.getPR = async (req, res) => {
  try {
    // Valida se o nome do exercício foi enviado
    const { exercise } = getPRSchema.parse(req.query);
    
    // Cria uma regex que ignora maiúsculo/minúsculo
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchTerm = escapeRegex(exercise.trim());
    const caseInsensitiveRegex = new RegExp(`^${searchTerm}$`, 'i');
    
    let maxWeight = 0;
    let foundInWorkouts = false;
    let foundInPlans = false;
    
    // busca nos treinos gerados automaticamente, workouts
    const workouts = await Workout.find({ user: req.user.id });
    
    workouts.forEach(workout => {
      workout.split?.forEach(day => {
        day.exercises?.forEach(ex => {
          if (ex.name && caseInsensitiveRegex.test(ex.name) && ex.weight > maxWeight) {
            maxWeight = ex.weight;
            foundInWorkouts = true;
          }
        });
      });
    });
    
    //busca tbm nos planos de treino criados manualmente
    const WorkoutPlan = require("../../models/WorkoutPlan");
    const plans = await WorkoutPlan.find({ user: req.user.id });
    
    plans.forEach(plan => {
      plan.days?.forEach(day => {
        day.exercises?.forEach(ex => {
          if (ex.name && caseInsensitiveRegex.test(ex.name) && ex.weight > maxWeight) {
            maxWeight = ex.weight;
            foundInPlans = true;
          }
        });
      });
    });
    
    // Retorna o resultado com informações sobre o exercício
    res.json({ 
      exercise: exercise.trim(),
      personalRecord: maxWeight,
      found: maxWeight > 0,
      source: foundInWorkouts ? (foundInPlans ? "both" : "workouts") : (foundInPlans ? "workoutplans" : "none")
    });
    
  } catch (error) { // se o erro for do zod
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Erro de validação", 
        detalhes: error.flatten().fieldErrors 
      });
    }
    
    console.error("Erro ao buscar PR:", error); // se for outro erro
    res.status(500).json({ message: "Erro ao buscar PR", error: error.message });
  }
};


//=========================================REGISTRAR TREINO EXECUTADO ESTANDO LOGADO


// Salva no histórico os exercícios que o usuário completou
exports.logWorkout = async (req, res) => {
  try {
    const { exercises } = logWorkoutSchema.parse(req.body); // Valida os dados com zod
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
      message: "Treino registrado com sucesso!",
      count: savedExercises.length
    });
  } catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
      return res.status(400).json({ error: "Erro de validação", detalhes: error.flatten().fieldErrors });
    }
    console.log(error); // se for outro erro
    res.status(500).json({ message: "Erro ao registrar treino" });
  }
};


//==============================EXCLUIR TREINO GERADO

// Remove um treino automático que o usuário não quer mais
exports.deleteWorkouts = async (req, res) => { 
  try { 
    const { Id } = deleteWorkoutSchema.parse(req.params);
    const workout = await Workout.findOne({ _id: Id, user: req.user.id }); 
    
    if (!workout) { 
      return res.status(404).json({ message: "Treino não encontrado" });
    }
    
    await workout.deleteOne(); 
    res.json({ message: "Treino excluído com sucesso" });
  } catch (error) { 
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Erro de validação", detalhes: error.flatten().fieldErrors });
    }
    console.log(error); 
    res.status(500).json({ message: "Erro ao excluir treino" });
  }
};


// ================================EDITAR PR DE UM EXERCÍCIO


// Atualiza o peso pr de um exercício específico dentro de um treino gerado
exports.updatePR = async (req, res) => {
  try {
    const { workoutId, exerciseName, newPR } = updatePRSchema.parse(req.body);
    
    // Busca o treino do usuário
    const workout = await Workout.findOne({ 
      _id: workoutId, 
      user: req.user.id 
    });
    
    if (!workout) {
      return res.status(404).json({ message: "Treino não encontrado" });
    }
    
    // Procura o exercício pelo nome e atualiza o peso
    let exerciseFound = false;
    
    workout.split.forEach(day => {
      day.exercises.forEach(exercise => {
        if (exercise.name === exerciseName) {
          exercise.weight = newPR;
          exerciseFound = true;
        }
      });
    });
    
    if (!exerciseFound) {
      return res.status(404).json({ message: `Exercício "${exerciseName}" não encontrado no treino` });
    }
    
    await workout.save();
    
    res.json({  // retorna o exercício que foi atualizado
      message: "PR atualizado com sucesso ",
      workout: {
        id: workout._id,
        exerciseName,
        newWeight: newPR
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
      return res.status(400).json({ 
        error: "Erro de validação", 
        detalhes: error.flatten().fieldErrors 
      });
    }
    
    console.error("Erro no updatePR:", error); // se for outro erro
    res.status(500).json({ message: "Erro ao atualizar PR" });
  }
};
