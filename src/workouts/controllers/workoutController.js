// Model de treinos executados
const Workout = require("../../models/Workout");
// CORREÇÃO: Importando o modelo correto para histórico
const WorkoutHistory = require("../../models/WorkoutHistory");

// Lista de exercícios base usada para gerar treinos automaticamente
const exercises = require("../../data/exercises");

// Função q pega exercícios aleatórios de uma lista, usada para montar os treinos automáticos
function getRandomExercises(list, count) {
  return list.sort(() => 0.5 - Math.random()).slice(0, count);
}

//=============================gerar treino automático baseado no objetivo e número de dias


exports.generateWorkout = async (req, res) => {
  const { goal, days } = req.body;

  // verifica se o número de dias foi informado
  if (!days) {
    return res.status(400).json({
      error: "days é obrigatório",
    });
  }

  // Limita o número de dias permitidos
  if (days < 2 || days > 6) {
    return res.status(400).json({
      error: "days deve ser entre 2 e 6",
    });
  }

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
};

// BUSCAR TREINOS DO USUÁRIO
exports.getMyWorkouts = async (req, res) => {
  try {
    // retorna todos os treinos do usuário logado
    const workouts = await Workout.find({ user: req.user.id });

    res.json(workouts);
  } catch (error) {
    res.status(500).json({
      message: "Erro ao buscar treinos",
    });
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
    res.status(500).json({
      message: "Erro ao buscar histórico de treinos",
    });
  }
};

// CALCULAR PR (PERSONAL RECORD) 
exports.getPR = async (req, res) => {
  const { exercise } = req.query;

  // exige o nome do exercício
  if (!exercise) {
    return res.status(400).json({
      message: "Nome do exercício é obrigatório",
    });
  }

  try {
    //Busca do WorkoutHistory em vez do Workout
    const workouts = await WorkoutHistory.find({ user: req.user.id });

    let maxWeight = 0;

    // percorre todos os treinos
    workouts.forEach((workout) => {
      //Acessa exerciseName diretamente (não tem array exercises)
      if (
        workout.exerciseName &&
        workout.exerciseName.toLowerCase() === exercise.toLowerCase()
      ) {
        // CORREÇÃO: Acessa weight diretamente
        if (workout.weight && workout.weight > maxWeight) {
          maxWeight = workout.weight;
        }
      }
    });

    res.json({
      exercise,
      personalRecord: maxWeight,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao calcular PR",
    });
  }
};

// REGISTRAR TREINO EXECUTADO 
exports.logWorkout = async (req, res) => {
  const { exercises } = req.body;

  // CORREÇÃO: Validação básica
  if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
    return res.status(400).json({
      message: "É necessário enviar pelo menos um exercício",
    });
  }

  try {
    
    const savedExercises = []; // para armazenar os exercícios salvos no banco

    for (const exercise of exercises) {
      // Se o exercício tiver múltiplas séries
      if (exercise.sets && Array.isArray(exercise.sets)) {
        for (const set of exercise.sets) {
          // CORREÇÃO: Usa WorkoutHistory em vez de Workout
          const workoutEntry = new WorkoutHistory({
            user: req.user.id,
            exerciseName: exercise.name,
            weight: set.weight || 0,
            reps: set.reps || 0,
            date: new Date(),
          });

          const saved = await workoutEntry.save();
          savedExercises.push(saved);
        }
      } else {
        // Se for um único registro
        //Usa WorkoutHistory em vez de Workout
        const workoutEntry = new WorkoutHistory({
          user: req.user.id,
          exerciseName: exercise.name,
          weight: exercise.weight || 0,
          reps: exercise.reps || 0,
          date: new Date(),
        });

        const saved = await workoutEntry.save();
        savedExercises.push(saved);
      }
    }

    res.json({
      message: "Treino registrado com sucesso",
      count: savedExercises.length,
      exercises: savedExercises,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erro ao registrar treino",
    });
  }
};
