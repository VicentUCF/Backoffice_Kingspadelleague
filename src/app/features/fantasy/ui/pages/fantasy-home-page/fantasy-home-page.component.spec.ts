import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideFantasyFeature } from '../../providers/fantasy.providers';
import { FantasyHomePageComponent } from './fantasy-home-page.component';

describe('FantasyHomePageComponent', () => {
  it('renders the fantasy landing with current leagues and main actions', async () => {
    await render(FantasyHomePageComponent, {
      providers: [provideFantasyFeature(), provideRouter([])],
    });

    expect(
      await screen.findByRole('heading', {
        name: /Prepara tu plantilla antes de que empiece la liga/i,
      }),
    ).toBeVisible();
    expect(await screen.findByText('Amigos del curro')).toBeVisible();
    expect(screen.getByRole('link', { name: /Crear liga/i })).toHaveAttribute(
      'href',
      '/fantasy/leagues/create',
    );
  });

  it('has no accessibility violations in the fantasy home', async () => {
    const { container } = await render(FantasyHomePageComponent, {
      providers: [provideFantasyFeature(), provideRouter([])],
    });

    await screen.findByText('Amigos del curro');

    expect(await axe(container)).toHaveNoViolations();
  });
});
