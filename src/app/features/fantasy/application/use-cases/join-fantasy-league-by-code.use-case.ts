import { type FantasyLeagueDashboard } from '@features/fantasy/domain/entities/fantasy.models';

import { type FantasyRepository } from '../ports/fantasy.repository';

export class JoinFantasyLeagueByCodeUseCase {
  constructor(private readonly fantasyRepository: FantasyRepository) {}

  execute(code: string): Promise<FantasyLeagueDashboard | null> {
    return this.fantasyRepository.joinLeagueByCode(code);
  }
}
