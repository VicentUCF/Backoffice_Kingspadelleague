import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LucideAngularModule, ShieldAlert, Users } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { BaseInputComponent } from '@shared/ui/base-input/base-input.component';
import { BaseSelectComponent } from '@shared/ui/base-select/base-select.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { FantasyTeamDraftStore } from '@features/fantasy/ui/state/fantasy-team-draft.store';

@Component({
  selector: 'app-fantasy-create-team-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BaseInputComponent,
    BaseSelectComponent,
    EmptyStateComponent,
    FormsModule,
    LucideAngularModule,
    NgOptimizedImage,
    RouterLink,
  ],
  providers: [FantasyTeamDraftStore],
  host: { class: 'fantasy-page fantasy-create-team-page o-container o-stack' },
  templateUrl: './fantasy-create-team-page.component.html',
  styleUrl: './fantasy-create-team-page.component.scss',
})
export class FantasyCreateTeamPageComponent implements OnDestroy, OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly route = inject(ActivatedRoute);
  private readonly routeSubscription = new Subscription();
  protected readonly store = inject(FantasyTeamDraftStore);
  protected readonly saveMessage = signal<string | null>(null);
  protected readonly rosterIcon = Users;
  protected readonly shieldAlert = ShieldAlert;

  constructor() {
    effect(() => {
      const summary = this.store.summary();
      const viewModel = this.store.viewModel();

      if (summary && viewModel) {
        this.title.setTitle(`${summary.heading} | Fantasy | KingsPadelLeague`);
        this.meta.updateTag({
          name: 'description',
          content: `${summary.heading} en ${summary.leagueName}: gestiona un borrador de pretemporada con seis jugadores, capitán y presupuesto controlado.`,
        });

        return;
      }

      if (this.store.isNotFound()) {
        this.title.setTitle('Plantilla fantasy no disponible | KingsPadelLeague');
        this.meta.updateTag({
          name: 'description',
          content:
            'La liga fantasy solicitada no está disponible para preparar o editar la plantilla.',
        });

        return;
      }

      this.title.setTitle('Plantilla fantasy | KingsPadelLeague');
      this.meta.updateTag({
        name: 'description',
        content:
          'Prepara tu plantilla fantasy en KingsPadelLeague y valida selección, presupuesto y capitán.',
      });
    });
  }

  ngOnInit(): void {
    this.routeSubscription.add(
      this.route.paramMap.subscribe((paramMap) => {
        this.saveMessage.set(null);
        void this.store.load(paramMap.get('leagueId'));
      }),
    );
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  protected async saveDraft(): Promise<void> {
    const saved = await this.store.save();
    const summary = this.store.summary();

    if (!saved || !summary) {
      this.saveMessage.set(null);
      return;
    }

    this.saveMessage.set(
      `Plantilla guardada: ${summary.teamName} con ${summary.captainName} como capitán.`,
    );
  }
}
