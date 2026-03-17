import {
  type FantasyWeeklyFeedEntry,
  type FantasyWeeklyMode,
  type FantasyWeeklyPhase,
} from '@features/fantasy/domain/entities/fantasy.models';

interface FantasyMarketMoverSeed {
  readonly currentPrice?: number;
  readonly playerId: string;
  readonly priceChange: number;
  readonly recentPoints: readonly number[];
}

interface FantasyHomeMarketSectionSeed {
  readonly description: string;
  readonly id: string;
  readonly movers: readonly FantasyMarketMoverSeed[];
  readonly title: string;
}

interface FantasyHomePrimaryLeagueSeed {
  readonly feed: readonly FantasyWeeklyFeedEntry[];
  readonly headline: string;
  readonly impactSummary: {
    readonly captainPlayerId: string | null;
    readonly captainPoints: number | null;
    readonly currentRank: number;
    readonly lastMatchdayPoints: number;
    readonly previousRank: number;
    readonly supportingText: string;
    readonly totalPoints: number;
  };
  readonly marketSections: readonly FantasyHomeMarketSectionSeed[];
  readonly mode: FantasyWeeklyMode;
  readonly nextMatchdaySummary: {
    readonly changesAvailable: number;
    readonly countdownLabel: string;
    readonly isUrgent: boolean;
    readonly kickoffLabel: string;
  } | null;
  readonly summary: string;
  readonly weeklyCycle: {
    readonly countdown: {
      readonly isUrgent: boolean;
      readonly label: string;
      readonly minutesFromNow: number;
    } | null;
    readonly headline: string;
    readonly note: string;
    readonly officialLineupLabel: string | null;
    readonly phase: FantasyWeeklyPhase;
    readonly phaseLabel: string;
    readonly predictionLockedMessage: string;
    readonly sundayChangeNote: string | null;
    readonly summary: string;
    readonly confirmedStarterPlayerIds: readonly string[];
  };
}

interface FantasyResultsSeed {
  readonly awards: readonly {
    readonly highlight: string;
    readonly id: string;
    readonly supportingText: string;
    readonly title: string;
    readonly tone: 'brand' | 'positive' | 'warning';
    readonly winnerName: string;
  }[];
  readonly captainPlayerId: string | null;
  readonly captainPoints: number | null;
  readonly headline: string;
  readonly marketSections: readonly FantasyHomeMarketSectionSeed[];
  readonly matchdayPoints: number;
  readonly playerLines: readonly {
    readonly playerId: string;
    readonly points: number;
    readonly priceChange: number;
  }[];
  readonly previousRank: number;
  readonly predictionLockedMessage: string;
  readonly sundayChangeNote: string | null;
  readonly ranking: readonly {
    readonly managerName: string;
    readonly matchdayPoints: number;
    readonly movement: number;
    readonly rank: number;
    readonly teamName: string;
  }[];
  readonly rivalComparisons: readonly {
    readonly pointsDelta: number;
    readonly rivalManagerName: string;
    readonly rivalTeamName: string;
    readonly summary: string;
  }[];
  readonly summary: string;
  readonly weekLabel: string;
}

export const FANTASY_HOME_PRIMARY_LEAGUE_SEED: Readonly<
  Record<string, FantasyHomePrimaryLeagueSeed>
