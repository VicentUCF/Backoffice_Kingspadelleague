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
  selector: 'app-fantasy-create-team-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  providers: [FantasyLeagueDashboardStore],
  host: { class: 'fantasy-page o-container o-stack' },
  templateUrl: './fantasy-create-team-page.component.html',
})
export class FantasyCreateTeamPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(FantasyLeagueDashboardStore);
  readonly selectedPlayerIds = signal<readonly string[]>([]);
  readonly captainId = signal<string | null>(null);

  readonly remainingBudget = computed(() => {
    const dashboard = this.store.dashboard();
    if (!dashboard) {
      return 100_000_000;
    }

    const selectedPlayers = dashboard.players.filter((player) =>
      this.selectedPlayerIds().includes(player.id),
    );

    return 100_000_000 - selectedPlayers.reduce((total, player) => total + player.price, 0);
  });

  ngOnInit(): void {
    const leagueId = this.route.snapshot.paramMap.get('leagueId');
    if (leagueId) {
      void this.store.load(leagueId);
    }
  }

  togglePlayer(playerId: string): void {
    this.selectedPlayerIds.update((selectedIds) =>
      selectedIds.includes(playerId)
        ? selectedIds.filter((id) => id !== playerId)
        : selectedIds.length < 6
          ? [...selectedIds, playerId]
          : selectedIds,
    );
  }
}
