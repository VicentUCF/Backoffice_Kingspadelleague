import { type FantasyHomeExperience } from '@features/fantasy/domain/entities/fantasy.models';

import { type FantasyRepository } from '../ports/fantasy.repository';

export class LoadFantasyHomeExperienceUseCase {
  constructor(private readonly fantasyRepository: FantasyRepository) {}

  execute(): Promise<FantasyHomeExperience> {
    return this.fantasyRepository.loadHomeExperience();
  }
}
