import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { type FantasyLeagueCardViewModel } from '@features/fantasy/ui/models/fantasy-leagues.viewmodel';

@Component({
  selector: 'app-fantasy-league-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: {
    class: 'fantasy-league-card',
  },
  templateUrl: './fantasy-league-card.component.html',
  styleUrl: './fantasy-league-card.component.scss',
})
export class FantasyLeagueCardComponent {
  readonly league = input.required<FantasyLeagueCardViewModel>();
}
