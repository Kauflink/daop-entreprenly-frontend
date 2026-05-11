import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { WhatsappSession } from '../domain/model/whatsapp-session.entity';
import { WhatsappSessionResource, WhatsappSessionsResponse } from './whatsapp-sessions-response';
import { WhatsappSessionAssembler } from './whatsapp-session-assembler';

export class WhatsappSessionsApiEndpoint extends BaseApiEndpoint<
  WhatsappSession,
  WhatsappSessionResource,
  WhatsappSessionsResponse,
  WhatsappSessionAssembler
> {
  constructor(http: HttpClient, assembler: WhatsappSessionAssembler) {
    super(http, 'http://localhost:3000/whatsapp-sessions', assembler);
  }
}
