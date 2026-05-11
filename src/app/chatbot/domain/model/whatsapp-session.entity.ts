import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export type SessionStatus = 'connected' | 'disconnected' | 'expired';

export interface WhatsappSession extends BaseEntity {
  sellerId: number;
  phone: string;
  businessName: string;
  status: SessionStatus;
  connectedAt?: string;
  qrCode?: string;
}
