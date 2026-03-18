import { NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, ShieldAlert, SlidersHorizontal } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { ActionToastStore } from '@core/state/action-toast.store';
import { BaseInputComponent } from '@shared/ui/base-input/base-input.component';
import { BaseSelectComponent } from '@shared/ui/base-select/base-select.component';
import { ConfirmActionDialogComponent } from '@shared/ui/confirm-action-dialog/confirm-action-dialog.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { FANTASY_TEAM_INITIAL_BUDGET } from '@features/fantasy/domain/services/build-fantasy-team-draft';
import { FantasyPlayerAvatarComponent } from '@features/fantasy/ui/components/fantasy-player-avatar/fantasy-player-avatar.component';
import { FantasyMvpCardComponent } from '@features/fantasy/ui/components/fantasy-mvp-card/fantasy-mvp-card.component';
import { FantasyLeagueSectionNavComponent } from '@features/fantasy/ui/components/fantasy-league-section-nav/fantasy-league-section-nav.component';
import { formatFantasyMoney } from '@features/fantasy/ui/models/fantasy-number.formatter';
import {
  FantasyMarketStore,
  type FantasyMarketListPlayerViewModel,
} from '@features/fantasy/ui/state/fantasy-market.store';

interface MarketTransactionConfirmationState {
  readonly action: 'buy' | 'sell';
  readonly confirmLabel: string;
  readonly confirmTone: 'danger' | 'neutral';
  readonly description: string;
  readonly playerId: string;
  readonly playerName: string;
  readonly title: string;
}

@Component({
  selector: 'app-fantasy-market-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BaseInputComponent,
    BaseSelectComponent,
    ConfirmActionDialogComponent,
    EmptyStateComponent,
    FantasyLeagueSectionNavComponent,
    FantasyMvpCardComponent,
    FantasyPlayerAvatarComponent,
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
  private readonly toastStore = inject(ActionToastStore);
  private readonly routeSubscription = new Subscription();

  protected readonly store = inject(FantasyMarketStore);
  protected readonly filtersIcon = SlidersHorizontal;
  protected readonly shieldAlert = ShieldAlert;
  protected readonly confirmState = signal<MarketTransactionConfirmationState | null>(null);

  constructor() {
    effect(() => {
      const viewModel = this.store.viewModel();

      if (viewModel) {
        this.title.setTitle(`Mercado · ${viewModel.leagueName} | Fantasy | KingsPadelLeague`);
        this.meta.updateTag({
          name: 'description',
          content: `Mercado fantasy de ${viewModel.leagueName}: compara precios, detecta oportunidades y ajusta tu plantilla.`,
        });

        return;
      }

      if (this.store.isNotFound()) {
        this.title.setTitle('Mercado fantasy no encontrado | KingsPadelLeague');
        this.meta.updateTag({
          name: 'description',
          content: 'La liga fantasy solicitada no está disponible para consultar su mercado.',
        });

        return;
      }

      this.title.setTitle('Mercado fantasy | KingsPadelLeague');
      this.meta.updateTag({
        name: 'description',
        content:
          'Consulta el mercado fantasy de KingsPadelLeague para fichar, vender y ajustar tu plantilla.',
      });
    });
  }

  ngOnInit(): void {
    this.routeSubscription.add(
      this.route.paramMap.subscribe((paramMap) => {
        this.confirmState.set(null);
        void this.store.load(paramMap.get('leagueId'));
      }),
    );
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  protected requestBuyPlayer(player: FantasyMarketListPlayerViewModel): void {
    const budgetRemaining =
      this.store.dashboard()?.myTeam?.budgetRemaining ?? FANTASY_TEAM_INITIAL_BUDGET;
    const occupiedSlots = this.store.dashboard()?.myTeam?.players.length ?? 0;
    const nextBudget = Math.max(0, budgetRemaining - player.priceValue);
    const nextSlots = Math.min(6, occupiedSlots + 1);

    this.confirmState.set({
      action: 'buy',
      confirmLabel: 'Confirmar fichaje',
      confirmTone: 'neutral',
      description: `Ficharás a ${player.name} por ${player.priceLabel}. Tu presupuesto bajará a ${formatFantasyMoney(nextBudget)} y pasarás a ${nextSlots}/6 plazas ocupadas.`,
      playerId: player.id,
      playerName: player.name,
      title: `Fichar a ${player.name}`,
    });
  }

  protected requestSellPlayer(player: FantasyMarketListPlayerViewModel): void {
    const budgetRemaining =
      this.store.dashboard()?.myTeam?.budgetRemaining ?? FANTASY_TEAM_INITIAL_BUDGET;
    const occupiedSlots = this.store.dashboard()?.myTeam?.players.length ?? 0;
    const nextBudget = budgetRemaining + player.priceValue;
    const nextSlots = Math.max(0, occupiedSlots - 1);

    this.confirmState.set({
      action: 'sell',
      confirmLabel: 'Confirmar venta',
      confirmTone: 'danger',
      description: `Venderás a ${player.name} y recuperarás ${player.priceLabel}. Tu presupuesto subirá a ${formatFantasyMoney(nextBudget)} y te quedarás con ${nextSlots}/6 plazas ocupadas.`,
      playerId: player.id,
      playerName: player.name,
      title: `Vender a ${player.name}`,
    });
  }

  protected closeConfirmation(): void {
    this.confirmState.set(null);
  }

  protected async confirmTransaction(): Promise<void> {
    const confirmation = this.confirmState();

    if (!confirmation) {
      return;
    }

    const wasSuccessful =
      confirmation.action === 'buy'
        ? await this.store.buyPlayer(confirmation.playerId)
        : await this.store.sellPlayer(confirmation.playerId);

    if (wasSuccessful) {
      this.toastStore.success(
        confirmation.action === 'buy'
          ? `Has comprado a ${confirmation.playerName}.`
          : `Has vendido a ${confirmation.playerName}.`,
        confirmation.action === 'buy' ? 'Fichaje completado' : 'Venta completada',
      );
    } else if (this.store.errorMessage()) {
      this.toastStore.error(this.store.errorMessage()!, 'No se ha podido completar el movimiento');
    }

    this.confirmState.set(null);
  }

  protected resetFilters(): void {
    this.store.resetFilters();
  }
}
