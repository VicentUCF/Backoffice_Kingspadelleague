import { fireEvent, render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { FantasyPlayerAvatarComponent } from './fantasy-player-avatar.component';

describe('FantasyPlayerAvatarComponent', () => {
  it('renders the library icon when the player photo is not available', async () => {
    await render(FantasyPlayerAvatarComponent, {
      componentInputs: {
        altText: 'Vicent Ciscar',
        initials: 'v c',
        photoPath: null,
        size: 'md',
      },
    });

    expect(document.querySelector('lucide-angular')).not.toBeNull();
    expect(screen.queryByRole('img', { name: /Vicent Ciscar/i })).toBeNull();
  });

  it('renders the player image when a photo path is available', async () => {
    await render(FantasyPlayerAvatarComponent, {
      componentInputs: {
        altText: 'Vicent Ciscar',
        initials: 'VC',
        photoPath: '/stock_players/player-01.svg',
        size: 'lg',
      },
    });

    expect(screen.getByRole('img', { name: /Vicent Ciscar/i })).toBeVisible();
    expect(document.querySelector('lucide-angular')).toBeNull();
  });

  it('falls back to the library icon when the player image fails to load', async () => {
    await render(FantasyPlayerAvatarComponent, {
      componentInputs: {
        altText: 'Vicent Ciscar',
        initials: 'VC',
        photoPath: '/stock_players/player-06.svg',
        size: 'lg',
      },
    });

    fireEvent.error(screen.getByRole('img', { name: /Vicent Ciscar/i }));

    expect(document.querySelector('lucide-angular')).not.toBeNull();
    expect(screen.queryByRole('img', { name: /Vicent Ciscar/i })).toBeNull();
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(FantasyPlayerAvatarComponent, {
      componentInputs: {
        altText: 'Vicent Ciscar',
        initials: 'VC',
        photoPath: null,
        size: 'sm',
      },
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
