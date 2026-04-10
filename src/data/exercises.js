const exercises = {
  // ========== EXERCÍCIOS FULLBODY ==========
  fullbody1: [
    { name: "Agachamento Livre", sets: 4, reps: "8-10", weight: 0 },
    { name: "Supino Reto com Barra", sets: 4, reps: "8-10", weight: 0 },
    { name: "Remada Curvada", sets: 4, reps: "8-12", weight: 0 },
    { name: "Desenvolvimento Militar", sets: 3, reps: "10-12", weight: 0 },
    { name: "Stiff", sets: 3, reps: "10-12", weight: 0 },
    { name: "Rosca Direta", sets: 3, reps: "10-12", weight: 0 }
  ],
  fullbody2: [
    { name: "Leg Press 45°", sets: 4, reps: "10-12", weight: 0 },
    { name: "Supino Inclinado com Halteres", sets: 4, reps: "8-10", weight: 0 },
    { name: "Puxada Alta Aberta", sets: 4, reps: "8-10", weight: 0 },
    { name: "Elevação Lateral", sets: 3, reps: "12-15", weight: 0 },
    { name: "Mesa Flexora", sets: 3, reps: "10-12", weight: 0 },
    { name: "Tríceps Corda", sets: 3, reps: "10-12", weight: 0 }
  ],

  // ========== EXERCÍCIOS PUSH (Peito, Ombro, Tríceps) ==========
  push: [
    { name: "Supino Reto com Barra", sets: 4, reps: "6-8", weight: 0 },
    { name: "Supino Inclinado com Halteres", sets: 4, reps: "8-10", weight: 0 },
    { name: "Crucifixo Máquina (Peck Deck)", sets: 3, reps: "10-12", weight: 0 },
    { name: "Desenvolvimento Militar", sets: 4, reps: "8-10", weight: 0 },
    { name: "Desenvolvimento Arnold", sets: 3, reps: "10-12", weight: 0 },
    { name: "Elevação Lateral", sets: 3, reps: "12-15", weight: 0 },
    { name: "Elevação Frontal", sets: 3, reps: "12-15", weight: 0 },
    { name: "Tríceps Corda no Cross", sets: 3, reps: "10-12", weight: 0 },
    { name: "Tríceps Testa com Barra", sets: 3, reps: "8-10", weight: 0 },
    { name: "Tríceps Francês", sets: 3, reps: "10-12", weight: 0 },
    { name: "Mergulho no Banco", sets: 3, reps: "12-15", weight: 0 }
  ],

  // ========== EXERCÍCIOS PULL (Costas, Bíceps, Posterior) ==========
  pull: [
    { name: "Barra Fixa", sets: 4, reps: "6-10", weight: 0 },
    { name: "Puxada Alta Aberta", sets: 4, reps: "8-10", weight: 0 },
    { name: "Puxada Triângulo", sets: 3, reps: "10-12", weight: 0 },
    { name: "Remada Curvada", sets: 4, reps: "8-10", weight: 0 },
    { name: "Remada Serrote", sets: 3, reps: "10-12", weight: 0 },
    { name: "Remada Cavalinho", sets: 3, reps: "10-12", weight: 0 },
    { name: "Pull Down (Corda)", sets: 3, reps: "10-12", weight: 0 },
    { name: "Crucifixo Inverso", sets: 3, reps: "12-15", weight: 0 },
    { name: "Rosca Direta com Barra", sets: 3, reps: "8-10", weight: 0 },
    { name: "Rosca Alternada com Halteres", sets: 3, reps: "10-12", weight: 0 },
    { name: "Rosca Martelo", sets: 3, reps: "10-12", weight: 0 },
    { name: "Rosca Concentrada", sets: 3, reps: "12-15", weight: 0 }
  ],

  // ========== EXERCÍCIOS LEGS (Pernas completas) ==========
  legs: [
    { name: "Agachamento Livre", sets: 4, reps: "6-8", weight: 0 },
    { name: "Leg Press 45°", sets: 4, reps: "10-12", weight: 0 },
    { name: "Hack Machine", sets: 3, reps: "8-10", weight: 0 },
    { name: "Cadeira Extensora", sets: 3, reps: "10-12", weight: 0 },
    { name: "Mesa Flexora", sets: 3, reps: "10-12", weight: 0 },
    { name: "Stiff", sets: 4, reps: "8-10", weight: 0 },
    { name: "Cadeira Flexora", sets: 3, reps: "10-12", weight: 0 },
    { name: "Afundo com Halteres", sets: 3, reps: "10-12", weight: 0 },
    { name: "Agachamento Sumô", sets: 3, reps: "8-10", weight: 0 },
    { name: "Abdução de Quadril", sets: 3, reps: "15-20", weight: 0 },
    { name: "Panturrilha em Pé", sets: 4, reps: "15-20", weight: 0 },
    { name: "Panturrilha Sentado", sets: 4, reps: "15-20", weight: 0 }
  ],

  // ========== EXERCÍCIOS UPPER (Superiores) ==========
  upper: [
    { name: "Supino Reto com Barra", sets: 4, reps: "6-8", weight: 0 },
    { name: "Supino Inclinado com Halteres", sets: 4, reps: "8-10", weight: 0 },
    { name: "Desenvolvimento Militar", sets: 4, reps: "8-10", weight: 0 },
    { name: "Remada Curvada", sets: 4, reps: "8-10", weight: 0 },
    { name: "Puxada Alta Aberta", sets: 4, reps: "8-10", weight: 0 },
    { name: "Elevação Lateral", sets: 3, reps: "12-15", weight: 0 },
    { name: "Rosca Direta com Barra", sets: 3, reps: "8-10", weight: 0 },
    { name: "Tríceps Corda no Cross", sets: 3, reps: "10-12", weight: 0 },
    { name: "Crucifixo Máquina", sets: 3, reps: "10-12", weight: 0 },
    { name: "Remada Baixa", sets: 3, reps: "10-12", weight: 0 }
  ],

  // ========== EXERCÍCIOS LOWER (Inferiores) ==========
  lower: [
    { name: "Agachamento Livre", sets: 4, reps: "6-8", weight: 0 },
    { name: "Leg Press 45°", sets: 4, reps: "10-12", weight: 0 },
    { name: "Cadeira Extensora", sets: 3, reps: "10-12", weight: 0 },
    { name: "Stiff", sets: 4, reps: "8-10", weight: 0 },
    { name: "Mesa Flexora", sets: 3, reps: "10-12", weight: 0 },
    { name: "Panturrilha em Pé", sets: 4, reps: "15-20", weight: 0 },
    { name: "Afundo com Halteres", sets: 3, reps: "10-12", weight: 0 }
  ],

  // ========== EXERCÍCIOS PARA ABCDEF (6 dias) ==========
  // Dia A - Peito
  chest: [
    { name: "Supino Reto com Barra", sets: 4, reps: "6-8", weight: 0 },
    { name: "Supino Inclinado com Halteres", sets: 4, reps: "8-10", weight: 0 },
    { name: "Crucifixo Máquina", sets: 3, reps: "10-12", weight: 0 },
    { name: "Supino Declinado", sets: 3, reps: "8-10", weight: 0 },
    { name: "Crossover no Cross", sets: 3, reps: "12-15", weight: 0 },
    { name: "Peck Deck", sets: 3, reps: "10-12", weight: 0 }
  ],

  // Dia B - Costas
  back: [
    { name: "Barra Fixa", sets: 4, reps: "6-10", weight: 0 },
    { name: "Puxada Alta Aberta", sets: 4, reps: "8-10", weight: 0 },
    { name: "Remada Curvada", sets: 4, reps: "8-10", weight: 0 },
    { name: "Remada Serrote", sets: 3, reps: "10-12", weight: 0 },
    { name: "Pull Down (Corda)", sets: 3, reps: "10-12", weight: 0 },
    { name: "Crucifixo Inverso", sets: 3, reps: "12-15", weight: 0 }
  ],

  // Dia C - Pernas (Quadríceps foco)
  quads: [
    { name: "Agachamento Livre", sets: 4, reps: "6-8", weight: 0 },
    { name: "Leg Press 45°", sets: 4, reps: "10-12", weight: 0 },
    { name: "Cadeira Extensora", sets: 4, reps: "10-12", weight: 0 },
    { name: "Hack Machine", sets: 3, reps: "8-10", weight: 0 },
    { name: "Afundo com Halteres", sets: 3, reps: "10-12", weight: 0 },
    { name: "Agachamento Sumô", sets: 3, reps: "8-10", weight: 0 }
  ],

  // Dia D - Ombros
  shoulders: [
    { name: "Desenvolvimento Militar", sets: 4, reps: "8-10", weight: 0 },
    { name: "Desenvolvimento Arnold", sets: 3, reps: "10-12", weight: 0 },
    { name: "Elevação Lateral", sets: 4, reps: "12-15", weight: 0 },
    { name: "Elevação Frontal", sets: 3, reps: "12-15", weight: 0 },
    { name: "Crucifixo Inverso", sets: 3, reps: "12-15", weight: 0 },
    { name: "Encolhimento (Trapézio)", sets: 3, reps: "12-15", weight: 0 }
  ],

  // Dia E - Braços (Bíceps + Tríceps)
  arms: [
    { name: "Rosca Direta com Barra", sets: 3, reps: "8-10", weight: 0 },
    { name: "Rosca Alternada com Halteres", sets: 3, reps: "10-12", weight: 0 },
    { name: "Rosca Martelo", sets: 3, reps: "10-12", weight: 0 },
    { name: "Tríceps Corda no Cross", sets: 3, reps: "10-12", weight: 0 },
    { name: "Tríceps Testa com Barra", sets: 3, reps: "8-10", weight: 0 },
    { name: "Mergulho no Banco", sets: 3, reps: "12-15", weight: 0 }
  ],

  // Dia F - Posterior e Glúteos
  posterior: [
    { name: "Stiff", sets: 4, reps: "8-10", weight: 0 },
    { name: "Mesa Flexora", sets: 4, reps: "10-12", weight: 0 },
    { name: "Cadeira Flexora", sets: 3, reps: "10-12", weight: 0 },
    { name: "Elevação Pélvica", sets: 4, reps: "12-15", weight: 0 },
    { name: "Panturrilha em Pé", sets: 4, reps: "15-20", weight: 0 },
    { name: "Panturrilha Sentado", sets: 4, reps: "15-20", weight: 0 }
  ],

  // ========== EXERCÍCIOS ESPECÍFICOS ==========
  abs: [
    { name: "Abdominal Supra", sets: 3, reps: "20-25", weight: 0 },
    { name: "Prancha", sets: 3, reps: "30-60s", weight: 0 },
    { name: "Elevação de Pernas", sets: 3, reps: "15-20", weight: 0 },
    { name: "Abdominal Infra", sets: 3, reps: "20-25", weight: 0 },
    { name: "Russian Twist", sets: 3, reps: "20-30", weight: 0 }
  ]
};

module.exports = exercises;