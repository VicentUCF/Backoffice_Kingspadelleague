import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { LucideAngularModule, User } from 'lucide-angular';

const AVATAR_CONFIG = {
  sm: {
    dimension: 56,
    fallbackIconSize: 22,
  },
  md: {
    dimension: 64,
    fallbackIconSize: 28,
  },
  lg: {
    dimension: 72,
    fallbackIconSize: 32,
  },
  xl: {
    dimension: 96,
    fallbackIconSize: 40,
  },
} as const;

@Component({
  selector: 'app-fantasy-player-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, NgOptimizedImage],
  host: { class: 'fantasy-player-avatar' },
  templateUrl: './fantasy-player-avatar.component.html',
  styleUrl: './fantasy-player-avatar.component.scss',
})
export class FantasyPlayerAvatarComponent {
  private readonly failedPhotoPath = signal<string | null>(null);

  readonly altText = input('');
  readonly initials = input.required<string>();
  readonly photoPath = input<string | null>(null);
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  protected readonly config = computed(() => AVATAR_CONFIG[this.size()]);
  protected readonly dimension = computed(() => this.config().dimension);
  protected readonly fallbackIconSize = computed(() => this.config().fallbackIconSize);
  protected readonly resolvedPhotoPath = computed(() => {
    const photoPath = this.photoPath();

    if (!photoPath || this.failedPhotoPath() === photoPath) {
      return null;
    }

    return photoPath;
  });
  protected readonly sizeCssValue = computed(() => `${this.dimension()}px`);
  protected readonly userIcon = User;

  protected handleImageError(): void {
    this.failedPhotoPath.set(this.photoPath());
  }
}
