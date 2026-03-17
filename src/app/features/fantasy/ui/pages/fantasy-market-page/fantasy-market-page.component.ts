import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { FantasyLeagueDashboardStore } from '@features/fantasy/ui/state/fantasy-league-dashboard.store';

@Component({
  selector: 'app-fantasy-market-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  providers: [FantasyLeagueDashboardStore],
  host: { class: 'fantasy-page o-container o-stack' },
  templateUrl: './fantasy-market-page.component.html',
})
export class FantasyMarketPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(FantasyLeagueDashboardStore);
  readonly searchQuery = signal('');

  readonly filteredPlayers = computed(() => {
    const dashboard = this.store.dashboard();
    if (!dashboard) {
      return [];
    }

    const normalizedQuery = this.searchQuery().trim().toLowerCase();
    if (normalizedQuery.length === 0) {
      return dashboard.players;
    }

    return dashboard.players.filter((player) =>
      player.name.toLowerCase().includes(normalizedQuery),
    );
  });

  ngOnInit(): void {
    const leagueId = this.route.snapshot.paramMap.get('leagueId');
    if (leagueId) {
      void this.store.load(leagueId);
    }
  }
}
