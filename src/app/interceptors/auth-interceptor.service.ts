import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserAuth } from '../services/user-auth';
import { LoggingService } from '../services/logging.service';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(UserAuth);
  const loggingService = inject(LoggingService);
  
  // Get the auth token from the service
  const token = authService.getToken();
  
  // If we have a token, add it to the request
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    loggingService.debug('Adding Authorization header to request', { url: req.url });
    return next(cloned).pipe(
      tap(event => {
        if (event.type === 4) { // HttpResponse
          loggingService.debug('Auth request succeeded', { url: req.url, status: event.status });
        }
      }),
      catchError(error => {
        loggingService.error('Auth request failed', { url: req.url, status: error.status, message: error.message });
        return throwError(() => error);
      })
    );
  }
  
  // If no token, just pass the request through
  return next(req);
};
