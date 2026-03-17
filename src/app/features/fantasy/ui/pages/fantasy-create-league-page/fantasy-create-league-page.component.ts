import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { BaseInputComponent } from '@shared/ui/base-input/base-input.component';
import { BaseTextareaComponent } from '@shared/ui/base-textarea/base-textarea.component';
import { CREATE_FANTASY_LEAGUE_USE_CASE } from '@features/fantasy/ui/providers/fantasy.providers';

interface CreatedFantasyLeagueViewModel {
  readonly code: string;
  readonly dashboardLink: string;
  readonly leagueName: string;
  readonly marketLink: string;
  readonly memberCountLabel: string;
  readonly teamCreationLink: string;
}

@Component({
  selector: 'app-fantasy-create-league-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, BaseInputComponent, BaseTextareaComponent, RouterLink],
  host: { class: 'fantasy-page fantasy-create-league-page o-container o-stack' },
  templateUrl: './fantasy-create-league-page.component.html',
  styleUrl: './fantasy-create-league-page.component.scss',
})
export class FantasyCreateLeaguePageComponent {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly createFantasyLeagueUseCase = inject(CREATE_FANTASY_LEAGUE_USE_CASE);

  readonly leagueName = signal('');
  readonly leagueDescription = signal('');
  readonly createdLeague = signal<CreatedFantasyLeagueViewModel | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly isSubmitting = signal(false);

  constructor() {
    this.title.setTitle('Crear liga fantasy | KingsPadelLeague');
    this.meta.updateTag({
      name: 'description',
      content:
        'Crea una nueva liga fantasy privada y genera su código de invitación para compartirlo con tus rivales.',
    });
  }

  async createLeague(): Promise<void> {
    this.createdLeague.set(null);
    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    try {
      const dashboard = await this.createFantasyLeagueUseCase.execute({
        name: this.leagueName(),
        description: this.leagueDescription(),
      });

      this.createdLeague.set({
        code: dashboard.league.code,
        dashboardLink: `/fantasy/leagues/${dashboard.league.id}`,
        leagueName: dashboard.league.name,
        marketLink: `/fantasy/leagues/${dashboard.league.id}/market`,
        memberCountLabel: `${dashboard.league.memberCount} participante${
          dashboard.league.memberCount === 1 ? '' : 's'
        }`,
        teamCreationLink: `/fantasy/leagues/${dashboard.league.id}/create-team`,
      });
    } catch {
      this.errorMessage.set('No hemos podido crear la liga fantasy. Inténtalo de nuevo.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
