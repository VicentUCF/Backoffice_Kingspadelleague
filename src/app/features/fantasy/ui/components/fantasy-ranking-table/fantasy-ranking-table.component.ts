import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { type FantasyRankingEntry } from '@features/fantasy/domain/entities/fantasy.models';

@Component({
  selector: 'app-fantasy-ranking-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'fantasy-ranking-table' },
  templateUrl: './fantasy-ranking-table.component.html',
  styleUrl: './fantasy-ranking-table.component.scss',
})
export class FantasyRankingTableComponent {
  readonly entries = input.required<readonly FantasyRankingEntry[]>();
}