> = {
  'league-1': {
    mode: 'prep',
    headline: 'Semana para preparar el golpe antes del domingo.',
    summary:
      'Tu liga entra en modo ajustes: aprieta mercado, deja fino el capitán y llega al cierre con ventaja.',
    impactSummary: {
      currentRank: 3,
      previousRank: 4,
      totalPoints: 186,
      lastMatchdayPoints: 42,
      supportingText:
        'Vienes de una buena jornada y estás a un movimiento de meterte en la pelea alta.',
      captainPlayerId: 'thormentadores-player-1',
      captainPoints: 10,
    },
    nextMatchdaySummary: {
      kickoffLabel: 'Jornada en 3 días',
      countdownLabel: 'Cierre de cambios en 12h',
      changesAvailable: 2,
      isUrgent: true,
    },
    marketSections: [
      {
        id: 'rising',
        title: 'Suben de precio',
        description: 'Perfiles que están ganando tracción y pueden escaparse si esperas demasiado.',
        movers: [
          {
            playerId: 'thormentadores-player-1',
            currentPrice: 15_400_000,
            priceChange: 850_000,
            recentPoints: [8, 10, 12],
          },
          {
            playerId: 'barbaridad-player-2',
            currentPrice: 13_900_000,
            priceChange: 600_000,
            recentPoints: [6, 9, 11],
          },
          {
            playerId: 'magic-city-player-1',
            currentPrice: 13_550_000,
            priceChange: 450_000,
            recentPoints: [7, 7, 10],
          },
        ],
      },
      {
        id: 'form',
        title: 'Jugadores en forma',
        description:
          'Lecturas rápidas para atacar la próxima jornada sin perder valor de plantilla.',
        movers: [
          {
            playerId: 'titanics-player-4',
            currentPrice: 12_600_000,
            priceChange: 250_000,
            recentPoints: [4, 8, 9],
          },
          {
            playerId: 'sin-equipo-player-1',
            currentPrice: 11_950_000,
            priceChange: 300_000,
            recentPoints: [5, 6, 8],
          },
          {
            playerId: 'kings-of-favar-player-1',
            currentPrice: 15_250_000,
            priceChange: 150_000,
            recentPoints: [6, 7, 8],
          },
        ],
      },
    ],
    feed: [
      {
        id: 'feed-1',
        type: 'signing',
        actorName: 'Lucía',
        headline: 'Drive de Oficina cierra un fichaje antes del cierre.',
        detail: 'Ha metido una pieza de rotación y ya amenaza el top 3 de valor.',
        accentLabel: 'Fichaje',
        relativeTimeLabel: 'Hace 18 min',
      },
      {
        id: 'feed-2',
        type: 'captain',
        actorName: 'Carlos',
        headline: 'Carlos cambia su capitán para ir a por ti.',
        detail:
          'Rivales del Viernes se la juega con un perfil más agresivo para recortar distancia.',
        accentLabel: 'Capitán',
        relativeTimeLabel: 'Hace 52 min',
      },
      {
        id: 'feed-3',
        type: 'ranking',
        actorName: 'Nora',
        headline: 'La Bandeja Club sube una posición en la general.',
        detail: 'El último ajuste de plantilla le ha dado oxígeno de cara al domingo.',
        accentLabel: 'Ranking',
        relativeTimeLabel: 'Hace 1 h',
      },
    ],
    weeklyCycle: {
      phase: 'lineups-published',
      phaseLabel: 'Alineaciones publicadas',
      headline: 'Tu porra ya está cerrada',
      summary:
        'Ya sabemos quién sale de inicio el viernes. El bonus de porra queda fijado ahora y puedes retocar tu equipo antes del cierre final.',
      countdown: {
        label: 'Cierre definitivo del equipo',
        minutesFromNow: 1_103,
        isUrgent: true,
      },
      officialLineupLabel: 'Titulares confirmados del viernes',
      note: 'Si el domingo hay cambios de última hora, no se abrirán más cambios y tu bonus seguirá igual.',
      predictionLockedMessage:
        'Tu bonus de porra ya está cerrado y no cambiará aunque el domingo haya ajustes de última hora.',
      sundayChangeNote:
        'Si el domingo cambia un jugador por lesión o decisión técnica, tu bonus de porra no se recalcula.',
      confirmedStarterPlayerIds: [
        'kings-of-favar-player-1',
        'thormentadores-player-1',
        'barbaridad-player-2',
        'sin-equipo-player-1',
      ],
    },
  },
} as const;

