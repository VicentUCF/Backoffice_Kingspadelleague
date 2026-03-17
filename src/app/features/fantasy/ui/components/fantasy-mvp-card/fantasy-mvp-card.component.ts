import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { type FantasyPlayer } from '@features/fantasy/domain/entities/fantasy.models';

@Component({
  selector: 'app-fantasy-mvp-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'fantasy-mvp-card' },
  templateUrl: './fantasy-mvp-card.component.html',
  styleUrl: './fantasy-mvp-card.component.scss',
})
export class FantasyMvpCardComponent {
  readonly player = input<FantasyPlayer | null>(null);
}
