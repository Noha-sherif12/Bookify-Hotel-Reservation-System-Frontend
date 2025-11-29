import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserAuth } from '../../services/user-auth';
import { AuthStateService } from '../../services/auth-state.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';



@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit, OnDestroy{

  isUserLoggedIn: boolean = false;
  currentUser: any = null;
  username: string = '';
  private authSubscription?: Subscription;

  constructor(
    public userAuthSer: UserAuth,
    private authStateService: AuthStateService
  ){

  }
  
  ngOnInit(): void {
    this.checkAuthStatus();
    
    // Subscribe to auth state changes
    this.authSubscription = this.authStateService.authState$.subscribe(() => {
      this.checkAuthStatus();
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  checkAuthStatus(): void {
    this.isUserLoggedIn = this.userAuthSer.isAuthenticated();
    if (this.isUserLoggedIn) {
      this.currentUser = this.userAuthSer.getUser();
      // Prioritize firstName, then userName, then extract from email
      this.username = this.currentUser?.firstName || 
                     this.currentUser?.userName || 
                     this.extractNameFromEmail(this.currentUser?.email) || 
                     'User';
    } else {
      this.currentUser = null;
      this.username = '';
    }
  }

  // Public method to refresh auth status (can be called from other components)
  refreshAuthStatus(): void {
    this.checkAuthStatus();
  }

  private extractNameFromEmail(email: string): string {
    if (!email) return '';
    
    // Extract the part before @ symbol
    const emailPart = email.split('@')[0];
    
    // Handle common email patterns
    if (emailPart.includes('.')) {
      // If email contains dots, split and capitalize each part
      const nameParts = emailPart.split('.');
      return nameParts.map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join(' ');
    } else if (emailPart.includes('_')) {
      // If email contains underscores, split and capitalize each part
      const nameParts = emailPart.split('_');
      return nameParts.map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join(' ');
    } else if (emailPart.includes('-')) {
      // If email contains hyphens, split and capitalize each part
      const nameParts = emailPart.split('-');
      return nameParts.map(part => 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join(' ');
    } else {
      // If no separators, just capitalize the first letter
      return emailPart.charAt(0).toUpperCase() + emailPart.slice(1).toLowerCase();
    }
  }

  logout(): void {
    this.userAuthSer.logout();
    this.isUserLoggedIn = false;
    this.currentUser = null;
    this.username = '';
    // Notify other components about logout
    this.authStateService.setAuthState(false);
    // Optionally redirect to home page
    window.location.href = '/home';
  }

}
