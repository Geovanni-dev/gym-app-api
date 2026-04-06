// Model de treinos executados
const Workout = require("../../models/Workout");
// Importando o modelo do historico
const WorkoutHistory = require("../../models/WorkoutHistory");
// Lista de exercícios base usada para gerar treinos automaticamente
const exercises = require("../../data/exercises");
// Importa o zod para validação de dados
const { z } = require("zod"); 

// Função q pega exercícios aleatórios de uma lista, usada para montar os treinos automáticos
function getRandomExercises(list, count) {
  return list.sort(() => 0.5 - Math.random()).slice(0, count);
}

//===============================validação de dados com zod

const generateWorkoutSchema = z.object({
  goal: z.enum(["forca", "resistencia", "hipertrofia"]).default("hipertrofia"), // objetivo do treino
  days: z.number({required_error: "days é obrigatório"}).min(2, "days deve ser entre 2 e 6").max(6, "days deve ser entre 2 e 6"), // número de dias de treino na semana
});

const getPRSchema = z.object({
  exercise: z.string().min(1, "O nome do exercício é obrigatório").transform((val) => decodeURIComponent(val)), // nome do exercício para calcular o PR, decodificado para permitir caracteres especiais
});

const setSchema = z.object({
    reps: z.coerce.number().min(0, "Reps deve ser um número positivo"),
    weight: z.number().min(0, "Weight deve ser um número positivo")
  });

const exerciseSchema = z.object({
    name: z.string().min(1, "O nome do exercício é obrigatório"),
    sets: z.array(setSchema).optional(),
    reps: z.coerce.number().optional(),
    weight: z.number().optional() // para permitir tanto sets com peso quanto registros únicos
  });

const logWorkoutSchema = z.object({
  exercises: z.array(exerciseSchema).min(1, "É necessário enviar pelo menos um exercício")
});

const deleteWorkoutSchema = z.object({
  id: z.string().min(1, "O id do treino é obrigatório")
});

//=============================gerar treino automático baseado no objetivo e número de dias

// Função para gerar um treino automático
exports.generateWorkout = async (req, res) => {
  try {
  const { goal, days } = generateWorkoutSchema.parse(req.body); // validação dos dados com zod

  let sets;
  let reps;

  // Define a estrutura do treino com base no objetivo
  if (goal === "forca") {
    sets = 5;
    reps = "3-5";
  } else if (goal === "resistencia") {
    sets = 4;
    reps = "12-15";
  } else {
    // padrão: hipertrofia
    sets = 3;
    reps = "8-12";
  }

  let split;

  // Divide o treino dependendo da quantidade de dias
  if (days === 4) {
    // divisão Upper / Lower
    split = [
      { day: "Upper", exercises: getRandomExercises(exercises.upper, 3) },
      { day: "Lower", exercises: getRandomExercises(exercises.lower, 3) },
      { day: "Upper", exercises: getRandomExercises(exercises.upper, 3) },
      { day: "Lower", exercises: getRandomExercises(exercises.lower, 3) },
    ];
  } else if (days === 3) {
    // divisão clássica Push Pull Legs
    split = [
      { day: "Push", exercises: getRandomExercises(exercises.push, 3) },
      { day: "Pull", exercises: getRandomExercises(exercises.pull, 3) },
      { day: "Legs", exercises: getRandomExercises(exercises.legs, 3) },
    ];
  } else {
    // fallback: treino full body
    split = [
      {
        day: "Full Body",
        exercises: [
          ...getRandomExercises(exercises.upper, 2),
          ...getRandomExercises(exercises.lower, 2),
        ],
      },
    ];
  }

  // Cria o documento do treino no banco
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
    message: "Treino criado e salvo",
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

// BUSCAR TREINOS DO USUÁRIO
exports.getMyWorkouts = async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user.id });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar treinos" });
  }
};

// HISTÓRICO DE TREINOS 
exports.getWorkoutHistory = async (req, res) => {
  try {
    // Busca do WorkoutHistory em vez do Workout
    const workouts = await WorkoutHistory.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(20);
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar histórico de treinos" });
  }
};

// CALCULAR PR (PERSONAL RECORD) 
exports.getPR = async (req, res) => {
    try {
    const { exercise } = getPRSchema.parse(req.query); 
    const record = await WorkoutHistory.findOne({
    user: req.user.id ,
    exerciseName: new RegExp(`^${exercise}$`, "i"), }).sort({ weight: -1 }); // ordena por peso para pegar o maior
    res.json({
      exercise,
      personalRecord: record ? record.weight: 0,});
  } catch (error) {
      if (error instanceof z.ZodError) {     
        return res.status(400).json({ error: "Erro de validação", detalhes: error.flatten().fieldErrors });
        }
        console.log(error); 
        res.status(500).json({ message: "Erro ao buscar PR" });
    }
};

// REGISTRAR TREINO EXECUTADO 
exports.logWorkout = async (req, res) => {
  try {
    const { exercises } = logWorkoutSchema.parse(req.body); // validação com zod
    const savedExercises = []; 
    for (const exercise of exercises) {
      if (exercise.sets && exercise.sets.length > 0) {
        const entries = exercise.sets.map((set) => ({
            user: req.user.id,
            exerciseName: exercise.name,
            weight: set.weight || 0,
            reps: set.reps || 0,
          }));
          const saved = await WorkoutHistory.insertMany(entries); // salva todas as séries de uma vez
          savedExercises.push(...saved);
      } else {
        const saved = await WorkoutHistory.create({
          user: req.user.id,
          exerciseName: exercise.name,
          weight: exercise.weight || 0,
          reps: exercise.reps || 0,
        });
        savedExercises.push(saved);
      }
    }
    res.json({
      message: "Treino registrado com sucesso",
      count: savedExercises.length});
  } catch (error) {
    if (error instanceof z.ZodError) { 
      return res.status(400).json({ error: "Erro de validação", detalhes: error.flatten().fieldErrors });
      }
      console.log(error); 
      res.status(500).json({ message: "Erro ao registrar treino" });
  }
};

// EXCLUIR TREINO
exports.deleteWorkouts = async (req, res) => { 
  try { 
    const { id } = deleteWorkoutSchema.parse(req.params); // recebe o id do treino pela rota
    const workout = await Workout.findOne({ _id: id, user: req.user.id }); 
    if (!workout) { 
      return res.status(404).json({ message: "Treino nao encontrado" });
    }
    await workout.deleteOne(); 
    res.json({ message: "Treino excluido com sucesso" });
  } catch (error) { 
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Erro de validação", detalhes: error.flatten().fieldErrors });
    }
    console.log(error); 
    res.status(500).json({ message: "Erro ao excluir treino" });
  }
};
