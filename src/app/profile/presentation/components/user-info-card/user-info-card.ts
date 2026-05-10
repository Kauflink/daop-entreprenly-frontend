import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ProfileStore } from '../../../application/profile-store';

@Component({
  selector: 'app-user-info-card',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <div class="inner">
        <div class="avatar" aria-hidden="true">
          @if (store.profile().avatarUrl) {
            <img
              [src]="store.profile().avatarUrl"
              [alt]="store.fullName()"
              class="avatar__img"
            />
          } @else {
            <mat-icon class="avatar__icon">person</mat-icon>
          }
        </div>
        <div class="info">
          <p class="info__name">{{ store.fullName() }}</p>
          <p class="info__role">{{ store.roleAndPlan() }}</p>
        </div>
      </div>
    </div>
  `,
  styles: `
    .card {
      background: #ffffff;
      border: 1px solid #c9c9c9;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.25);
      border-radius: 25px;
      padding: 16px;
    }
    .inner {
      display: flex;
      align-items: center;
      gap: 20px;
      background: #fbfaf8;
      border-radius: 25px;
      padding: 20px;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.25);
    }
    .avatar {
      width: 86px;
      height: 86px;
      border-radius: 50%;
      background: #0c0f12;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }
    .avatar__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .avatar__icon {
      color: #ffffff;
      font-size: 44px;
      width: 44px;
      height: 44px;
    }
    .info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info__name {
      font-family: 'Reddit Sans', sans-serif;
      font-weight: 500;
      font-size: 16px;
      line-height: 21px;
      color: #0c0f12;
      margin: 0;
    }
    .info__role {
      font-family: 'Reddit Sans', sans-serif;
      font-weight: 500;
      font-size: 13px;
      line-height: 17px;
      color: #939392;
      margin: 0;
    }
  `,
})
export class UserInfoCard {
  protected readonly store = inject(ProfileStore);
}
