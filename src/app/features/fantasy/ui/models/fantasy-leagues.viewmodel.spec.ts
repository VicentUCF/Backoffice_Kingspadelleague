import { toFantasyLeagueCardsViewModel } from './fantasy-leagues.viewmodel';

describe('toFantasyLeagueCardsViewModel', () => {
  it('maps leagues into card-friendly routes and labels', () => {
    const [league] = toFantasyLeagueCardsViewModel([
      {
        id: 'league-1',
        name: 'Amigos del curro',
        code: 'AMIGOS26',
        memberCount: 8,
        myRank: 2,
        myPoints: 542,
        phase: 'preseason',
      },
    ]);

    expect(league).toMatchObject({
      dashboardLink: '/fantasy/leagues/league-1',
      marketLink: '/fantasy/leagues/league-1/market',
      memberCountLabel: '8 participantes',
      myPointsLabel: '542 pts',
      myRankLabel: '#2',
      rankingLink: '/fantasy/leagues/league-1/ranking',
      teamLink: '/fantasy/leagues/league-1/team',
    });
  });
});
