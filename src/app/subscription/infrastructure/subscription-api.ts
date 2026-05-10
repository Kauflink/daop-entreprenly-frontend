import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SubscriptionDashboard } from '../domain/model/subscription-dashboard.entity';
import { SubscriptionAssembler } from './subscription-assembler';
import { SUBSCRIPTION_DASHBOARD_RESPONSE } from './subscription-dashboard.mock';
import { SubscriptionDashboardResponse } from './subscription-response';

@Injectable({
  providedIn: 'root',
})
export class SubscriptionApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.entreprenlyProviderApiBaseUrl;
  private readonly subscriptionDashboardEndpoint =
    environment.entreprenlyProviderSubscriptionDashboardEndpointPath;

  getSubscriptionDashboard(): Observable<SubscriptionDashboard> {
    return this.http
      .get<SubscriptionDashboardResponse>(`${this.baseUrl}${this.subscriptionDashboardEndpoint}`)
      .pipe(
        catchError(() => of(SUBSCRIPTION_DASHBOARD_RESPONSE)),
        map((response) => SubscriptionAssembler.toEntityFromResponse(response)),
      );
  }
}
