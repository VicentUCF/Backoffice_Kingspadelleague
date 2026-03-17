import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { FantasyPlayerAvatarComponent } from '@features/fantasy/ui/components/fantasy-player-avatar/fantasy-player-avatar.component';
import { type FantasySpotlightCardViewModel } from '@features/fantasy/ui/models/fantasy-league-dashboard.viewmodel';

@Component({
  selector: 'app-fantasy-mvp-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FantasyPlayerAvatarComponent],
  host: { class: 'fantasy-mvp-card' },
  templateUrl: './fantasy-mvp-card.component.html',
  styleUrl: './fantasy-mvp-card.component.scss',
})
export class FantasyMvpCardComponent {
  readonly player = input<FantasySpotlightCardViewModel | null>(null);
}
