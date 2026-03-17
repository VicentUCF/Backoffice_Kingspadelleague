import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CirclePlus, Trophy } from 'lucide-angular';

import {
  EmptyStateComponent,
  type EmptyStateAction,
} from '@shared/ui/empty-state/empty-state.component';

import { FantasyLeagueCardComponent } from '@features/fantasy/ui/components/fantasy-league-card/fantasy-league-card.component';
import { FantasyLeaguesStore } from '@features/fantasy/ui/state/fantasy-leagues.store';

@Component({
  selector: 'app-fantasy-leagues-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EmptyStateComponent, FantasyLeagueCardComponent],
  providers: [FantasyLeaguesStore],
  host: { class: 'fantasy-page fantasy-leagues-page o-container o-stack' },
  templateUrl: './fantasy-leagues-page.component.html',
  styleUrl: './fantasy-leagues-page.component.scss',
})
export class FantasyLeaguesPageComponent implements OnInit {
  protected readonly store = inject(FantasyLeaguesStore);
  protected readonly trophyIcon = Trophy;
  protected readonly emptyStateActions: readonly EmptyStateAction[] = [
    {
      label: 'Crear liga',
      href: '/fantasy/leagues/create',
      tone: 'primary',
      icon: CirclePlus,
    },
  ];

  ngOnInit(): void {
    void this.store.load();
  }
}
