import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';

import { BaseInputComponent } from '@shared/ui/base-input/base-input.component';
import { JOIN_FANTASY_LEAGUE_BY_CODE_USE_CASE } from '@features/fantasy/ui/providers/fantasy.providers';
import { toFantasyLeagueDashboardViewModel } from '@features/fantasy/ui/models/fantasy-league-dashboard.viewmodel';

interface JoinedFantasyLeagueViewModel {
  readonly dashboardLink: string;
  readonly leagueName: string;
  readonly marketLink: string;
  readonly memberCountLabel: string;
  readonly nextLink: string;
  readonly nextLabel: string;
  readonly phaseLabel: string;
}

@Component({
  selector: 'app-fantasy-join-league-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, BaseInputComponent],
  host: { class: 'fantasy-page fantasy-join-league-page o-container o-stack' },
  templateUrl: './fantasy-join-league-page.component.html',
  styleUrl: './fantasy-join-league-page.component.scss',
})
export class FantasyJoinLeaguePageComponent {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly joinFantasyLeagueByCodeUseCase = inject(JOIN_FANTASY_LEAGUE_BY_CODE_USE_CASE);

  readonly leagueCode = signal('');
  readonly joinedLeague = signal<JoinedFantasyLeagueViewModel | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  constructor() {
    this.title.setTitle('Unirse a una liga fantasy | KingsPadelLeague');
    this.meta.updateTag({
      name: 'description',
      content: 'Accede a una liga fantasy privada usando un código de invitación válido.',
    });
  }

  async joinLeague(): Promise<void> {
    this.joinedLeague.set(null);
    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    try {
      const dashboard = await this.joinFantasyLeagueByCodeUseCase.execute(this.leagueCode());

      if (!dashboard) {
        this.errorMessage.set(
          'No hemos encontrado ninguna liga con ese código. Revisa el acceso y vuelve a intentarlo.',
        );
        return;
      }

      const viewModel = toFantasyLeagueDashboardViewModel(dashboard);

      this.joinedLeague.set({
        dashboardLink: `/fantasy/leagues/${dashboard.league.id}`,
        leagueName: viewModel.leagueName,
        marketLink: viewModel.marketLink,
        memberCountLabel: viewModel.memberCountLabel,
        nextLink: viewModel.hasTeam ? viewModel.teamLink : viewModel.teamCreationLink,
        nextLabel: viewModel.hasTeam ? 'Ir a mi equipo' : 'Preparar mi equipo',
        phaseLabel: viewModel.phaseLabel,
      });
      this.leagueCode.set(dashboard.league.code);
    } catch {
      this.errorMessage.set('No hemos podido validar el código fantasy. Inténtalo de nuevo.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
