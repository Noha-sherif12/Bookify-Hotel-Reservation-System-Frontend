import { Injectable } from '@angular/core';

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG';
  message: string;
  details?: any;
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private logs: LogEntry[] = [];
  private maxLogs = 100; // Keep only last 100 logs in memory

  constructor() {
    this.setupErrorHandler();
  }

  info(message: string, details?: any): void {
    this.log('INFO', message, details);
  }

  warning(message: string, details?: any): void {
    this.log('WARNING', message, details);
  }

  error(message: string, details?: any): void {
    this.log('ERROR', message, details);
  }

  debug(message: string, details?: any): void {
    this.log('DEBUG', message, details);
  }

  private log(level: 'INFO' | 'WARNING' | 'ERROR' | 'DEBUG', message: string, details?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details
    };

    this.logs.push(entry);

    // Keep only last 100 logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Also log to console with styling
    const color = this.getConsoleColor(level);
    const style = `color: ${color}; font-weight: bold;`;
    console.log(`%c[${level}] ${message}`, style, details || '');

    // Send error logs to server (optional)
    if (level === 'ERROR') {
      this.sendLogToServer(entry);
    }
  }

  private getConsoleColor(level: string): string {
    const colors: { [key: string]: string } = {
      INFO: '#0066cc',
      WARNING: '#ff9900',
      ERROR: '#cc0000',
      DEBUG: '#666666'
    };
    return colors[level] || '#000000';
  }

  private sendLogToServer(entry: LogEntry): void {
    // This would send error logs to the backend for persistent logging
    // Implement based on your backend logging endpoint
    console.log('📤 Sending error log to server:', entry);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByLevel(level: string): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  clearLogs(): void {
    this.logs = [];
    console.log('🗑️ Logs cleared');
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  downloadLogs(): void {
    const logsJson = this.exportLogs();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(logsJson));
    element.setAttribute('download', `logs-${new Date().toISOString()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    this.info('Logs downloaded');
  }

  private setupErrorHandler(): void {
    // Global error handler for uncaught errors
    window.addEventListener('error', (event) => {
      this.error('Uncaught Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason
      });
    });
  }
}
