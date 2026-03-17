import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FantasyLeagueCardComponent } from '@features/fantasy/ui/components/fantasy-league-card/fantasy-league-card.component';
import { FantasyLeaguesStore } from '@features/fantasy/ui/state/fantasy-leagues.store';

@Component({
  selector: 'app-fantasy-leagues-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FantasyLeagueCardComponent],
  providers: [FantasyLeaguesStore],
  host: { class: 'fantasy-page o-container o-stack' },
  templateUrl: './fantasy-leagues-page.component.html',
})
export class FantasyLeaguesPageComponent implements OnInit {
  readonly store = inject(FantasyLeaguesStore);

  ngOnInit(): void {
    void this.store.load();
  }
}
