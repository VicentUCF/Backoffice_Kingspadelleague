import { type Routes } from '@angular/router';

import { FantasyCreateLeaguePageComponent } from './pages/fantasy-create-league-page/fantasy-create-league-page.component';
import { FantasyCreateTeamPageComponent } from './pages/fantasy-create-team-page/fantasy-create-team-page.component';
import { FantasyHomePageComponent } from './pages/fantasy-home-page/fantasy-home-page.component';
import { FantasyJoinLeaguePageComponent } from './pages/fantasy-join-league-page/fantasy-join-league-page.component';
import { FantasyLeagueDashboardPageComponent } from './pages/fantasy-league-dashboard-page/fantasy-league-dashboard-page.component';
import { FantasyLeaguesPageComponent } from './pages/fantasy-leagues-page/fantasy-leagues-page.component';
import { FantasyMarketPageComponent } from './pages/fantasy-market-page/fantasy-market-page.component';
import { FantasyPlayerProfilePageComponent } from './pages/fantasy-player-profile-page/fantasy-player-profile-page.component';
import { FantasyRankingPageComponent } from './pages/fantasy-ranking-page/fantasy-ranking-page.component';
import { FantasyTeamPageComponent } from './pages/fantasy-team-page/fantasy-team-page.component';
import { provideFantasyFeature } from './providers/fantasy.providers';

export const FANTASY_ROUTES: Routes = [
  {
    path: '',
    providers: [provideFantasyFeature()],
    children: [
      { path: '', component: FantasyHomePageComponent },
      { path: 'leagues', component: FantasyLeaguesPageComponent },
      { path: 'leagues/create', component: FantasyCreateLeaguePageComponent },
      { path: 'leagues/join', component: FantasyJoinLeaguePageComponent },
      { path: 'leagues/:leagueId/create-team', component: FantasyCreateTeamPageComponent },
      { path: 'leagues/:leagueId', component: FantasyLeagueDashboardPageComponent },
      { path: 'leagues/:leagueId/team', component: FantasyTeamPageComponent },
      { path: 'leagues/:leagueId/market', component: FantasyMarketPageComponent },
      { path: 'leagues/:leagueId/ranking', component: FantasyRankingPageComponent },
      { path: 'players/:playerId', component: FantasyPlayerProfilePageComponent },
    ],
  },
];
