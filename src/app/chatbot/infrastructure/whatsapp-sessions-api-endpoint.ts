import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
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
    super(http, `${environment.entreprenlyProviderApiBaseUrl}${environment.entreprenlyProviderWhatsappSessionsEndpointPath}`, assembler);
  }
}
