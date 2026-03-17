import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FantasyPlayerProfileStore } from '@features/fantasy/ui/state/fantasy-player-profile.store';

@Component({
  selector: 'app-fantasy-player-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FantasyPlayerProfileStore],
  host: { class: 'fantasy-page o-container o-stack' },
  templateUrl: './fantasy-player-profile-page.component.html',
})
export class FantasyPlayerProfilePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(FantasyPlayerProfileStore);

  ngOnInit(): void {
    const playerId = this.route.snapshot.paramMap.get('playerId');
    if (playerId) {
      void this.store.load(playerId);
    }
  }
}
