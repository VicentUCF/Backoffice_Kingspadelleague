import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  type OnDestroy,
  type OnInit,
} from '@angular/core';

@Component({
  selector: 'app-fantasy-live-countdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'fantasy-live-countdown',
    '[attr.data-urgent]': 'urgent() ? "true" : null',
  },
  templateUrl: './fantasy-live-countdown.component.html',
  styleUrl: './fantasy-live-countdown.component.scss',
})
export class FantasyLiveCountdownComponent implements OnDestroy, OnInit {
  readonly targetIso = input<string | null>(null);
  readonly urgent = input(false);

  private countdownIntervalId: number | null = null;
  private readonly now = signal(Date.now());

  protected readonly countdownLabel = computed(() => {
    return formatCountdown(this.targetIso(), this.now());
  });

  ngOnInit(): void {
    this.countdownIntervalId = window.setInterval(() => {
      this.now.set(Date.now());
    }, 1_000);
  }

  ngOnDestroy(): void {
    if (this.countdownIntervalId !== null) {
      window.clearInterval(this.countdownIntervalId);
    }
  }
}

function formatCountdown(targetIso: string | null, now: number): string {
  if (!targetIso) {
    return 'Sin hora confirmada';
  }

  const remainingMilliseconds = new Date(targetIso).getTime() - now;

  if (remainingMilliseconds <= 0) {
    return '00h 00m 00s';
  }

  const totalSeconds = Math.floor(remainingMilliseconds / 1_000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  const timeLabel = `${padCountdownValue(hours)}h ${padCountdownValue(minutes)}m ${padCountdownValue(seconds)}s`;

  return days > 0 ? `${days}d ${timeLabel}` : timeLabel;
}

function padCountdownValue(value: number): string {
  return `${value}`.padStart(2, '0');
}
