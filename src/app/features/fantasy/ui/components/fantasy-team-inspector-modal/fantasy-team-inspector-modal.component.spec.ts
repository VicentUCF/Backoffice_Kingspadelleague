import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { type FantasyTeamInspectorViewModel } from '@features/fantasy/ui/models/fantasy-league-dashboard.viewmodel';

import { FantasyTeamInspectorModalComponent } from './fantasy-team-inspector-modal.component';

describe('FantasyTeamInspectorModalComponent', () => {
  it('renders dedicated scroll regions for starters and rotation inside the component', async () => {
    await render(FantasyTeamInspectorModalComponent, {
      componentInputs: {
        isOpen: true,
        team: createFantasyTeamInspectorViewModel(),
      },
      providers: [provideRouter([])],
    });

    await screen.findByRole('dialog', { name: /Previa Imperial/i });

    expect(screen.getByRole('region', { name: /Titulares del equipo/i })).toBeVisible();
    expect(screen.getByRole('region', { name: /Rotación del equipo/i })).toBeVisible();
  });

  it('has no accessibility violations while open', async () => {
    const { container } = await render(FantasyTeamInspectorModalComponent, {
      componentInputs: {
        isOpen: true,
        team: createFantasyTeamInspectorViewModel(),
      },
      providers: [provideRouter([])],
    });

    await screen.findByRole('dialog', { name: /Previa Imperial/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});

function createFantasyTeamInspectorViewModel(): FantasyTeamInspectorViewModel {
  return {
    bench: [
      createRosterPlayerViewModel('titanics-player-4', 'Dani Sanchez', 'Titanics', null),
      createRosterPlayerViewModel('sin-equipo-player-1', 'Artur Peris', 'Sin equipo todavía', null),
    ],
    captainName: 'Borja Vercher',
    formationLabel: '4 titulares · 2 rotaciones',
    isMe: true,
    managerName: 'Vicent',
    matchdayPointsLabel: '0 pts',
    playersCountLabel: '6 jugadores',
    rankLabel: '#1',
    starters: [
      createRosterPlayerViewModel(
        'kings-of-favar-player-1',
        'Vicent Ciscar',
        'Kings Of Favar',
        null,
      ),
      createRosterPlayerViewModel(
        'thormentadores-player-1',
        'Borja Vercher',
        'Thormentadores',
        'Capitán x2',
      ),
      createRosterPlayerViewModel('magic-city-player-1', 'Adri Alvarez', 'Magic City', null),
      createRosterPlayerViewModel('barbaridad-player-2', 'Miguel Esteve', 'Barbaridad Team', null),
    ],
    teamId: 'team-league-1',
    teamName: 'Previa Imperial',
    teamValueLabel: '86,2 M €',
    totalPointsLabel: '0 pts',
  };
}

function createRosterPlayerViewModel(
  id: string,
  name: string,
  teamName: string,
  captainLabel: string | null,
) {
  return {
    avatar: name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
    captainLabel,
    detailLink: `/fantasy/players/${id}`,
    id,
    name,
    photoPath: null,
    priceLabel: '15,4 M €',
    roleLabel: 'Presidente',
    scoutingNote: 'Perfil fantasy listo para revisar.',
    sideLabel: 'Ambas',
    teamLogoPath: null,
    teamName,
    totalPointsLabel: '35 pts',
  };
}
