import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, ShieldAlert, Trophy, Wallet } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { FantasyMvpCardComponent } from '@features/fantasy/ui/components/fantasy-mvp-card/fantasy-mvp-card.component';
import { FantasyRankingTableComponent } from '@features/fantasy/ui/components/fantasy-ranking-table/fantasy-ranking-table.component';
import { FantasyLeagueDashboardStore } from '@features/fantasy/ui/state/fantasy-league-dashboard.store';
import {
  EmptyStateComponent,
  type EmptyStateAction,
} from '@shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-fantasy-league-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EmptyStateComponent,
    FantasyMvpCardComponent,
    FantasyRankingTableComponent,
    LucideAngularModule,
    RouterLink,
  ],
  providers: [FantasyLeagueDashboardStore],
  host: { class: 'fantasy-page fantasy-dashboard-page o-container o-stack' },
  templateUrl: './fantasy-league-dashboard-page.component.html',
  styleUrl: './fantasy-league-dashboard-page.component.scss',
})
export class FantasyLeagueDashboardPageComponent implements OnDestroy, OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly route = inject(ActivatedRoute);
  private readonly routeSubscription = new Subscription();

  protected readonly store = inject(FantasyLeagueDashboardStore);
  protected readonly rankingIcon = Trophy;
  protected readonly shieldAlert = ShieldAlert;
  protected readonly walletIcon = Wallet;
  protected readonly missingLeagueActions: readonly EmptyStateAction[] = [
    {
      label: 'Volver a mis ligas',
      href: '/fantasy/leagues',
      tone: 'primary',
    },
  ];

  constructor() {
    effect(() => {
      const viewModel = this.store.viewModel();

      if (viewModel) {
        this.title.setTitle(`${viewModel.leagueName} | Fantasy | KingsPadelLeague`);
        this.meta.updateTag({
          name: 'description',
          content: `${viewModel.leagueName}: sigue el estado de pretemporada, el mercado y el valor de tu plantilla fantasy.`,
        });

        return;
      }

      if (this.store.isNotFound()) {
        this.title.setTitle('Liga fantasy no encontrada | KingsPadelLeague');
        this.meta.updateTag({
          name: 'description',
          content:
            'La liga fantasy solicitada no está disponible. Revisa tus ligas activas o vuelve al inicio del fantasy.',
        });

        return;
      }

      this.title.setTitle('Fantasy | KingsPadelLeague');
      this.meta.updateTag({
        name: 'description',
        content:
          'Consulta el estado de tus ligas fantasy, el mercado y la construcción de plantilla.',
      });
    });
  }

  ngOnInit(): void {
    this.routeSubscription.add(
      this.route.paramMap.subscribe((paramMap) => {
        void this.store.load(paramMap.get('leagueId'));
      }),
    );
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }
}
