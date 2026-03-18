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
import { RouterLink } from '@angular/router';
import { CirclePlus, LogIn, Trophy } from 'lucide-angular';

import { FantasyLeagueCardComponent } from '@features/fantasy/ui/components/fantasy-league-card/fantasy-league-card.component';
import { FantasyLeagueSectionNavComponent } from '@features/fantasy/ui/components/fantasy-league-section-nav/fantasy-league-section-nav.component';
import { FantasyPlayerAvatarComponent } from '@features/fantasy/ui/components/fantasy-player-avatar/fantasy-player-avatar.component';
import { FantasyHomeStore } from '@features/fantasy/ui/state/fantasy-home.store';
import { applicationMetadata } from '@core/config/application-metadata';
import {
  EmptyStateComponent,
  type EmptyStateAction,
} from '@shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-fantasy-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    EmptyStateComponent,
    FantasyLeagueCardComponent,
    FantasyLeagueSectionNavComponent,
    FantasyPlayerAvatarComponent,
  ],
  providers: [FantasyHomeStore],
  host: { class: 'fantasy-page' },
  templateUrl: './fantasy-home-page.component.html',
  styleUrl: './fantasy-home-page.component.scss',
})
export class FantasyHomePageComponent implements OnDestroy, OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private countdownIntervalId: number | null = null;

  protected readonly store = inject(FantasyHomeStore);
  protected readonly trophyIcon = Trophy;
  protected readonly now = signal(Date.now());
  protected readonly emptyStateActions: readonly EmptyStateAction[] = [
    {
      label: 'Crear liga',
      href: '/fantasy/leagues/create',
      tone: 'primary',
      icon: CirclePlus,
    },
    {
      label: 'Unirse a una liga',
      href: '/fantasy/leagues/join',
      tone: 'secondary',
      icon: LogIn,
    },
  ];

  constructor() {
    effect(() => {
      const viewModel = this.store.viewModel();

      if (viewModel) {
        const isResultsMode = viewModel.primaryLeague.phase === 'matchday-finished';

        this.title.setTitle(
          isResultsMode
            ? `${viewModel.primaryLeague.leagueName} · Resultados fantasy | KingsPadelLeague`
            : `${viewModel.primaryLeague.leagueName} · Semana fantasy | KingsPadelLeague`,
        );
        this.meta.updateTag({
          name: 'description',
          content: isResultsMode
            ? `Consulta el cierre semanal de ${viewModel.primaryLeague.leagueName}: puntos fantasy, bonus de porra y lectura final de la jornada.`
            : `Sigue la semana fantasy de ${viewModel.primaryLeague.leagueName}: porra, mercado y ajustes antes del cierre definitivo.`,
        });

        return;
      }

      this.title.setTitle('Fantasy | KingsPadelLeague');
      this.meta.updateTag({
        name: 'description',
        content: `${applicationMetadata.name} Fantasy: crea ligas privadas, prepara tu plantilla y mueve el mercado antes de cada jornada.`,
      });
    });
  }

  ngOnInit(): void {
    this.countdownIntervalId = window.setInterval(() => {
      this.now.set(Date.now());
    }, 1_000);
    void this.store.load();
  }

  ngOnDestroy(): void {
    if (this.countdownIntervalId !== null) {
      window.clearInterval(this.countdownIntervalId);
    }
  }

  protected formatCountdown(targetIso: string | null): string {
    if (!targetIso) {
      return 'Sin hora confirmada';
    }

    const remainingMilliseconds = new Date(targetIso).getTime() - this.now();

    if (remainingMilliseconds <= 0) {
      return '00h 00m 00s';
    }

    const totalSeconds = Math.floor(remainingMilliseconds / 1_000);
    const days = Math.floor(totalSeconds / 86_400);
    const hours = Math.floor((totalSeconds % 86_400) / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);
    const seconds = totalSeconds % 60;

    const timeLabel = `${padCountdownValue(hours)}h ${padCountdownValue(minutes)}m ${padCountdownValue(seconds)}s`;

    return days > 0 ? `${days}d ${timeLabel}` : timeLabel;
  }
}

function padCountdownValue(value: number): string {
  return `${value}`.padStart(2, '0');
}
