
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserAuth } from './user-auth';
import { ToastNotificationService } from './toast-notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthCheckService {
  
  constructor(
    private userAuth: UserAuth,
    private router: Router,
    private toastService: ToastNotificationService
  ) {}

  // Check if user can perform an action (add to cart, book now)
  canPerformAction(action: 'add-to-cart' | 'checkout' | 'book-now'): boolean {
    if (this.userAuth.isAuthenticated()) {
      return true;
    }

    // Get current URL for return
    const returnUrl = this.router.url;
    
    // Custom messages based on action
    let message = 'Please login to continue';
    if (action === 'add-to-cart') {
      message = 'Please login to add items to your cart';
    } else if (action === 'checkout' || action === 'book-now') {
      message = 'Please login to proceed with booking';
    }
    
    this.toastService.warning(message);
    
    // Redirect to login with return URL
    this.router.navigate(['/login'], {
      queryParams: { returnUrl, action }
    });
    
    return false;
  }

  // Simple check without redirect (for UI display)
  isUserLoggedIn(): boolean {
    return this.userAuth.isAuthenticated();
  }

  // Get user info safely
  getUserInfo(): { name?: string; email?: string } {
    const user = this.userAuth.getUser();
    return {
      name: user?.name || user?.fullName,
      email: user?.email
    };
  }
}