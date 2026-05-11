import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { SessionStatus } from '../domain/model/whatsapp-session.entity';

export interface WhatsappSessionResource extends BaseResource {
  sellerId: number;
  phone: string;
  businessName: string;
  status: SessionStatus;
  connectedAt?: string;
  qrCode?: string;
}

export interface WhatsappSessionsResponse extends BaseResponse {
  sessions: WhatsappSessionResource[];
}
