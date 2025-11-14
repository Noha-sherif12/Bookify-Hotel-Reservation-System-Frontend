import { Injectable } from '@angular/core';

export interface ToastNotification {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastNotificationService {
  private toastContainer: HTMLElement | null = null;

  constructor() {
    this.initializeToastContainer();
  }

  private initializeToastContainer(): void {
    if (!this.toastContainer) {
      this.toastContainer = document.createElement('div');
      this.toastContainer.id = 'toast-container';
      this.toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      `;
      document.body.appendChild(this.toastContainer);
    }
  }

  show(notification: ToastNotification): void {
    this.initializeToastContainer();
    const duration = notification.duration || 4000;

    const toast = document.createElement('div');
    const bgColor = this.getBackgroundColor(notification.type);
    const icon = this.getIcon(notification.type);

    toast.style.cssText = `
      padding: 16px;
      border-radius: 8px;
      background-color: ${bgColor};
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
      min-width: 300px;
    `;

    toast.innerHTML = `
      <span style="font-size: 18px;">${icon}</span>
      <span>${notification.message}</span>
      <button style="
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 20px;
        padding: 0;
        margin-left: auto;
      ">&times;</button>
    `;

    toast.querySelector('button')?.addEventListener('click', () => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    });

    this.toastContainer!.appendChild(toast);

    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
  }

  success(message: string, duration?: number): void {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): void {
    this.show({ message, type: 'error', duration });
  }

  info(message: string, duration?: number): void {
    this.show({ message, type: 'info', duration });
  }

  warning(message: string, duration?: number): void {
    this.show({ message, type: 'warning', duration });
  }

  private getBackgroundColor(type: string): string {
    const colors: { [key: string]: string } = {
      success: '#28a745',
      error: '#dc3545',
      info: '#17a2b8',
      warning: '#ffc107'
    };
    return colors[type] || '#17a2b8';
  }

  private getIcon(type: string): string {
    const icons: { [key: string]: string } = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠'
    };
    return icons[type] || 'ℹ';
  }
}

// Add styles for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
