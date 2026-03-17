import { type FantasyLeague } from '@features/fantasy/domain/entities/fantasy.models';

import { type FantasyRepository } from '../ports/fantasy.repository';

export class LoadMyFantasyLeaguesUseCase {
  constructor(private readonly fantasyRepository: FantasyRepository) {}

  execute(): Promise<readonly FantasyLeague[]> {
    return this.fantasyRepository.loadMyLeagues();
  }
}
