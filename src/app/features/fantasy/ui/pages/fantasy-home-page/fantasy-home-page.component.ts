import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FantasyLeagueCardComponent } from '@features/fantasy/ui/components/fantasy-league-card/fantasy-league-card.component';
import { FantasyLeaguesStore } from '@features/fantasy/ui/state/fantasy-leagues.store';

@Component({
  selector: 'app-fantasy-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FantasyLeagueCardComponent],
  providers: [FantasyLeaguesStore],
  host: { class: 'fantasy-page o-container o-stack' },
  templateUrl: './fantasy-home-page.component.html',
})
export class FantasyHomePageComponent implements OnInit {
  readonly store = inject(FantasyLeaguesStore);

  ngOnInit(): void {
    void this.store.load();
  }
}
