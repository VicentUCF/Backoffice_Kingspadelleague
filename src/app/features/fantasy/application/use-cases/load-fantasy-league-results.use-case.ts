import { type FantasyLeagueResults } from '@features/fantasy/domain/entities/fantasy.models';

import { type FantasyRepository } from '../ports/fantasy.repository';

export class LoadFantasyLeagueResultsUseCase {
  constructor(private readonly fantasyRepository: FantasyRepository) {}

  execute(leagueId: string): Promise<FantasyLeagueResults | null> {
    return this.fantasyRepository.loadLeagueResults(leagueId);
  }
}
