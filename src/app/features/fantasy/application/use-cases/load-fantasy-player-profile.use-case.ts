import { type FantasyPlayer } from '@features/fantasy/domain/entities/fantasy.models';

import { type FantasyRepository } from '../ports/fantasy.repository';

export class LoadFantasyPlayerProfileUseCase {
  constructor(private readonly fantasyRepository: FantasyRepository) {}

  execute(playerId: string): Promise<FantasyPlayer | null> {
    return this.fantasyRepository.loadPlayerProfile(playerId);
  }
}
