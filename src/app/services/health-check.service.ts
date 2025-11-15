import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, map, startWith } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface HealthCheckResponse {
  status: string;
  checks: {
    [key: string]: {
      status: string;
      description: string;
      duration: string;
    }
  };
  totalDuration: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class HealthCheckService {
  private healthCheckUrl = `${environment.baseUrl}/health`;
  private lastHealthStatus: HealthCheckResponse | null = null;

  constructor(private httpClient: HttpClient) {
    this.startPeriodicHealthCheck();
  }

  getHealthStatus(): Observable<HealthCheckResponse> {
    return this.httpClient.get<HealthCheckResponse>(this.healthCheckUrl, {
      withCredentials: true
    });
  }

  private startPeriodicHealthCheck(): void {
    // Check health every 30 seconds
    interval(30000)
      .pipe(
        startWith(0),
        map(() => this.getHealthStatus())
      )
      .subscribe(
        (healthCheck$) => {
          healthCheck$.subscribe(
            (response) => {
              this.lastHealthStatus = response;
              console.log('✅ Health Check Status:', response.status);
            },
            (error) => {
              console.error('❌ Health Check Failed:', error);
            }
          );
        }
      );
  }

  getLastHealthStatus(): HealthCheckResponse | null {
    return this.lastHealthStatus;
  }

  isHealthy(): boolean {
    return this.lastHealthStatus?.status === 'Healthy';
  }
}
