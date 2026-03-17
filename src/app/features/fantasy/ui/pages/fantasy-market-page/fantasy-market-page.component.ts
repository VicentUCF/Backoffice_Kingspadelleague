import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { LucideAngularModule, ShieldAlert, SlidersHorizontal } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { BaseInputComponent } from '@shared/ui/base-input/base-input.component';
import { BaseSelectComponent } from '@shared/ui/base-select/base-select.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { FantasyMvpCardComponent } from '@features/fantasy/ui/components/fantasy-mvp-card/fantasy-mvp-card.component';
import { FantasyMarketStore } from '@features/fantasy/ui/state/fantasy-market.store';

@Component({
  selector: 'app-fantasy-market-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BaseInputComponent,
    BaseSelectComponent,
    EmptyStateComponent,
    FantasyMvpCardComponent,
    FormsModule,
    LucideAngularModule,
    NgOptimizedImage,
    RouterLink,
  ],
  providers: [FantasyMarketStore],
  host: { class: 'fantasy-page fantasy-market-page o-container o-stack' },
  templateUrl: './fantasy-market-page.component.html',
  styleUrl: './fantasy-market-page.component.scss',
})
export class FantasyMarketPageComponent implements OnDestroy, OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly route = inject(ActivatedRoute);
  private readonly routeSubscription = new Subscription();

  protected readonly store = inject(FantasyMarketStore);
  protected readonly filtersIcon = SlidersHorizontal;
  protected readonly shieldAlert = ShieldAlert;

  constructor() {
    effect(() => {
      const viewModel = this.store.viewModel();

      if (viewModel) {
        this.title.setTitle(`Mercado · ${viewModel.leagueName} | Fantasy | KingsPadelLeague`);
        this.meta.updateTag({
          name: 'description',
          content: `Mercado fantasy de ${viewModel.leagueName}: revisa el roster real de la liga, compara precios y prepara tu plantilla de pretemporada.`,
        });

        return;
      }

      if (this.store.isNotFound()) {
        this.title.setTitle('Mercado fantasy no encontrado | KingsPadelLeague');
        this.meta.updateTag({
          name: 'description',
          content:
            'La liga fantasy solicitada no está disponible para consultar su mercado de jugadores.',
        });

        return;
      }

      this.title.setTitle('Mercado fantasy | KingsPadelLeague');
      this.meta.updateTag({
        name: 'description',
        content:
          'Consulta el mercado fantasy de KingsPadelLeague para construir plantilla con el roster real de la liga.',
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
