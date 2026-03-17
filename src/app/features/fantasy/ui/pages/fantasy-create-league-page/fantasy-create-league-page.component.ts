import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-fantasy-create-league-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  host: { class: 'fantasy-page o-container o-stack' },
  templateUrl: './fantasy-create-league-page.component.html',
})
export class FantasyCreateLeaguePageComponent {
  readonly generatedCode = signal<string | null>(null);

  createLeague(name: string): void {
    this.generatedCode.set(name.trim().slice(0, 4).toUpperCase().padEnd(4, 'X') + '24');
  }
}
