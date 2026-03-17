import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ShieldAlert } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { FantasyRankingTableComponent } from '@features/fantasy/ui/components/fantasy-ranking-table/fantasy-ranking-table.component';
import { FantasyLeagueDashboardStore } from '@features/fantasy/ui/state/fantasy-league-dashboard.store';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-fantasy-ranking-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent, FantasyRankingTableComponent],
  providers: [FantasyLeagueDashboardStore],
  host: { class: 'fantasy-page fantasy-ranking-page o-container o-stack' },
  templateUrl: './fantasy-ranking-page.component.html',
  styleUrl: './fantasy-ranking-page.component.scss',
})
export class FantasyRankingPageComponent implements OnDestroy, OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly route = inject(ActivatedRoute);
  private readonly routeSubscription = new Subscription();

  protected readonly store = inject(FantasyLeagueDashboardStore);
  protected readonly shieldAlert = ShieldAlert;

  constructor() {
    effect(() => {
      const viewModel = this.store.viewModel();

      if (viewModel) {
        this.title.setTitle(`Ranking · ${viewModel.leagueName} | Fantasy | KingsPadelLeague`);
        this.meta.updateTag({
          name: 'description',
          content: `Clasificación fantasy completa de ${viewModel.leagueName}: compara equipos, managers y valor de plantilla en pretemporada.`,
        });

        return;
      }

      if (this.store.isNotFound()) {
        this.title.setTitle('Ranking fantasy no encontrado | KingsPadelLeague');
        this.meta.updateTag({
          name: 'description',
          content: 'La liga fantasy solicitada no está disponible para consultar su clasificación.',
        });

        return;
      }

      this.title.setTitle('Ranking fantasy | KingsPadelLeague');
      this.meta.updateTag({
        name: 'description',
        content:
          'Explora la clasificación fantasy de KingsPadelLeague para comparar managers y valor de equipo.',
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
