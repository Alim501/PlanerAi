import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  template: `
    <div class="star-rating" [class.interactive]="interactive">
      @for (star of stars; track $index) {
        <mat-icon
          class="star"
          [class.filled]="$index < rating"
          [class.half]="$index === Math.floor(rating) && rating % 1 !== 0"
          [class.clickable]="interactive"
          (click)="onStarClick($index + 1)"
          (mouseenter)="onStarHover($index + 1)"
          (mouseleave)="onStarLeave()"
          [matTooltip]="interactive ? ($index + 1) + ' звезд' : ''"
        >
          {{ $index < (hoverRating || rating) ? 'star' : 'star_border' }}
        </mat-icon>
      }
      @if (showCount && ratingCount !== undefined) {
        <span class="rating-count">({{ ratingCount }})</span>
      }
    </div>
  `,
  styles: [`
    .star-rating {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .star {
      font-size: 20px;
      color: #ddd;
      transition: color 0.2s;
      user-select: none;
    }

    .star.filled {
      color: #ffc107;
    }

    .star.clickable {
      cursor: pointer;
    }

    .star.clickable:hover {
      color: #ffb300;
      transform: scale(1.1);
    }

    .rating-count {
      margin-left: 8px;
      font-size: 14px;
      color: #666;
    }

    .interactive .star {
      transition: all 0.2s;
    }
  `]
})
export class StarRatingComponent {
  @Input() rating: number = 0; // Current rating (0-5)
  @Input() ratingCount?: number; // Number of ratings
  @Input() interactive: boolean = false; // Can user rate?
  @Input() showCount: boolean = true; // Show rating count?
  @Input() maxStars: number = 5;

  @Output() ratingChange = new EventEmitter<number>();

  stars: number[] = [];
  hoverRating: number = 0;
  Math = Math;

  ngOnInit() {
    this.stars = Array(this.maxStars).fill(0);
  }

  onStarClick(rating: number) {
    if (this.interactive) {
      this.rating = rating;
      this.ratingChange.emit(rating);
    }
  }

  onStarHover(rating: number) {
    if (this.interactive) {
      this.hoverRating = rating;
    }
  }

  onStarLeave() {
    if (this.interactive) {
      this.hoverRating = 0;
    }
  }
}
