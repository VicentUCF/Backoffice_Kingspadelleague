import { inject, Injectable, signal } from '@angular/core';

import { type FantasyPlayer } from '@features/fantasy/domain/entities/fantasy.models';
import { LOAD_FANTASY_PLAYER_PROFILE_USE_CASE } from '@features/fantasy/ui/providers/fantasy.providers';

@Injectable()
export class FantasyPlayerProfileStore {
  private readonly loadProfileUseCase = inject(LOAD_FANTASY_PLAYER_PROFILE_USE_CASE);

  readonly player = signal<FantasyPlayer | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  async load(playerId: string): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.player.set(await this.loadProfileUseCase.execute(playerId));
    } catch {
      this.errorMessage.set('No pudimos cargar el perfil del jugador fantasy.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
