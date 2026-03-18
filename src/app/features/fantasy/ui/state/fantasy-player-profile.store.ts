import { computed, inject, Injectable, signal } from '@angular/core';

import {
  toFantasyPlayerProfileViewModel,
  type FantasyPlayerProfileViewModel,
} from '@features/fantasy/ui/models/fantasy-player-profile.viewmodel';
import { LOAD_FANTASY_PLAYER_PROFILE_USE_CASE } from '@features/fantasy/ui/providers/fantasy.providers';

@Injectable()
export class FantasyPlayerProfileStore {
  private readonly loadProfileUseCase = inject(LOAD_FANTASY_PLAYER_PROFILE_USE_CASE);

  readonly player = signal<FantasyPlayerProfileViewModel | null>(null);
  readonly currentPlayerId = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isNotFound = computed(() => {
    return (
      !this.isLoading() &&
      this.currentPlayerId() !== null &&
      this.player() === null &&
      this.errorMessage() === null
    );
  });

  async load(playerId: string | null): Promise<void> {
    this.currentPlayerId.set(playerId);
    this.player.set(null);
    this.errorMessage.set(null);

    if (!playerId) {
      return;
    }

    this.isLoading.set(true);

    try {
      const player = await this.loadProfileUseCase.execute(playerId);

      this.player.set(player ? toFantasyPlayerProfileViewModel(player) : null);
    } catch {
      this.errorMessage.set('No hemos podido cargar el perfil del jugador.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
