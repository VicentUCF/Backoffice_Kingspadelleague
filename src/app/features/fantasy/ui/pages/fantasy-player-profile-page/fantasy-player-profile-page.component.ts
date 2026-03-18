import { Location, NgOptimizedImage, ViewportScroller } from '@angular/common';
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
import { ArrowLeft, LucideAngularModule, Search, ShieldAlert } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { FantasyPlayerAvatarComponent } from '@features/fantasy/ui/components/fantasy-player-avatar/fantasy-player-avatar.component';
import { FantasyPlayerProfileStore } from '@features/fantasy/ui/state/fantasy-player-profile.store';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-fantasy-player-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EmptyStateComponent,
    FantasyPlayerAvatarComponent,
    LucideAngularModule,
    NgOptimizedImage,
  ],
  providers: [FantasyPlayerProfileStore],
  host: { class: 'fantasy-page fantasy-player-profile-page o-container o-stack' },
  templateUrl: './fantasy-player-profile-page.component.html',
  styleUrl: './fantasy-player-profile-page.component.scss',
})
export class FantasyPlayerProfilePageComponent implements OnDestroy, OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly routeSubscription = new Subscription();

  protected readonly store = inject(FantasyPlayerProfileStore);
  protected readonly arrowLeftIcon = ArrowLeft;
  protected readonly searchIcon = Search;
  protected readonly shieldAlert = ShieldAlert;

  constructor() {
    effect(() => {
      const player = this.store.player();

      if (player) {
        this.title.setTitle(player.pageTitle);
        this.meta.updateTag({
          name: 'description',
          content: player.metaDescription,
        });

        return;
      }

      if (this.store.isNotFound()) {
        this.title.setTitle('Jugador fantasy no encontrado | KingsPadelLeague');
        this.meta.updateTag({
          name: 'description',
          content:
            'El jugador fantasy solicitado no está disponible. Vuelve a la pantalla anterior para seguir explorando el mercado.',
        });

        return;
      }

      this.title.setTitle('Jugador fantasy | KingsPadelLeague');
      this.meta.updateTag({
        name: 'description',
        content:
          'Consulta valor, historial de precio, señales de compra y contexto fantasy de un jugador en KingsPadelLeague.',
      });
    });
  }

  ngOnInit(): void {
    this.routeSubscription.add(
      this.route.paramMap.subscribe((paramMap) => {
        this.viewportScroller.scrollToPosition([0, 0]);
        void this.store.load(paramMap.get('playerId'));
      }),
    );
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  protected goBack(): void {
    this.location.back();
  }
}
