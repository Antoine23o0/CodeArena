export default [
  {
    title: 'Défi Découverte : Boucles et Conditions',
    description:
      'Concours d’initiation pour apprendre à lire des entrées, manipuler des chaînes et utiliser les structures de contrôle de base.',
    difficulty: 'Débutant',
    difficultyOrder: 1,
    startDate: new Date('2025-01-11T13:00:00Z'),
    endDate: new Date('2025-01-11T15:00:00Z'),
    problems: [
      {
        title: 'Écho fidèle',
        description:
          "Écrivez un programme qui lit une ligne sur l'entrée standard et la réaffiche telle quelle. Les espaces et les accents doivent être conservés.",
        difficulty: 'Easy',
        maxScore: 100,
        timeLimitMs: 2000,
        testCases: [
          { input: 'bonjour\n', expectedOutput: 'bonjour' },
          { input: 'CodeArena\n', expectedOutput: 'CodeArena' },
          { input: '12345\n', expectedOutput: '12345', hidden: true },
        ],
      },
      {
        title: 'Somme élémentaire',
        description:
          "La première ligne contient deux entiers séparés par un espace. Affichez la somme de ces deux valeurs.",
        difficulty: 'Easy',
        maxScore: 100,
        timeLimitMs: 2000,
        testCases: [
          { input: '3 5\n', expectedOutput: '8' },
          { input: '10 -4\n', expectedOutput: '6' },
          { input: '-7 -9\n', expectedOutput: '-16', hidden: true },
        ],
      },
    ],
  },
  {
    title: 'Mission Tableaux et Collections',
    description:
      'Travaillez sur des tableaux, piles, files et dictionnaires pour résoudre des énigmes de données simples mais chronométrées.',
    difficulty: 'Débutant+',
    difficultyOrder: 2,
    startDate: new Date('2026-10-18T18:00:00Z'),
    endDate: new Date('2026-10-18T23:30:00Z'),
    problems: [
      {
        title: 'Maximum express',
        description:
          "La première ligne indique le nombre d'éléments, la seconde fournit les valeurs séparées par des espaces. Affichez la valeur maximale.",
        difficulty: 'Easy',
        maxScore: 100,
        timeLimitMs: 2000,
        testCases: [
          { input: '5\n1 7 3 9 2\n', expectedOutput: '9' },
          { input: '4\n-5 -2 -8 -1\n', expectedOutput: '-1' },
          { input: '1\n42\n', expectedOutput: '42', hidden: true },
        ],
      },
      {
        title: 'Rotation circulaire',
        description:
          "La première ligne contient la taille du tableau N et le nombre de rotations K. La deuxième ligne contient N entiers. Effectuez une rotation circulaire vers la droite de K positions et affichez le tableau résultant sur une seule ligne.",
        difficulty: 'Medium',
        maxScore: 150,
        timeLimitMs: 3000,
        testCases: [
          { input: '5 2\n1 2 3 4 5\n', expectedOutput: '4 5 1 2 3' },
          { input: '4 5\n10 20 30 40\n', expectedOutput: '40 10 20 30' },
          { input: '3 0\n7 8 9\n', expectedOutput: '7 8 9', hidden: true },
        ],
      },
    ],
  },
  {
    title: 'Stratégies Gloutonnes Express',
    description:
      'Affûtez vos algorithmes gloutons et vos raisonnements de complexité pour optimiser des scénarios concrets du quotidien.',
    difficulty: 'Intermédiaire',
    difficultyOrder: 3,
    startDate: new Date('2026-10-18T18:00:00Z'),
    endDate: new Date('2026-10-18T23:30:00Z'),
    problems: [
      {
        title: 'Rendu de monnaie rapide',
        description:
          "Calculez le nombre minimal de pièces nécessaires pour rendre une somme donnée en utilisant les valeurs 50, 20, 10, 5, 2 et 1.",
        difficulty: 'Medium',
        maxScore: 150,
        timeLimitMs: 2000,
        testCases: [
          { input: '87\n', expectedOutput: '5' },
          { input: '3\n', expectedOutput: '2' },
          { input: '0\n', expectedOutput: '0', hidden: true },
        ],
      },
      {
        title: 'Planification de réunions',
        description:
          "La première ligne contient le nombre de réunions possibles. Les lignes suivantes indiquent l'heure de début et de fin de chaque réunion (fin exclusive). Déterminez le nombre maximal de réunions compatibles qu'un participant peut suivre.",
        difficulty: 'Medium',
        maxScore: 200,
        timeLimitMs: 3000,
        testCases: [
          { input: '4\n1 2\n2 3\n3 4\n4 5\n', expectedOutput: '4' },
          { input: '5\n1 4\n3 5\n0 6\n5 7\n8 9\n', expectedOutput: '3' },
          { input: '3\n0 1\n1 2\n7 9\n', expectedOutput: '3', hidden: true },
        ],
      },
    ],
  },
  {
    title: 'Cartographie des Graphes Urbains',
    description:
      'Explorez des parcours, cycles et flux dans des réseaux urbains pour planifier transports, câblages et livraisons intelligentes.',
    difficulty: 'Intermédiaire+',
    difficultyOrder: 4,
    startDate: new Date('2026-10-18T18:00:00Z'),
    endDate: new Date('2026-10-18T23:30:00Z'),
    problems: [
      {
        title: 'Distance la plus courte',
        description:
          "On vous donne un graphe non orienté avec N sommets et M arêtes. La dernière ligne indique les sommets de départ et d'arrivée. Calculez la longueur du plus court chemin en nombre d'arêtes.",
        difficulty: 'Medium',
        maxScore: 200,
        timeLimitMs: 4000,
        testCases: [
          { input: '4 4\n1 2\n2 3\n3 4\n1 4\n1 3\n', expectedOutput: '2' },
          { input: '5 5\n1 2\n2 5\n3 4\n4 5\n2 3\n3 5\n', expectedOutput: '2' },
          { input: '3 2\n1 2\n2 3\n1 3\n', expectedOutput: '2', hidden: true },
        ],
      },
      {
        title: 'Composantes connectées',
        description:
          "Comptez le nombre de composantes connexes dans un graphe non orienté donné par N sommets et M arêtes.",
        difficulty: 'Medium',
        maxScore: 150,
        timeLimitMs: 3000,
        testCases: [
          { input: '5 3\n1 2\n2 3\n4 5\n', expectedOutput: '2' },
          { input: '4 0\n', expectedOutput: '4' },
          { input: '6 2\n1 2\n5 6\n', expectedOutput: '4', hidden: true },
        ],
      },
    ],
  },
  {
    title: 'Printemps Programmation Dynamique',
    description:
      'Résolvez des défis à sous-problèmes multiples mêlant mémorisation, transitions soigneuses et analyse de complexité.',
    difficulty: 'Confirmé',
    difficultyOrder: 5,
    startDate: new Date('2026-10-18T18:00:00Z'),
    endDate: new Date('2026-10-18T23:30:00Z'),
    problems: [
      {
        title: 'Combinaisons de pièces',
        description:
          "Calculez le nombre de combinaisons distinctes pour atteindre un montant cible avec les pièces fournies. L'ordre des pièces n'a pas d'importance.",
        difficulty: 'Medium',
        maxScore: 200,
        timeLimitMs: 4000,
        testCases: [
          { input: '5\n3\n1 2 5\n', expectedOutput: '4' },
          { input: '4\n2\n1 3\n', expectedOutput: '1' },
          { input: '3\n1\n2\n', expectedOutput: '0', hidden: true },
        ],
      },
      {
        title: 'Plus longue progression',
        description:
          "Déterminez la longueur de la plus longue sous-séquence strictement croissante dans la séquence fournie.",
        difficulty: 'Hard',
        maxScore: 250,
        timeLimitMs: 4000,
        testCases: [
          { input: '6\n3 1 2 5 4 7\n', expectedOutput: '4' },
          { input: '5\n5 4 3 2 1\n', expectedOutput: '1' },
          { input: '8\n10 9 2 5 3 7 101 18\n', expectedOutput: '4', hidden: true },
        ],
      },
    ],
  },
  {
    title: 'Épreuve Cryptographie & Sécurité',
    description:
      'Déjouez des attaques par force brute, manipulez des hachages et concevez des protocoles robustes en environnement hostile.',
    difficulty: 'Avancé',
    difficultyOrder: 6,
    startDate: new Date('2026-10-18T18:00:00Z'),
    endDate: new Date('2026-10-18T23:30:00Z'),
    problems: [
      {
        title: 'Chiffrement César',
        description:
          "Appliquez un décalage circulaire de K positions sur chaque lettre minuscule du message fourni. Les caractères non alphabétiques doivent rester inchangés.",
        difficulty: 'Easy',
        maxScore: 150,
        timeLimitMs: 2000,
        testCases: [
          { input: '3\nbonjour\n', expectedOutput: 'erqmrxu' },
          { input: '1\nxyz\n', expectedOutput: 'yza' },
          { input: '0\nabc\n', expectedOutput: 'abc', hidden: true },
        ],
      },
      {
        title: 'Checksum XOR',
        description:
          "Calculez le XOR de tous les entiers donnés pour simuler un contrôle d'intégrité simple.",
        difficulty: 'Medium',
        maxScore: 200,
        timeLimitMs: 2000,
        testCases: [
          { input: '4\n1 2 3 4\n', expectedOutput: '4' },
          { input: '3\n7 7 7\n', expectedOutput: '7' },
          { input: '5\n1 1 1 1 1\n', expectedOutput: '1', hidden: true },
        ],
      },
    ],
  },
  {
    title: 'Marathon Optimisation Numérique',
    description:
      'Affrontez des problèmes d’arithmétique modulaire, de programmation linéaire et d’optimisation combinatoire à grande échelle.',
    difficulty: 'Expert',
    difficultyOrder: 7,
    startDate: new Date('2026-10-18T18:00:00Z'),
    endDate: new Date('2026-10-18T23:30:00Z'),
    problems: [
      {
        title: 'Sous-tableau optimal',
        description:
          "Trouver la somme maximale d'un sous-tableau contigu de la séquence fournie.",
        difficulty: 'Medium',
        maxScore: 220,
        timeLimitMs: 3000,
        testCases: [
          { input: '9\n-2 1 -3 4 -1 2 1 -5 4\n', expectedOutput: '6' },
          { input: '5\n-1 -2 -3 -4 -5\n', expectedOutput: '-1' },
          { input: '6\n5 -2 3 4 -1 2\n', expectedOutput: '11', hidden: true },
        ],
      },
      {
        title: "Point d'équilibre",
        description:
          "Déterminez l'index (1-indexé) où la somme des éléments à gauche est égale à la somme des éléments à droite. Si aucun point d'équilibre n'existe, affichez -1.",
        difficulty: 'Hard',
        maxScore: 240,
        timeLimitMs: 3000,
        testCases: [
          { input: '5\n1 3 5 2 2\n', expectedOutput: '3' },
          { input: '4\n2 4 6 8\n', expectedOutput: '-1' },
          { input: '3\n1 -1 0\n', expectedOutput: '3', hidden: true },
        ],
      },
    ],
  },
  {
    title: 'Architecture Systèmes Distribués',
    description:
      'Simulez consensus, réplication et reprise sur panne pour des services résilients soumis à de fortes contraintes réseau.',
    difficulty: 'Expert+',
    difficultyOrder: 8,
   startDate: new Date('2026-10-18T18:00:00Z'),
    endDate: new Date('2026-10-18T23:30:00Z'),
    problems: [
      {
        title: 'Temps de propagation',
        description:
          "Les temps de réponse de chaque réplique sont fournis. Calculez le temps total avant confirmation, égal au maximum des temps observés.",
        difficulty: 'Easy',
        maxScore: 180,
        timeLimitMs: 2000,
        testCases: [
          { input: '5\n2 1 4 3 2\n', expectedOutput: '4' },
          { input: '3\n5 5 5\n', expectedOutput: '5' },
          { input: '4\n1 0 2 3\n', expectedOutput: '3', hidden: true },
        ],
      },
      {
        title: 'Fenêtre de surveillance',
        description:
          "Calculez la somme maximale d'une fenêtre glissante de taille K sur les métriques collectées.",
        difficulty: 'Medium',
        maxScore: 220,
        timeLimitMs: 3000,
        testCases: [
          { input: '6 3\n1 2 3 4 5 6\n', expectedOutput: '15' },
          { input: '5 2\n5 1 3 2 6\n', expectedOutput: '8' },
          { input: '4 4\n4 3 2 1\n', expectedOutput: '10', hidden: true },
        ],
      },
    ],
  },
  {
    title: 'Tournoi Intelligence Artificielle',
    description:
      'Combinez recherche heuristique, apprentissage par renforcement et stratégies adverses pour dominer des jeux compétitifs.',
    difficulty: 'Maître',
    difficultyOrder: 9,
     startDate: new Date('2026-10-18T18:00:00Z'),
    endDate: new Date('2026-10-18T23:30:00Z'),
    problems: [
      {
        title: 'Distance heuristique',
        description:
          "Additionnez les distances de Manhattan de chaque position donnée par rapport à l'origine (0,0).",
        difficulty: 'Medium',
        maxScore: 220,
        timeLimitMs: 2000,
        testCases: [
          { input: '3\n1 2\n-1 0\n0 -3\n', expectedOutput: '7' },
          { input: '2\n0 0\n4 5\n', expectedOutput: '9' },
          { input: '1\n-7 4\n', expectedOutput: '11', hidden: true },
        ],
      },
      {
        title: 'MiniMax binaire',
        description:
          "On fournit 2^k scores de feuilles. Les niveaux alternent entre joueur minimisant et maximisant, en commençant par un niveau maximisant à la racine. Calculez le score final au sommet de l'arbre.",
        difficulty: 'Hard',
        maxScore: 260,
        timeLimitMs: 4000,
        testCases: [
          { input: '4\n3 5 2 9\n', expectedOutput: '3' },
          { input: '4\n1 2 3 4\n', expectedOutput: '3' },
          { input: '4\n7 5 6 8\n', expectedOutput: '6', hidden: true },
        ],
      },
    ],
  },
  {
    title: 'Finale Légende CodeArena',
    description:
      'Épreuve finale mêlant simulation temps réel, théorie des jeux et puzzles NP-difficiles réservés aux meilleurs stratèges.',
    difficulty: 'Légende',
    difficultyOrder: 10,
    startDate: new Date('2026-10-18T18:00:00Z'),
    endDate: new Date('2026-10-18T23:30:00Z'),
    problems: [
      {
        title: 'Partition équilibrée',
        description:
          "Répartissez les charges entre deux serveurs afin de minimiser la différence absolue entre les totaux. Retournez la différence minimale obtenue.",
        difficulty: 'Hard',
        maxScore: 280,
        timeLimitMs: 5000,
        testCases: [
          { input: '4\n1 6 11 5\n', expectedOutput: '1' },
          { input: '3\n10 20 15\n', expectedOutput: '5' },
          { input: '2\n8 8\n', expectedOutput: '0', hidden: true },
        ],
      },
      {
        title: 'Chemin minimal sur grille',
        description:
          "On vous donne une grille de coûts. Vous partez en haut à gauche et pouvez uniquement vous déplacer vers la droite ou vers le bas. Calculez le coût minimal pour atteindre la case en bas à droite.",
        difficulty: 'Hard',
        maxScore: 300,
        timeLimitMs: 5000,
        testCases: [
          { input: '2 3\n1 3 1\n1 5 1\n', expectedOutput: '6' },
          { input: '3 3\n1 2 3\n4 5 6\n7 8 9\n', expectedOutput: '21' },
          { input: '1 1\n5\n', expectedOutput: '5', hidden: true },
        ],
      },
    ],
  },
];
