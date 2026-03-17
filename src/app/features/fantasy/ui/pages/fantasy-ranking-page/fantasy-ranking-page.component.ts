import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FantasyRankingTableComponent } from '@features/fantasy/ui/components/fantasy-ranking-table/fantasy-ranking-table.component';
import { FantasyLeagueDashboardStore } from '@features/fantasy/ui/state/fantasy-league-dashboard.store';

@Component({
  selector: 'app-fantasy-ranking-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FantasyRankingTableComponent],
  providers: [FantasyLeagueDashboardStore],
  host: { class: 'fantasy-page o-container o-stack' },
  templateUrl: './fantasy-ranking-page.component.html',
})
export class FantasyRankingPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(FantasyLeagueDashboardStore);

  ngOnInit(): void {
    const leagueId = this.route.snapshot.paramMap.get('leagueId');
    if (leagueId) {
      void this.store.load(leagueId);
    }
  }
}
