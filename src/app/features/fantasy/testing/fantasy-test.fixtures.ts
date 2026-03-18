import {
  type FantasyLeague,
  type FantasyLeagueDashboard,
  type FantasyLeagueResults,
  type FantasyHomeExperience,
  type FantasyHomeMarketSection,
  type FantasyHomePrimaryLeague,
  type FantasyMarketMover,
  type FantasyPlayer,
  type FantasyPredictionOutcome,
  type FantasyRankingEntry,
  type FantasyResultsAward,
  type FantasyResultsPlayerLine,
  type FantasyResultsRankingEntry,
  type FantasyResultsRivalComparison,
  type FantasyTeam,
  type FantasyWeeklyCycle,
  type FantasyWeeklyFeedEntry,
} from '@features/fantasy/domain/entities/fantasy.models';

export function createFantasyLeague(overrides: Partial<FantasyLeague> = {}): FantasyLeague {
  return {
    id: 'league-1',
    name: 'Amigos del curro',
    code: 'CURRO26',
    memberCount: 8,
    myRank: 1,
    myPoints: 0,
    phase: 'preseason',
    ...overrides,
  };
}

export function createFantasyPlayer(overrides: Partial<FantasyPlayer> = {}): FantasyPlayer {
  const { priceHistory, ...playerOverrides } = overrides;
  const player = {
    id: 'kings-of-favar-player-1',
    slug: 'vicent-ciscar',
    name: 'Vicent Ciscar',
    avatar: 'VC',
    photoPath: '/stock_players/player-01.svg',
    teamId: 'kings-of-favar',
    teamName: 'Kings Of Favar',
    teamLogoPath: '/teams_logos/Kings_of_Favar_no_bg.png',
    side: 'ambas',
    sideLabel: 'Ambas',
    roleLabel: 'Presidente',
    scoutingNote:
      'Vicent Ciscar lidera Kings Of Favar y parte como una de las referencias más seguras para abrir la pretemporada fantasy.',
    price: 15_400_000,
    previousPrice: 15_200_000,
    pointsMatchday: 0,
    pointsTotal: 0,
    ...playerOverrides,
  } satisfies Omit<FantasyPlayer, 'priceHistory'>;

  return {
    ...player,
    priceHistory:
      priceHistory ?? buildFantasyPlayerValueHistory(player.previousPrice, player.price),
  } satisfies FantasyPlayer;
}

export function createFantasyRankingEntry(
  overrides: Partial<FantasyRankingEntry> = {},
): FantasyRankingEntry {
  return {
    rank: 1,
    teamId: 'team-league-1',
    teamName: 'Previa Imperial',
    managerName: 'Vicent',
    totalPoints: 0,
    matchdayPoints: 0,
    teamValue: 86_150_000,
    isMe: true,
    ...overrides,
  };
}

export function createFantasyTeam(overrides: Partial<FantasyTeam> = {}): FantasyTeam {
  return {
    id: 'team-league-1',
    leagueId: 'league-1',
    managerName: 'Vicent',
    name: 'Previa Imperial',
    budgetRemaining: 13_850_000,
    teamValue: 86_150_000,
    totalPoints: 0,
    matchdayPoints: 0,
    submittedCaptainId: 'thormentadores-player-1',
    submittedStarterPlayerIds: [
      'kings-of-favar-player-1',
      'thormentadores-player-1',
      'magic-city-player-1',
      'barbaridad-player-2',
    ],
    players: [],
    ...overrides,
  };
}

export function createFantasyPredictionOutcome(
  overrides: Partial<FantasyPredictionOutcome> = {},
): FantasyPredictionOutcome {
  return {
    bonusPoints: 2,
    confirmedStarterPlayerIds: [
      'kings-of-favar-player-1',
      'thormentadores-player-1',
      'barbaridad-player-2',
      'sin-equipo-player-1',
    ],
    hitPlayerIds: ['kings-of-favar-player-1', 'thormentadores-player-1'],
    hits: 2,
    lockedMessage: 'Tu bonus de porra ya está cerrado.',
    sundayChangeNote:
      'Si el domingo hay cambios de última hora, tu bonus seguirá calculado con el viernes.',
    ...overrides,
  };
}

