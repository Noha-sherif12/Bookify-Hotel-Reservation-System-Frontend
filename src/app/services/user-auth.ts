import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class UserAuth {

   private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  constructor() {}

  saveToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
      console.log('💾 Token saved to localStorage');
    } catch (e) {
      console.error('❌ Error saving token to localStorage:', e);
    }
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (e) {
      console.error('❌ Error getting token from localStorage:', e);
      return null;
    }
  }

  saveUser(user: any): void {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      console.log('💾 User data saved to localStorage');
    } catch (e) {
      console.error('❌ Error saving user data to localStorage:', e);
    }
  }

  getUser(): any {
    try {
      const user = localStorage.getItem(this.USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (e) {
      console.error('❌ Error getting user data from localStorage:', e);
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
  isAdmin(): boolean {
  const user = this.getUser();
  const roles = user?.roles || [];
  return roles.includes('Admin');
}

  logout(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      console.log('✅ Auth data cleared from localStorage');
    } catch (e) {
      console.error('❌ Error clearing auth data from localStorage:', e);
    }
  }

  // Optional: Clear all localStorage (use with caution)
  clearAll(): void {
    try {
      localStorage.clear();
      console.log('✅ All localStorage cleared');
    } catch (e) {
      console.error('❌ Error clearing localStorage:', e);
    }
  }
}
