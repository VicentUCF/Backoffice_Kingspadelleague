import { fireEvent, render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { type FantasyRankingEntryViewModel } from '@features/fantasy/ui/models/fantasy-league-dashboard.viewmodel';

import { FantasyRankingTableComponent } from './fantasy-ranking-table.component';

describe('FantasyRankingTableComponent', () => {
  it('renders the ranking as an accessible grid-like table and emits the selected team', async () => {
    const { fixture } = await render(FantasyRankingTableComponent, {
      componentInputs: {
        entries: createRankingEntries(),
      },
    });
    const viewedTeams: string[] = [];

    fixture.componentInstance.teamViewed.subscribe((teamId) => {
      viewedTeams.push(teamId);
    });

    expect(screen.getByRole('table', { name: /Clasificación fantasy de la liga/i })).toBeVisible();
    expect(screen.getAllByRole('row')).toHaveLength(3);

    await fireEvent.click(screen.getByRole('button', { name: /Ver equipo de Previa Imperial/i }));

    expect(viewedTeams).toEqual(['team-league-1']);
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(FantasyRankingTableComponent, {
      componentInputs: {
        entries: createRankingEntries(),
      },
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});

function createRankingEntries(): readonly FantasyRankingEntryViewModel[] {
  return [
    {
      canInspect: true,
      inspectLabel: 'Ver mi equipo',
      isMe: true,
      managerName: 'Vicent',
      matchdayPointsLabel: '0 pts',
      rankLabel: '#1',
      teamId: 'team-league-1',
      teamName: 'Previa Imperial',
      teamValueLabel: '86,2 M €',
      totalPointsLabel: '0 pts',
    },
    {
      canInspect: true,
      inspectLabel: 'Ver equipo',
      isMe: false,
      managerName: 'Lucía',
      matchdayPointsLabel: '35 pts',
      rankLabel: '#2',
      teamId: 'team-league-2',
      teamName: 'Drive de Oficina',
      teamValueLabel: '83,2 M €',
      totalPointsLabel: '181 pts',
    },
  ];
}
