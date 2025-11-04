
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { UserAuth } from '../services/user-auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(UserAuth);
  
  // Get the auth token from the service
  const token = authService.getToken();
  
  // If we have a token, add it to the request
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }
  
  // If no token, just pass the request through
  return next(req);
};