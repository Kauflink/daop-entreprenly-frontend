import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { Currency } from '../../shared/infrastructure/currency-service';

export interface UserProfileResource extends BaseResource {
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  role: string;
  plan: string;
}

export interface UserPreferencesResource extends BaseResource {
  language: string;
  timezone: string;
  theme: 'light' | 'dark';
  currency?: Currency;
}

export interface NotificationSettingsResource extends BaseResource {
  stock_alerts: boolean;
  payment_alerts: boolean;
  chatbot_messages: boolean;
}

export interface UserProfileResponse extends BaseResponse {
  data: UserProfileResource;
}
