import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { FantasyMvpCardComponent } from '@features/fantasy/ui/components/fantasy-mvp-card/fantasy-mvp-card.component';
import { FantasyRankingTableComponent } from '@features/fantasy/ui/components/fantasy-ranking-table/fantasy-ranking-table.component';
import { FantasyLeagueDashboardStore } from '@features/fantasy/ui/state/fantasy-league-dashboard.store';

@Component({
  selector: 'app-fantasy-league-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FantasyMvpCardComponent, FantasyRankingTableComponent],
  providers: [FantasyLeagueDashboardStore],
  host: { class: 'fantasy-page o-container o-stack' },
  templateUrl: './fantasy-league-dashboard-page.component.html',
})
export class FantasyLeagueDashboardPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(FantasyLeagueDashboardStore);

  ngOnInit(): void {
    const leagueId = this.route.snapshot.paramMap.get('leagueId');
    if (leagueId) {
      void this.store.load(leagueId);
    }
  }
}
