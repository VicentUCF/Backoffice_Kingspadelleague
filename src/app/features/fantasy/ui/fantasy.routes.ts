import { type Routes } from '@angular/router';

import { provideFantasyFeature } from './providers/fantasy.providers';

export const FANTASY_ROUTES: Routes = [
  {
    path: '',
    providers: [provideFantasyFeature()],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/fantasy-home-page/fantasy-home-page.component').then(
            (module) => module.FantasyHomePageComponent,
          ),
      },
      {
        path: 'leagues',
        loadComponent: () =>
          import('./pages/fantasy-leagues-page/fantasy-leagues-page.component').then(
            (module) => module.FantasyLeaguesPageComponent,
          ),
      },
      {
        path: 'leagues/create',
        loadComponent: () =>
          import('./pages/fantasy-create-league-page/fantasy-create-league-page.component').then(
            (module) => module.FantasyCreateLeaguePageComponent,
          ),
      },
      {
        path: 'leagues/join',
        loadComponent: () =>
          import('./pages/fantasy-join-league-page/fantasy-join-league-page.component').then(
            (module) => module.FantasyJoinLeaguePageComponent,
          ),
      },
      {
        path: 'leagues/:leagueId/create-team',
        loadComponent: () =>
          import('./pages/fantasy-create-team-page/fantasy-create-team-page.component').then(
            (module) => module.FantasyCreateTeamPageComponent,
          ),
      },
      {
        path: 'leagues/:leagueId',
        loadComponent: () =>
          import('./pages/fantasy-league-dashboard-page/fantasy-league-dashboard-page.component').then(
            (module) => module.FantasyLeagueDashboardPageComponent,
          ),
      },
      {
        path: 'leagues/:leagueId/team',
        loadComponent: () =>
          import('./pages/fantasy-team-page/fantasy-team-page.component').then(
            (module) => module.FantasyTeamPageComponent,
          ),
      },
      {
        path: 'leagues/:leagueId/market',
        loadComponent: () =>
          import('./pages/fantasy-market-page/fantasy-market-page.component').then(
            (module) => module.FantasyMarketPageComponent,
          ),
      },
      {
        path: 'leagues/:leagueId/ranking',
        loadComponent: () =>
          import('./pages/fantasy-ranking-page/fantasy-ranking-page.component').then(
            (module) => module.FantasyRankingPageComponent,
          ),
      },
      {
        path: 'leagues/:leagueId/results',
        loadComponent: () =>
          import('./pages/fantasy-league-results-page/fantasy-league-results-page.component').then(
            (module) => module.FantasyLeagueResultsPageComponent,
          ),
      },
      {
        path: 'players/:playerId',
        loadComponent: () =>
          import('./pages/fantasy-player-profile-page/fantasy-player-profile-page.component').then(
            (module) => module.FantasyPlayerProfilePageComponent,
          ),
      },
    ],
  },
];
