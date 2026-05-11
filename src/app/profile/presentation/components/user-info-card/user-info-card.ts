import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ProfileStore } from '../../../application/profile-store';

@Component({
  selector: 'app-user-info-card',
  imports: [MatIconModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-info-card.html',
  styleUrl: './user-info-card.css',
})
export class UserInfoCard {
  protected readonly store = inject(ProfileStore);
}
