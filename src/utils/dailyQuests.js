const DAILY_QUESTS = [
  {
    title: "Tomar agua",
    description: "Tomar al menos un vaso grande de agua",
    type: "daily",
    globalXpReward: 10,
    coinReward: 5,
    statRewards: [{ statKey: "res", amount: 10 }]
  },
  {
    title: "Hacer la cama",
    description: "Arreglar la cama al iniciar el día",
    type: "daily",
    globalXpReward: 15,
    coinReward: 5,
    statRewards: [{ statKey: "str", amount: 10 }]
  },
  {
    title: "Caminar 10 minutos",
    description: "Moverte un poco y salir a caminar",
    type: "daily",
    globalXpReward: 20,
    coinReward: 10,
    statRewards: [
      { statKey: "res", amount: 15 },
      { statKey: "agi", amount: 10 }
    ],
    photoEvidenceEnabled: true,
    locationEvidenceEnabled: true,
    photoBonusXp: 10,
    photoBonusCoins: 5,
    photoBonusStatRewards: [
      { statKey: "res", amount: 10 }
    ],
    locationBonusXp: 25,
    locationBonusCoins: 10,
    locationBonusStatRewards: [
      { statKey: "res", amount: 15 },
      { statKey: "agi", amount: 10 }
    ]
  },
  {
    title: "Leer 20 minutos",
    description: "Leer algo útil o que disfrutes",
    type: "daily",
    globalXpReward: 25,
    coinReward: 10,
    statRewards: [{ statKey: "int", amount: 20 }]
  },
  {
    title: "Escribir o crear algo",
    description: "Dibujar, escribir o desarrollar una idea",
    type: "daily",
    globalXpReward: 20,
    coinReward: 10,
    statRewards: [{ statKey: "cre", amount: 20 }]
  },
  {
    title: "Hablar con alguien de forma intencional",
    description: "Tener una conversación útil o significativa",
    type: "daily",
    globalXpReward: 20,
    coinReward: 10,
    statRewards: [{ statKey: "com", amount: 20 }]
  }
];

module.exports = { DAILY_QUESTS };