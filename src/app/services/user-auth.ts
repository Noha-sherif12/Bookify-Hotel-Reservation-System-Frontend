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
// Add to UserAuth service
decodeToken(): any {
  const token = this.getToken();
  if (!token) {
    console.log('❌ No token found');
    return null;
  }
  
  try {
    // JWT tokens have 3 parts: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.log('❌ Invalid token format - not a JWT');
      return null;
    }
    
    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    console.log('🔑 TOKEN DEBUG INFO:');
    console.log('🔑 Full token (first 50 chars):', token.substring(0, 50) + '...');
    console.log('🔑 Token payload:', payload);
    
    // Check for specific claims
    console.log('🔑 Available claims:');
    Object.keys(payload).forEach(key => {
      console.log(`  ${key}:`, payload[key]);
    });
    
    // Check for common user ID claims
    console.log('🔑 Looking for user ID in claims:');
    console.log('  sub (what backend expects):', payload.sub);
    console.log('  nameid:', payload.nameid);
    console.log('  userId:', payload.userId);
    console.log('  id:', payload.id);
    console.log('  unique_name:', payload.unique_name);
    
    // Check expiration
    if (payload.exp) {
      const expiryDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expiryDate < now;
      console.log('🔑 Token expiry:', expiryDate.toISOString());
      console.log('🔑 Current time:', now.toISOString());
      console.log('🔑 Token expired?', isExpired);
    }
    
    return payload;
  } catch (error) {
    console.error('❌ Error decoding token:', error);
    return null;
  }
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
