import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import {
  LOAD_FANTASY_HOME_EXPERIENCE_USE_CASE,
  provideFantasyFeature,
} from '../../providers/fantasy.providers';
import {
  createFantasyHomeExperience,
  createFantasyWeeklyCycle,
} from '../../../testing/fantasy-test.fixtures';
import { FantasyHomePageComponent } from './fantasy-home-page.component';

describe('FantasyHomePageComponent', () => {
  it('renders the post-friday home with bonus de porra and edit CTA', async () => {
    const { container } = await render(FantasyHomePageComponent, {
      providers: [provideFantasyFeature(), provideRouter([])],
    });

    expect(await screen.findByRole('heading', { name: /Tu porra ya está cerrada/i })).toBeVisible();
    expect(screen.getAllByText(/Bonus de porra/i).length).toBeGreaterThan(0);
    expect(
      screen
        .getAllByRole('link', { name: /Resumen/i })
        .some((link) => link.getAttribute('href') === '/fantasy'),
    ).toBe(true);
    expect(
      screen
        .getAllByRole('link', { name: /^Mercado$/i })
        .some((link) => link.getAttribute('href') === '/fantasy/leagues/league-1/market'),
    ).toBe(true);
    expect(screen.getByRole('link', { name: /Editar equipo/i })).toHaveAttribute(
      'href',
      '/fantasy/leagues/league-1/create-team',
    );
    expect(screen.getByText(/Colegas pádel/i)).toBeVisible();
    expect(
      screen
        .getByRole('heading', { name: /Tu porra ya está cerrada/i })
        .closest('[data-motion="hero"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-motion="section-nav"]')).not.toBeNull();
    expect(screen.getByText('Aciertos').closest('[data-motion="stagger-item"]')).toHaveAttribute(
      'style',
      expect.stringContaining('--fantasy-motion-index: 0'),
    );
  });

  it('renders the prediction-open home with the plantilla-first porra CTA', async () => {
    const experience = createFantasyHomeExperience();

    await render(FantasyHomePageComponent, {
      providers: [
        provideFantasyFeature(),
        provideRouter([]),
        {
          provide: LOAD_FANTASY_HOME_EXPERIENCE_USE_CASE,
          useValue: {
            execute: async () => ({
              ...experience,
              primaryLeague: experience.primaryLeague
                ? {
                    ...experience.primaryLeague,
                    weeklyCycle: createFantasyWeeklyCycle({
                      phase: 'prediction-open',
                      phaseLabel: 'Haz tu porra',
                      headline: 'Tu plantilla previa será tu porra',
                      predictionOutcome: null,
                    }),
                  }
                : null,
            }),
          },
        },
      ],
    });

    expect(
      await screen.findByRole('heading', { name: /Tu plantilla previa será tu porra/i }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /Hacer porra/i })).toHaveAttribute(
      'href',
      '/fantasy/leagues/league-1/create-team',
    );
  });

  it('has no accessibility violations in the fantasy home', async () => {
    const { container } = await render(FantasyHomePageComponent, {
      providers: [provideFantasyFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Tu porra ya está cerrada/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