export function createFantasyWeeklyCycle(
  overrides: Partial<FantasyWeeklyCycle> = {},
): FantasyWeeklyCycle {
  return {
    countdown: {
      isUrgent: true,
      label: 'Cierre definitivo del equipo',
      targetIso: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    },
    headline: 'Tu porra ya está cerrada',
    note: 'Si el domingo hay cambios de última hora, no se reabre la edición y el bonus no cambia.',
    officialLineupLabel: 'Titulares confirmados del viernes',
    phase: 'lineups-published',
    phaseLabel: 'Alineaciones publicadas',
    predictionOutcome: createFantasyPredictionOutcome(),
    summary:
      'Ya puedes editar tu equipo con las alineaciones oficiales sobre la mesa y sin tocar el bonus de porra.',
    ...overrides,
  };
}

export function createFantasyLeagueDashboard(
  overrides: Partial<FantasyLeagueDashboard> = {},
): FantasyLeagueDashboard {
  const myTeam = overrides.myTeam ?? null;

  return {
    league: createFantasyLeague(),
    myTeam,
    teams: myTeam ? [myTeam] : [],
    ranking: [createFantasyRankingEntry()],
    players: [createFantasyPlayer()],
    marketLocked: false,
    weeklyCycle: createFantasyWeeklyCycle({
      predictionOutcome: myTeam ? createFantasyPredictionOutcome() : null,
    }),
    ...overrides,
  };
}

export function createFantasyMarketMover(
  overrides: Partial<FantasyMarketMover> = {},
): FantasyMarketMover {
  const player = createFantasyPlayer();

  return {
    playerId: player.id,
    name: player.name,
    avatar: player.avatar,
    photoPath: player.photoPath,
    teamName: player.teamName,
    teamLogoPath: player.teamLogoPath,
    currentPrice: player.price,
    priceChange: player.price - player.previousPrice,
    recentPoints: [6, 8, 10],
    ...overrides,
  };
}

function buildFantasyPlayerValueHistory(previousPrice: number, currentPrice: number) {
  return [
    { label: 'D-4', value: previousPrice - 300_000 },
    { label: 'D-3', value: previousPrice - 150_000 },
    { label: 'D-2', value: previousPrice - 50_000 },
    { label: 'Ayer', value: previousPrice },
    { label: 'Hoy', value: currentPrice },
  ];
}

export function createFantasyHomeMarketSection(
  overrides: Partial<FantasyHomeMarketSection> = {},
): FantasyHomeMarketSection {
  return {
    id: 'rising',
    title: 'Suben de precio',
    description: 'Perfiles que están ganando valor.',
    movers: [createFantasyMarketMover()],
    ...overrides,
  };
}

export function createFantasyWeeklyFeedEntry(
  overrides: Partial<FantasyWeeklyFeedEntry> = {},
): FantasyWeeklyFeedEntry {
  return {
    id: 'feed-1',
    type: 'signing',
    actorName: 'Carlos',
    headline: 'Carlos cierra un fichaje antes del domingo.',
    detail: 'Ha reforzado el bloque principal con un perfil caliente del mercado.',
    accentLabel: 'Fichaje',
    relativeTimeLabel: 'Hace 18 min',
    ...overrides,
  };
}

export function createFantasyHomePrimaryLeague(
  overrides: Partial<FantasyHomePrimaryLeague> = {},
): FantasyHomePrimaryLeague {
  const league = createFantasyLeague();

  return {
    league,
    teamName: 'Previa Imperial',
    mode: 'prep',
    headline: 'Semana para preparar el golpe antes del domingo.',
    summary: 'Aprieta mercado y deja listo el equipo antes del cierre.',
    impactSummary: {
      currentRank: 3,
      previousRank: 4,
      totalPoints: 186,
      lastMatchdayPoints: 42,
      supportingText: 'Vienes de sumar bien y puedes seguir subiendo.',
      captainPlayerId: 'thormentadores-player-1',
      captainName: 'Borja Vercher',
      captainPoints: 10,
    },
    nextMatchdaySummary: {
      kickoffLabel: 'Jornada en 3 días',
      countdownLabel: 'Cierre de cambios en 12h',
      changesAvailable: 2,
      isUrgent: true,
    },
    marketSections: [createFantasyHomeMarketSection()],
    feed: [createFantasyWeeklyFeedEntry()],
    weeklyCycle: createFantasyWeeklyCycle(),
    ...overrides,
  };
}

