import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Users } from 'lucide-angular';

import { type FantasyDashboardPrimarySummaryViewModel } from '@features/fantasy/ui/models/fantasy-league-dashboard.viewmodel';

@Component({
  selector: 'app-fantasy-dashboard-team-summary-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, RouterLink],
  host: { class: 'fantasy-dashboard-team-summary-card' },
  templateUrl: './fantasy-dashboard-team-summary-card.component.html',
  styleUrl: './fantasy-dashboard-team-summary-card.component.scss',
})
export class FantasyDashboardTeamSummaryCardComponent {
  readonly summary = input.required<FantasyDashboardPrimarySummaryViewModel>();

  protected readonly usersIcon = Users;
}
