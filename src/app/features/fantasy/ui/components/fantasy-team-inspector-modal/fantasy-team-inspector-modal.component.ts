import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { type FantasyTeamInspectorViewModel } from '@features/fantasy/ui/models/fantasy-league-dashboard.viewmodel';
import { FantasyPlayerAvatarComponent } from '@features/fantasy/ui/components/fantasy-player-avatar/fantasy-player-avatar.component';
import { ModalShellComponent } from '@shared/ui/modal-shell/modal-shell.component';

@Component({
  selector: 'app-fantasy-team-inspector-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FantasyPlayerAvatarComponent, ModalShellComponent, RouterLink],
  host: { class: 'fantasy-team-inspector-modal' },
  templateUrl: './fantasy-team-inspector-modal.component.html',
  styleUrl: './fantasy-team-inspector-modal.component.scss',
})
export class FantasyTeamInspectorModalComponent {
  readonly isOpen = input(false);
  readonly team = input<FantasyTeamInspectorViewModel | null>(null);

  readonly closed = output<void>();

  protected close(): void {
    this.closed.emit();
  }
}
