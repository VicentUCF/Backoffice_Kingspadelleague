import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { FantasyTeamDraftStore } from '@features/fantasy/ui/state/fantasy-team-draft.store';

import { provideFantasyFeature } from '../../providers/fantasy.providers';
import { FantasyCreateTeamPageComponent } from './fantasy-create-team-page.component';

describe('FantasyCreateTeamPageComponent', () => {
  it('renders lineup mode from the purchased roster when the team already exists', async () => {
    await render(FantasyCreateTeamPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    expect(
      await screen.findByRole('heading', { name: /Edita tu equipo tras el viernes/i }),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: /Tu cuarteto actual/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Rotación disponible/i })).toBeVisible();
    expect(
      screen.getByText(/La porra ya quedó cerrada. Ahora eliges el equipo definitivo/i),
    ).toBeVisible();
    expect(screen.queryByLabelText(/Buscar jugador/i)).toBeNull();
    expect(
      screen.getAllByRole('button', { name: /Mover a rotación|Poner titular/i }).length,
    ).toBeGreaterThan(0);
    const startersPanel = screen
      .getByRole('heading', { name: /Tu cuarteto actual/i })
      .closest('article');
    const rotationPanel = screen
      .getByRole('heading', { name: /Rotación disponible/i })
      .closest('article');

    expect(startersPanel).not.toBeNull();
    expect(rotationPanel).not.toBeNull();
    expect(
      within(startersPanel!).getAllByRole('button', { name: /Mover a rotación/i }).length,
    ).toBeGreaterThan(0);
    expect(
      within(startersPanel!).queryByRole('button', { name: /Quitar|Sacar del roster/i }),
    ).toBeNull();
    expect(within(rotationPanel!).queryByRole('button', { name: /Sacar del roster/i })).toBeNull();
    expect(
      within(rotationPanel!).getAllByRole('button', { name: /Poner titular/i }).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/Roster completo de la liga/i)).toBeNull();
  });

  it('has no accessibility violations in lineup mode', async () => {
    const { container } = await render(FantasyCreateTeamPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });

    await screen.findByRole('heading', { name: /Edita tu equipo tras el viernes/i });

    expect(await axe(container)).toHaveNoViolations();
  });

  it('moves players between starter and rotation lists without auto-swapping and updates the captain when needed', async () => {
    const { fixture } = await render(FantasyCreateTeamPageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        createActivatedRouteProvider('league-1'),
      ],
    });
    const store = fixture.componentRef.injector.get(FantasyTeamDraftStore);

    await screen.findByRole('heading', { name: /Edita tu equipo tras el viernes/i });

    const getStartersPanel = () =>
      screen.getByRole('heading', { name: /Tu cuarteto actual/i }).closest('article');
    const getRotationPanel = () =>
      screen.getByRole('heading', { name: /Rotación disponible/i }).closest('article');
    const startersPanel = getStartersPanel();
    const rotationPanel = getRotationPanel();

    expect(startersPanel).not.toBeNull();
    expect(rotationPanel).not.toBeNull();

    const vicentCard = within(startersPanel!)
      .getByRole('heading', { name: 'Vicent Ciscar', level: 4 })
      .closest('li');
    expect(vicentCard).not.toBeNull();
    fireEvent.click(within(vicentCard!).getByRole('button', { name: /Mover a rotación/i }));

    await waitFor(() => {
      const currentStartersPanel = getStartersPanel();
      const currentRotationPanel = getRotationPanel();

      expect(currentStartersPanel).not.toBeNull();
      expect(currentRotationPanel).not.toBeNull();
      expect(store.starterPlayerIds()).toEqual([
        'thormentadores-player-1',
        'magic-city-player-1',
        'barbaridad-player-2',
      ]);
      expect(getRenderedPlayerNames(currentStartersPanel!)).toEqual([
        'Borja Vercher',
        'Adri Alvarez',
        'Miguel Esteve',
      ]);
      expect(getRenderedPlayerNames(currentRotationPanel!)).toEqual([
        'Vicent Ciscar',
        'Dani Sanchez',
        'Artur Peris',
      ]);
    });

    const borjaCard = within(getStartersPanel()!)
      .getByRole('heading', { name: 'Borja Vercher', level: 4 })
      .closest('li');
    expect(borjaCard).not.toBeNull();
    fireEvent.click(within(borjaCard!).getByRole('button', { name: /Mover a rotación/i }));

    await waitFor(() => {
      const currentStartersPanel = getStartersPanel();
      const currentRotationPanel = getRotationPanel();

      expect(currentStartersPanel).not.toBeNull();
      expect(currentRotationPanel).not.toBeNull();
      expect(store.starterPlayerIds()).toEqual(['magic-city-player-1', 'barbaridad-player-2']);
      expect(store.captainId()).toBe('magic-city-player-1');
      expect(getRenderedPlayerNames(currentStartersPanel!)).toEqual([
        'Adri Alvarez',
        'Miguel Esteve',
      ]);
      expect(getRenderedPlayerNames(currentRotationPanel!)).toEqual([
        'Vicent Ciscar',
        'Borja Vercher',
        'Dani Sanchez',
        'Artur Peris',
      ]);
    });

    const captainSelect = screen.getByRole('combobox', { name: /Capitán/i }) as HTMLSelectElement;

    await waitFor(() => {
      expect(captainSelect.selectedOptions[0]?.textContent?.trim()).toBe('Adri Alvarez');
    });
  });
});

function createActivatedRouteProvider(leagueId: string) {
  const paramMap = convertToParamMap({ leagueId });

  return {
    provide: ActivatedRoute,
    useValue: {
      snapshot: { paramMap },
      paramMap: of(paramMap),
    },
  };
}

function getRenderedPlayerNames(panel: HTMLElement): string[] {
  return within(panel)
    .queryAllByRole('heading', { level: 4 })
    .map((heading) => heading.textContent?.trim() ?? '')
    .filter((name) => name.length > 0);
}
