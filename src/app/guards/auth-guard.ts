
import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserAuth } from '../services/user-auth';
import { ToastNotificationService } from '../services/toast-notification.service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const userAuth = inject(UserAuth);
  const router = inject(Router);
  const toastService = inject(ToastNotificationService);

  if (userAuth.isAuthenticated()) {
    return true;
  } else {
    // Store the attempted URL for redirecting after login
    const returnUrl = state.url;
    
    // Show warning message
    toastService.warning('Please login to access this page');
    
    // Navigate to login with return URL
    router.navigate(['/login'], { 
      queryParams: { returnUrl } 
    });
    return false;
  }
};
