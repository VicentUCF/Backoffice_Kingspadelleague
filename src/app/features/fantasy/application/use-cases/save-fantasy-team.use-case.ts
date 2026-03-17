import { type FantasyLeagueDashboard } from '@features/fantasy/domain/entities/fantasy.models';
import { type SaveFantasyTeamCommand } from '@features/fantasy/domain/entities/fantasy.models';

import { type FantasyRepository } from '../ports/fantasy.repository';

export class SaveFantasyTeamUseCase {
  constructor(private readonly fantasyRepository: FantasyRepository) {}

  async execute(command: SaveFantasyTeamCommand): Promise<FantasyLeagueDashboard | null> {
    return this.fantasyRepository.saveTeam(command);
  }
}
