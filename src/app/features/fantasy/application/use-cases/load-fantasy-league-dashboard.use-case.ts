import { type FantasyLeagueDashboard } from '@features/fantasy/domain/entities/fantasy.models';

import { type FantasyRepository } from '../ports/fantasy.repository';

export class LoadFantasyLeagueDashboardUseCase {
  constructor(private readonly fantasyRepository: FantasyRepository) {}

  execute(leagueId: string): Promise<FantasyLeagueDashboard | null> {
    return this.fantasyRepository.loadLeagueDashboard(leagueId);
  }
}
