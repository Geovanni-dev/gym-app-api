// Modelo responsável pelos exercícios cadastrados no sistema
const Exercise = require("../../models/Exercise");
const { z } = require("zod"); 


//scheema para criar/buscar exercicios
const createExerciseSchema = z.object({
  name: z.string().min(1, "O nome do exercício é obrigatório"),
  muscle: z.string().optional(),
});

// schema para deletar exercício
const deleteExerciseSchema = z.object({
  id: z.string().min(1, "O ID do exercício é obrigatório"),
});



/* por enquanto nao implementei endpoint ao front, em atualizaçoes futuras 
pretendo implementar, foi a primeira rota que criei (tava meio sem ideias, so sabia
que seria um app de academia pra portifolio e uso pessoal)*/



//========================================= Exercicios do usuário



// CRIAÇÃO DE EXERCÍCIO
exports.createExercise = async (req, res) => {

  try {
    const validateData = createExerciseSchema.parse(req.body);// Cria um novo exercício associando ao usuário logado
    const exercise = await Exercise.create({
      user: req.user.id,
      ...validateData
    });

    res.status(201).json({
      message: "Exercício criado com sucesso",
      exercise
    });
  } catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
      return res.status(400).json({ error: "Erro de validação", 
          detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
      });
      }
      console.log(error); // se n for do zod
      return res.status(500).json({ message: "Erro ao criar exercício" });
  }
};


// LISTAR EXERCÍCIOS DO USUÁRIO
exports.getExercises = async (req, res) => {
  try {
  const exercises = await Exercise.find({ user: req.user.id });
  const validExercises = z.array(createExerciseSchema).parse(exercises); // validação dos dados com zod

  res.json(validExercises);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Erro ao listar exercícios" });
  }
};



// DELETAR EXERCÍCIO.
exports.deleteExercise = async (req, res) => {
  try {
    const { id } = deleteExerciseSchema.parse(req.params); // validação dos dados com zod
    await Exercise.findByIdAndDelete(id);
    res.json({ message: "Exercício deletado com sucesso" });
  }catch (error) {
    if (error instanceof z.ZodError) { // se o erro for do zod
      return res.status(400).json({ error: "Erro de validação", 
          detalhes: error.flatten().fieldErrors // funçao para imprimir os erros
      });
      }
      console.log(error); // se n for do zod
      return res.status(500).json({ message: "Erro ao deletar exercício" });
  }
};
