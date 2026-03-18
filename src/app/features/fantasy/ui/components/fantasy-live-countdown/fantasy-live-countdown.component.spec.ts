import { render, screen } from '@testing-library/angular';

import { FantasyLiveCountdownComponent } from './fantasy-live-countdown.component';

describe('FantasyLiveCountdownComponent', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the remaining time without leaking timer logic to the page', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(0);

    const { fixture } = await render(FantasyLiveCountdownComponent, {
      componentInputs: {
        targetIso: new Date(3_661_000).toISOString(),
        urgent: true,
      },
    });

    expect(screen.getByText('01h 01m 01s')).toBeVisible();
    expect(fixture.nativeElement).toHaveAttribute('data-urgent', 'true');
  });
});
