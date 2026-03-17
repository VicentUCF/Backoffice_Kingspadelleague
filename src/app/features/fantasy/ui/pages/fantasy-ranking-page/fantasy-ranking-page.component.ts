import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ShieldAlert } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { FantasyLeagueSectionNavComponent } from '@features/fantasy/ui/components/fantasy-league-section-nav/fantasy-league-section-nav.component';
import { FantasyRankingTableComponent } from '@features/fantasy/ui/components/fantasy-ranking-table/fantasy-ranking-table.component';
import { FantasyTeamInspectorModalComponent } from '@features/fantasy/ui/components/fantasy-team-inspector-modal/fantasy-team-inspector-modal.component';
import { FantasyLeagueDashboardStore } from '@features/fantasy/ui/state/fantasy-league-dashboard.store';
import {
  EmptyStateComponent,
  type EmptyStateAction,
} from '@shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-fantasy-ranking-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    EmptyStateComponent,
    FantasyLeagueSectionNavComponent,
    FantasyRankingTableComponent,
    FantasyTeamInspectorModalComponent,
  ],
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
  protected readonly selectedTeamId = signal<string | null>(null);
  protected readonly missingLeagueActions: readonly EmptyStateAction[] = [
    {
      label: 'Volver a mis ligas',
      href: '/fantasy/leagues',
      tone: 'primary',
    },
  ];
  protected readonly leadingEntry = computed(
    () => this.store.viewModel()?.rankingEntries[0] ?? null,
  );
  protected readonly podiumEntries = computed(() => {
    return this.store.viewModel()?.rankingEntries.slice(0, 3) ?? [];
  });
  protected readonly selectedTeam = computed(() => {
    const teamId = this.selectedTeamId();

    if (!teamId) {
      return null;
    }

    return this.store.viewModel()?.teamRosters.find((team) => team.teamId === teamId) ?? null;
  });

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
        this.selectedTeamId.set(null);
        void this.store.load(paramMap.get('leagueId'));
      }),
    );
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  protected inspectTeam(teamId: string): void {
    this.selectedTeamId.set(teamId);
  }

  protected closeTeamInspector(): void {
    this.selectedTeamId.set(null);
  }
}
