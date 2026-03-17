import { NgOptimizedImage } from '@angular/common';
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
import { ArrowRight, LucideAngularModule, ShieldAlert, Users } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { FantasyLeagueDashboardStore } from '@features/fantasy/ui/state/fantasy-league-dashboard.store';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-fantasy-team-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent, LucideAngularModule, NgOptimizedImage, RouterLink],
  providers: [FantasyLeagueDashboardStore],
  host: { class: 'fantasy-page fantasy-team-page o-container o-stack' },
  templateUrl: './fantasy-team-page.component.html',
  styleUrl: './fantasy-team-page.component.scss',
})
export class FantasyTeamPageComponent implements OnDestroy, OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly route = inject(ActivatedRoute);
  private readonly routeSubscription = new Subscription();

  protected readonly store = inject(FantasyLeagueDashboardStore);
  protected readonly arrowRightIcon = ArrowRight;
  protected readonly rosterIcon = Users;
  protected readonly shieldAlert = ShieldAlert;

  constructor() {
    effect(() => {
      const viewModel = this.store.viewModel();

      if (viewModel) {
        this.title.setTitle(`Mi equipo · ${viewModel.leagueName} | Fantasy | KingsPadelLeague`);
        this.meta.updateTag({
          name: 'description',
          content: `Gestiona el roster fantasy de ${viewModel.leagueName}, revisa titulares, suplentes y ajusta tu equipo de pretemporada.`,
        });

        return;
      }

      if (this.store.isNotFound()) {
        this.title.setTitle('Equipo fantasy no encontrado | KingsPadelLeague');
        this.meta.updateTag({
          name: 'description',
          content:
            'La liga fantasy solicitada no está disponible para consultar tu equipo o plantilla actual.',
        });

        return;
      }

      this.title.setTitle('Mi equipo fantasy | KingsPadelLeague');
      this.meta.updateTag({
        name: 'description',
        content:
          'Consulta tu equipo fantasy en KingsPadelLeague con una vista completa de titulares, rotación y presupuesto.',
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