export function createFantasyHomeExperience(
  overrides: Partial<FantasyHomeExperience> = {},
): FantasyHomeExperience {
  return {
    primaryLeague: createFantasyHomePrimaryLeague(),
    secondaryLeagues: [
      createFantasyLeague({
        id: 'league-2',
        name: 'Colegas pádel',
        code: 'PALA26',
        memberCount: 12,
        myRank: 5,
      }),
    ],
    ...overrides,
  };
}

export function createFantasyResultsRankingEntry(
  overrides: Partial<FantasyResultsRankingEntry> = {},
): FantasyResultsRankingEntry {
  return {
    rank: 1,
    teamName: 'Cristal Team',
    managerName: 'Marta',
    matchdayPoints: 21,
    movement: 1,
    isMe: false,
    ...overrides,
  };
}

export function createFantasyResultsPlayerLine(
  overrides: Partial<FantasyResultsPlayerLine> = {},
): FantasyResultsPlayerLine {
  const player = createFantasyPlayer();

  return {
    playerId: player.id,
    name: player.name,
    avatar: player.avatar,
    photoPath: player.photoPath,
    teamName: player.teamName,
    teamLogoPath: player.teamLogoPath,
    points: 8,
    isCaptain: false,
    priceChange: player.price - player.previousPrice,
    ...overrides,
  };
}

export function createFantasyResultsAward(
  overrides: Partial<FantasyResultsAward> = {},
): FantasyResultsAward {
  return {
    id: 'mvp',
    title: 'MVP jornada',
    winnerName: 'Marta',
    supportingText: 'Se lleva el techo de la jornada.',
    highlight: '21 pts',
    tone: 'brand',
    ...overrides,
  };
}

export function createFantasyResultsRivalComparison(
  overrides: Partial<FantasyResultsRivalComparison> = {},
): FantasyResultsRivalComparison {
  return {
    rivalManagerName: 'Carlos',
    rivalTeamName: 'Rivales del Viernes',
    pointsDelta: 2,
    summary: 'Le ganas a Carlos por solo 2 pts.',
    ...overrides,
  };
}

export function createFantasyLeagueResults(
  overrides: Partial<FantasyLeagueResults> = {},
): FantasyLeagueResults {
  return {
    league: createFantasyLeague(),
    weekLabel: 'Jornada 5 cerrada',
    headline: 'Resultados jornada disponibles',
    summary: 'Has apretado la jornada y el mercado ya se mueve.',
    myTeamName: 'Previa Imperial',
    myRank: 2,
    previousRank: 3,
    matchdayPoints: 18,
    predictionBonusPoints: 2,
    predictionHits: 2,
    predictionLockedMessage: 'Tu bonus de porra quedó cerrado el viernes.',
    sundayChangeNote:
      'Hubo ajustes el domingo, pero el bonus se mantuvo según la alineación oficial del viernes.',
    totalPoints: 20,
    captainPlayerId: 'thormentadores-player-1',
    captainName: 'Borja Vercher',
    captainPoints: 10,
    ranking: [
      createFantasyResultsRankingEntry(),
      createFantasyResultsRankingEntry({
        rank: 2,
        teamName: 'Previa Imperial',
        managerName: 'Vicent',
        matchdayPoints: 18,
        movement: 1,
        isMe: true,
      }),
    ],
    playerLines: [
      createFantasyResultsPlayerLine({
        playerId: 'thormentadores-player-1',
        name: 'Borja Vercher',
        avatar: 'BV',
        teamName: 'Thormentadores',
        points: 10,
        isCaptain: true,
      }),
    ],
    awards: [createFantasyResultsAward()],
    rivalComparisons: [createFantasyResultsRivalComparison()],
    marketSections: [createFantasyHomeMarketSection()],
    ...overrides,
  };
}
