import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type FantasyLeagueSection = 'draft' | 'market' | 'overview' | 'ranking' | 'results' | 'team';

@Component({
  selector: 'app-fantasy-league-section-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { class: 'fantasy-league-section-nav' },
  templateUrl: './fantasy-league-section-nav.component.html',
  styleUrl: './fantasy-league-section-nav.component.scss',
})
export class FantasyLeagueSectionNavComponent {
  readonly activeSection = input.required<FantasyLeagueSection>();
  readonly leagueName = input.required<string>();
  readonly marketLink = input.required<string>();
  readonly overviewLink = input.required<string>();
  readonly rankingLink = input.required<string>();
  readonly resultsLink = input<string | null>(null);
  readonly teamDraftLink = input.required<string>();
  readonly teamLink = input.required<string>();
}
