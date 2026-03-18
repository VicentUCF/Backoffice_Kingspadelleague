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
import { ShieldAlert, Trophy } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { FantasyLeagueSectionNavComponent } from '@features/fantasy/ui/components/fantasy-league-section-nav/fantasy-league-section-nav.component';
import { FantasyPlayerAvatarComponent } from '@features/fantasy/ui/components/fantasy-player-avatar/fantasy-player-avatar.component';
import { FantasyLeagueResultsStore } from '@features/fantasy/ui/state/fantasy-league-results.store';
import {
  EmptyStateComponent,
  type EmptyStateAction,
} from '@shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-fantasy-league-results-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EmptyStateComponent,
    FantasyLeagueSectionNavComponent,
    FantasyPlayerAvatarComponent,
    RouterLink,
  ],
  providers: [FantasyLeagueResultsStore],
  host: { class: 'fantasy-page' },
  templateUrl: './fantasy-league-results-page.component.html',
  styleUrl: './fantasy-league-results-page.component.scss',
})
export class FantasyLeagueResultsPageComponent implements OnDestroy, OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly route = inject(ActivatedRoute);
  private readonly routeSubscription = new Subscription();

  protected readonly store = inject(FantasyLeagueResultsStore);
  protected readonly shieldAlert = ShieldAlert;
  protected readonly trophyIcon = Trophy;
  protected readonly missingResultsActions: readonly EmptyStateAction[] = [
    {
      label: 'Volver a fantasy',
      href: '/fantasy',
      tone: 'primary',
      icon: Trophy,
    },
  ];

  constructor() {
    effect(() => {
      const viewModel = this.store.viewModel();

      if (viewModel) {
        this.title.setTitle(
          `${viewModel.leagueName} · ${viewModel.hero.weekLabel} | Fantasy | KingsPadelLeague`,
        );
        this.meta.updateTag({
          name: 'description',
          content: `Resultados fantasy de ${viewModel.leagueName}: puntos de la jornada, premios, rivales directos y nuevo mercado.`,
        });

        return;
      }

      if (this.store.isNotFound()) {
        this.title.setTitle('Resultados fantasy no disponibles | KingsPadelLeague');
        this.meta.updateTag({
          name: 'description',
          content: 'Los resultados fantasy de esta liga no están disponibles en este momento.',
        });

        return;
      }

      this.title.setTitle('Resultados fantasy | KingsPadelLeague');
      this.meta.updateTag({
        name: 'description',
        content:
          'Consulta resultados fantasy semanales con ranking, premios y mercado post-jornada.',
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
