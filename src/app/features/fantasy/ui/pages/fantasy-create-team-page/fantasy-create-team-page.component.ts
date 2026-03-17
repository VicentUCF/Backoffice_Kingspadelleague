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
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, ShieldAlert, Users } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { BaseInputComponent } from '@shared/ui/base-input/base-input.component';
import { BaseSelectComponent } from '@shared/ui/base-select/base-select.component';
import { ConfirmActionDialogComponent } from '@shared/ui/confirm-action-dialog/confirm-action-dialog.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { FantasyLeagueSectionNavComponent } from '@features/fantasy/ui/components/fantasy-league-section-nav/fantasy-league-section-nav.component';
import { FantasyPlayerAvatarComponent } from '@features/fantasy/ui/components/fantasy-player-avatar/fantasy-player-avatar.component';
import { FantasyTeamDraftStore } from '@features/fantasy/ui/state/fantasy-team-draft.store';

interface DraftConfirmationState {
  readonly action: 'clear-draft' | 'remove-player';
  readonly confirmLabel: string;
  readonly confirmTone: 'danger' | 'neutral';
  readonly description: string;
  readonly playerId?: string;
  readonly title: string;
}

@Component({
  selector: 'app-fantasy-create-team-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BaseInputComponent,
    BaseSelectComponent,
    ConfirmActionDialogComponent,
    EmptyStateComponent,
    FantasyLeagueSectionNavComponent,
    FantasyPlayerAvatarComponent,
    FormsModule,
    LucideAngularModule,
  ],
  providers: [FantasyTeamDraftStore],
  host: { class: 'fantasy-page' },
  templateUrl: './fantasy-create-team-page.component.html',
  styleUrl: './fantasy-create-team-page.component.scss',
})
export class FantasyCreateTeamPageComponent implements OnDestroy, OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly route = inject(ActivatedRoute);
  private readonly routeSubscription = new Subscription();
  protected readonly confirmState = signal<DraftConfirmationState | null>(null);
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
          content: summary.hasExistingTeam
            ? `${summary.heading} en ${summary.leagueName}: usa tu plantilla como porra previa o ajusta el equipo final cuando ya estén las alineaciones del viernes.`
            : `${summary.heading} en ${summary.leagueName}: gestiona un borrador de pretemporada con seis jugadores, capitán y presupuesto controlado.`,
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
      summary.hasExistingTeam
        ? summary.flowMode === 'prediction'
          ? `Porra guardada: ${summary.captainName} lidera la alineación que presentarás el viernes.`
          : `Equipo guardado: ${summary.captainName} lidera los titulares definitivos de ${summary.teamName}.`
        : `Plantilla guardada: ${summary.teamName} con ${summary.captainName} como capitán.`,
    );
  }

  protected requestClearDraft(): void {
    const summary = this.store.summary();

    this.confirmState.set({
      action: 'clear-draft',
      confirmLabel: summary?.hasExistingTeam ? 'Recuperar porra' : 'Vaciar borrador',
      confirmTone: summary?.hasExistingTeam ? 'neutral' : 'danger',
      description: summary?.hasExistingTeam
        ? 'Quitaremos los ajustes hechos tras el viernes y volverás a la alineación que enviaste como porra.'
        : 'Se eliminará la selección actual y tendrás que volver a construir la plantilla desde cero.',
      title: summary?.hasExistingTeam ? 'Volver a la porra enviada' : 'Vaciar borrador actual',
    });
  }

  protected requestRemovePlayer(playerId: string, playerName: string): void {
    this.confirmState.set({
      action: 'remove-player',
      confirmLabel: 'Quitar jugador',
      confirmTone: 'danger',
      description: `Quitaremos a ${playerName} de la plantilla actual para liberar hueco y presupuesto.`,
      playerId,
      title: `Quitar a ${playerName}`,
    });
  }

  protected closeConfirmation(): void {
    this.confirmState.set(null);
  }

  protected confirmAction(): void {
    const confirmation = this.confirmState();

    if (!confirmation) {
      return;
    }

    if (confirmation.action === 'clear-draft') {
      this.store.clearDraft();
    }

    if (confirmation.action === 'remove-player' && confirmation.playerId) {
      this.store.togglePlayer(confirmation.playerId);
    }

    this.confirmState.set(null);
  }
}
