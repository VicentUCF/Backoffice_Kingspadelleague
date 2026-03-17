import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FantasyLeagueDashboardStore } from '@features/fantasy/ui/state/fantasy-league-dashboard.store';

@Component({
  selector: 'app-fantasy-team-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FantasyLeagueDashboardStore],
  host: { class: 'fantasy-page o-container o-stack' },
  templateUrl: './fantasy-team-page.component.html',
})
export class FantasyTeamPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(FantasyLeagueDashboardStore);

  ngOnInit(): void {
    const leagueId = this.route.snapshot.paramMap.get('leagueId');
    if (leagueId) {
      void this.store.load(leagueId);
    }
  }
}