export const FANTASY_LEAGUE_RESULTS_SEED: Readonly<Record<string, FantasyResultsSeed>> = {
  'league-1': {
    weekLabel: 'Jornada 5 cerrada',
    headline: 'Resultados jornada disponibles',
    summary:
      'Tu domingo fue sólido: el capitán respondió, ganaste aire en la general y el mercado ya se está moviendo.',
    previousRank: 3,
    matchdayPoints: 18,
    predictionLockedMessage:
      'Tu bonus de porra quedó cerrado con el viernes y se ha mantenido intacto toda la jornada.',
    sundayChangeNote:
      'Hubo ajustes el domingo, pero el bonus de porra se mantuvo según la alineación oficial publicada el viernes.',
    captainPlayerId: 'thormentadores-player-1',
    captainPoints: 10,
    ranking: [
      {
        rank: 1,
        teamName: 'Cristal Team',
        managerName: 'Marta',
        matchdayPoints: 21,
        movement: 1,
      },
      {
        rank: 2,
        teamName: 'Previa Imperial',
        managerName: 'Vicent',
        matchdayPoints: 18,
        movement: 1,
      },
      {
        rank: 3,
        teamName: 'Rivales del Viernes',
        managerName: 'Carlos',
        matchdayPoints: 16,
        movement: -1,
      },
      {
        rank: 4,
        teamName: 'Drive de Oficina',
        managerName: 'Lucía',
        matchdayPoints: 14,
        movement: -1,
      },
      {
        rank: 5,
        teamName: 'La Bandeja Club',
        managerName: 'Nora',
        matchdayPoints: 11,
        movement: 0,
      },
    ],
    playerLines: [
      { playerId: 'thormentadores-player-1', points: 10, priceChange: 700_000 },
      { playerId: 'kings-of-favar-player-1', points: 3, priceChange: 150_000 },
      { playerId: 'magic-city-player-1', points: 2, priceChange: 350_000 },
      { playerId: 'barbaridad-player-2', points: 2, priceChange: 250_000 },
      { playerId: 'titanics-player-4', points: 1, priceChange: -150_000 },
      { playerId: 'sin-equipo-player-1', points: 0, priceChange: -300_000 },
    ],
    awards: [
      {
        id: 'mvp',
        title: 'MVP jornada',
        winnerName: 'Marta',
        supportingText: 'Cristal Team sostuvo el domingo con el mejor pico de puntuación.',
        highlight: '21 pts',
        tone: 'brand',
      },
      {
        id: 'captain',
        title: 'Mejor capitán',
        winnerName: 'Carlos',
        supportingText: 'Su apuesta como capitán fue la más rentable de toda la liga.',
        highlight: '+12 pts',
        tone: 'positive',
      },
      {
        id: 'climber',
        title: 'Mayor subida',
        winnerName: 'Previa Imperial',
        supportingText: 'Tu equipo fue el que más apretó en el cierre de jornada.',
        highlight: '+1 posición',
        tone: 'warning',
      },
    ],
    rivalComparisons: [
      {
        rivalManagerName: 'Carlos',
        rivalTeamName: 'Rivales del Viernes',
        pointsDelta: 2,
        summary:
          'Le ganas a Carlos por solo 2 pts y le dejas por detrás justo antes del siguiente cierre.',
      },
    ],
    marketSections: [
      {
        id: 'winners',
        title: 'Subidas post-jornada',
        description:
          'Los perfiles que salen reforzados del domingo y marcan el nuevo ritmo del mercado.',
        movers: [
          {
            playerId: 'thormentadores-player-1',
            currentPrice: 16_100_000,
            priceChange: 1_050_000,
            recentPoints: [8, 10, 12],
          },
          {
            playerId: 'magic-city-player-1',
            currentPrice: 13_900_000,
            priceChange: 500_000,
            recentPoints: [7, 8, 9],
          },
        ],
      },
      {
        id: 'losers',
        title: 'Bajadas y nuevo meta',
        description: 'Ventanas de entrada y perfiles que pierden fuerza tras el último cierre.',
        movers: [
          {
            playerId: 'sin-equipo-player-1',
            currentPrice: 11_350_000,
            priceChange: -450_000,
            recentPoints: [4, 2, 0],
          },
          {
            playerId: 'titanics-player-4',
            currentPrice: 12_150_000,
            priceChange: -250_000,
            recentPoints: [2, 1, 1],
          },
        ],
      },
    ],
  },
} as const;
