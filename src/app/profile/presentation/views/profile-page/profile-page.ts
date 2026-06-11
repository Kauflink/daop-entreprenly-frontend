import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserInfoCard } from '../../components/user-info-card/user-info-card';
import { UpdateProfileCard } from '../../components/update-profile-card/update-profile-card';
import { PreferencesCard } from '../../components/preferences-card/preferences-card';
import { NotificationsCard } from '../../components/notifications-card/notifications-card';
import { AccountSecurityCard } from '../../components/account-security-card/account-security-card';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-page',
  imports: [
    UserInfoCard,
    UpdateProfileCard,
    PreferencesCard,
    NotificationsCard,
    AccountSecurityCard,
    TranslatePipe,
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {}
