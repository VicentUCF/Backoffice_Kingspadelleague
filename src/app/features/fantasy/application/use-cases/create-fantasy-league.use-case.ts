import {
  type CreateFantasyLeagueCommand,
  type FantasyLeagueDashboard,
} from '@features/fantasy/domain/entities/fantasy.models';

import { type FantasyRepository } from '../ports/fantasy.repository';

export class CreateFantasyLeagueUseCase {
  constructor(private readonly fantasyRepository: FantasyRepository) {}

  execute(command: CreateFantasyLeagueCommand): Promise<FantasyLeagueDashboard> {
    return this.fantasyRepository.createLeague(command);
  }
}
