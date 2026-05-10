import { Injectable } from '@angular/core';
import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { WhatsappSession } from '../domain/model/whatsapp-session.entity';
import { WhatsappSessionResource, WhatsappSessionsResponse } from './whatsapp-sessions-response';

@Injectable({ providedIn: 'root' })
export class WhatsappSessionAssembler implements BaseAssembler<WhatsappSession, WhatsappSessionResource, WhatsappSessionsResponse> {
  toEntityFromResource(resource: WhatsappSessionResource): WhatsappSession {
    return { ...resource };
  }

  toResourceFromEntity(entity: WhatsappSession): WhatsappSessionResource {
    return { ...entity };
  }

  toEntitiesFromResponse(response: WhatsappSessionsResponse): WhatsappSession[] {
    return response.sessions.map(r => this.toEntityFromResource(r));
  }
}
