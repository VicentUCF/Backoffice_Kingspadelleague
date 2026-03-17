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
import { LucideAngularModule, Search, ShieldAlert } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { FantasyPlayerAvatarComponent } from '@features/fantasy/ui/components/fantasy-player-avatar/fantasy-player-avatar.component';
import { FantasyPlayerProfileStore } from '@features/fantasy/ui/state/fantasy-player-profile.store';
import {
  EmptyStateComponent,
  type EmptyStateAction,
} from '@shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-fantasy-player-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EmptyStateComponent,
    FantasyPlayerAvatarComponent,
    LucideAngularModule,
    NgOptimizedImage,
    RouterLink,
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
  private readonly routeSubscription = new Subscription();

  protected readonly store = inject(FantasyPlayerProfileStore);
  protected readonly searchIcon = Search;
  protected readonly shieldAlert = ShieldAlert;
  protected readonly backToLeaguesActions: readonly EmptyStateAction[] = [
    {
      label: 'Volver a mis ligas',
      href: '/fantasy/leagues',
      tone: 'primary',
    },
  ];

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
            'El jugador fantasy solicitado no está disponible. Vuelve a una de tus ligas para seguir explorando el mercado.',
        });

        return;
      }

      this.title.setTitle('Jugador fantasy | KingsPadelLeague');
      this.meta.updateTag({
        name: 'description',
        content:
          'Consulta el valor, el rol y la información de mercado de un jugador dentro del fantasy de KingsPadelLeague.',
      });
    });
  }

  ngOnInit(): void {
    this.routeSubscription.add(
      this.route.paramMap.subscribe((paramMap) => {
        void this.store.load(paramMap.get('playerId'));
      }),
    );
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }
}
