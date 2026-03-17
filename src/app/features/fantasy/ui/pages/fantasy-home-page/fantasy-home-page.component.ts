import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CirclePlus, LogIn, Trophy } from 'lucide-angular';

import { FantasyLeagueCardComponent } from '@features/fantasy/ui/components/fantasy-league-card/fantasy-league-card.component';
import { FantasyLeaguesStore } from '@features/fantasy/ui/state/fantasy-leagues.store';
import { applicationMetadata } from '@core/config/application-metadata';
import {
  EmptyStateComponent,
  type EmptyStateAction,
} from '@shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-fantasy-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EmptyStateComponent, FantasyLeagueCardComponent],
  providers: [FantasyLeaguesStore],
  host: { class: 'fantasy-page fantasy-home-page o-container o-stack' },
  templateUrl: './fantasy-home-page.component.html',
  styleUrl: './fantasy-home-page.component.scss',
})
export class FantasyHomePageComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly store = inject(FantasyLeaguesStore);
  protected readonly trophyIcon = Trophy;
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

  ngOnInit(): void {
    this.title.setTitle('Fantasy | KingsPadelLeague');
    this.meta.updateTag({
      name: 'description',
      content: `${applicationMetadata.name} Fantasy: crea ligas privadas, construye tu plantilla de pretemporada y trabaja el mercado con el roster real de la liga.`,
    });

    void this.store.load();
  }
}
