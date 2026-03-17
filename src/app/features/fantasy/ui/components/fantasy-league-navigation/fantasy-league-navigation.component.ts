import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

type FantasyLeagueSection = 'dashboard' | 'market' | 'team' | 'ranking' | 'planner';

interface FantasyLeagueNavigationLink {
  readonly href: string;
  readonly id: FantasyLeagueSection;
  readonly label: string;
}

@Component({
  selector: 'app-fantasy-league-navigation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { class: 'fantasy-league-navigation' },
  templateUrl: './fantasy-league-navigation.component.html',
  styleUrl: './fantasy-league-navigation.component.scss',
})
export class FantasyLeagueNavigationComponent {
  readonly currentSection = input.required<FantasyLeagueSection>();
  readonly dashboardLink = input.required<string>();
  readonly marketLink = input.required<string>();
  readonly plannerLink = input.required<string>();
  readonly rankingLink = input.required<string>();
  readonly teamLink = input.required<string>();

  protected readonly links = computed<readonly FantasyLeagueNavigationLink[]>(() => [
    { id: 'dashboard', label: 'Resumen', href: this.dashboardLink() },
    { id: 'market', label: 'Mercado', href: this.marketLink() },
    { id: 'planner', label: 'Gestionar', href: this.plannerLink() },
    { id: 'team', label: 'Mi equipo', href: this.teamLink() },
    { id: 'ranking', label: 'Ranking', href: this.rankingLink() },
  ]);
}
