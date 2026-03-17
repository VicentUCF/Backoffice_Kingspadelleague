import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fantasy-join-league-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  host: { class: 'fantasy-page o-container o-stack' },
  templateUrl: './fantasy-join-league-page.component.html',
})
export class FantasyJoinLeaguePageComponent {
  readonly joinMessage = signal<string | null>(null);

  joinLeague(code: string): void {
    this.joinMessage.set(`Solicitud enviada para la liga con código ${code.toUpperCase()}.`);
  }
}
