import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { type FantasySpotlightCardViewModel } from '@features/fantasy/ui/models/fantasy-league-dashboard.viewmodel';

@Component({
  selector: 'app-fantasy-mvp-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
  host: { class: 'fantasy-mvp-card' },
  templateUrl: './fantasy-mvp-card.component.html',
  styleUrl: './fantasy-mvp-card.component.scss',
})
export class FantasyMvpCardComponent {
  readonly player = input<FantasySpotlightCardViewModel | null>(null);
}
