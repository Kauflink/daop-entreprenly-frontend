import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserInfoCard } from '../../components/user-info-card/user-info-card';
import { UpdateProfileCard } from '../../components/update-profile-card/update-profile-card';
import { PhoneVerifyCard } from '../../components/phone-verify-card/phone-verify-card';
import { PreferencesCard } from '../../components/preferences-card/preferences-card';
import { EmailChangeCard } from '../../components/email-change-card/email-change-card';
import { NotificationsCard } from '../../components/notifications-card/notifications-card';
import { ChangePasswordCard } from '../../components/change-password-card/change-password-card';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-profile-page',
  imports: [
    UserInfoCard,
    UpdateProfileCard,
    PhoneVerifyCard,
    PreferencesCard,
    EmailChangeCard,
    NotificationsCard,
    ChangePasswordCard,
    TranslatePipe,
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {}
