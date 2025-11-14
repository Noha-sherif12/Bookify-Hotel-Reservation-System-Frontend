import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HealthCheckService } from '../../services/health-check.service';

@Component({
  selector: 'app-health-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="health-indicator" [class.healthy]="isHealthy" [class.unhealthy]="!isHealthy">
      <div class="status-dot" [class.pulse]="isHealthy"></div>
      <span class="status-text">
        {{ isHealthy ? 'System Operational' : 'System Offline' }}
      </span>
      @if (lastCheck) {
        <small class="last-check">Last check: {{ lastCheck | date:'short' }}</small>
      }
    </div>
  `,
  styles: [`
    .health-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      transition: all 0.3s ease;

      &.healthy {
        background-color: #d4edda;
        border-color: #28a745;
        color: #155724;
      }

      &.unhealthy {
        background-color: #f8d7da;
        border-color: #dc3545;
        color: #721c24;
      }

      .status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: currentColor;
        transition: all 0.3s ease;

        &.pulse {
          animation: pulse 2s infinite;
        }
      }

      .status-text {
        font-weight: 500;
      }

      .last-check {
        opacity: 0.7;
        display: block;
        margin-top: 4px;
      }
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `]
})
export class HealthIndicatorComponent implements OnInit {
  isHealthy: boolean = true;
  lastCheck: Date | null = null;

  constructor(private healthCheckService: HealthCheckService) {}

  ngOnInit(): void {
    this.checkHealth();
  }

  private checkHealth(): void {
    this.healthCheckService.getHealthStatus().subscribe(
      (response) => {
        this.isHealthy = response.status === 'Healthy';
        this.lastCheck = new Date(response.timestamp);
      },
      (error) => {
        this.isHealthy = false;
        this.lastCheck = new Date();
      }
    );
  }
}
