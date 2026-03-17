import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Wallet } from 'lucide-angular';

import { type FantasyDashboardMarketSnapshotViewModel } from '@features/fantasy/ui/models/fantasy-league-dashboard.viewmodel';

@Component({
  selector: 'app-fantasy-dashboard-market-snapshot-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, RouterLink],
  host: { class: 'fantasy-dashboard-market-snapshot-card' },
  templateUrl: './fantasy-dashboard-market-snapshot-card.component.html',
  styleUrl: './fantasy-dashboard-market-snapshot-card.component.scss',
})
export class FantasyDashboardMarketSnapshotCardComponent {
  readonly snapshot = input.required<FantasyDashboardMarketSnapshotViewModel>();

  protected readonly walletIcon = Wallet;
}
