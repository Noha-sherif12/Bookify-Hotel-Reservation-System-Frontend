import { Component } from '@angular/core';
import { ILogin } from '../../models/iusers';
import { UserRegister } from '../../services/user-register';
import { UserAuth } from '../../services/user-auth';
import { AuthStateService } from '../../services/auth-state.service';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login {
  loginUser: ILogin = {
    email: '',
    password: '',
  };

  constructor(
    private apiRegister: UserRegister,
    private userAuth: UserAuth,
    private authStateService: AuthStateService,
    private router: Router
  ) {}

  // onLogin(form: NgForm) {
  //   this.apiRegister.login(this.loginUser).subscribe({
  //     next: (response) => {
  //       console.log('Login successful:', response);
        
  //       // Save token if available
  //       if (response.token) {
  //         this.userAuth.saveToken(response.token);
  //       } else if (response.accessToken) {
  //         this.userAuth.saveToken(response.accessToken);
  //       } else if (response.jwt) {
  //         this.userAuth.saveToken(response.jwt);
  //       } else if (response.data?.token) {
  //         this.userAuth.saveToken(response.data.token);
  //       }

  //       // Save user data if available
  //       if (response.user) {
  //         this.userAuth.saveUser(response.user);
  //       } else if (response.data?.user) {
  //         this.userAuth.saveUser(response.data.user);
  //       } else if (response.userName) {
  //         // If only username is available, create a minimal user object
  //         this.userAuth.saveUser({
  //           userName: response.userName,
  //           email: this.loginUser.email
  //         });
  //       } else {
  //         // Extract name from email address if no user data is provided
  //         const extractedName = this.extractNameFromEmail(this.loginUser.email);
  //         this.userAuth.saveUser({
  //           userName: extractedName,
  //           email: this.loginUser.email,
  //           firstName: extractedName
  //         });
  //       }

  //       // Notify other components about successful login
  //       this.authStateService.setAuthState(true);

  //       this.router.navigate(['/profile']);
  //     },
  //     error: (error) => {
  //       console.error('Login failed:', error);
  //       alert('Login failed: ' + (error.error?.message || error.message || 'Please check your credentials'));
  //     }
  //   });
  // }
  onLogin(form: NgForm) {
  this.apiRegister.login(this.loginUser).subscribe({
    next: (response) => {
      console.log('Login successful:', response);
      
      // Save token if available
      if (response.token) {
        this.userAuth.saveToken(response.token);
      }

      // 🚨 CRITICAL FIX: Always save user with role information
      // If roles come from backend, use them. Otherwise use a default.
      const userData = {
        userName: response.userName || this.extractNameFromEmail(this.loginUser.email),
        email: this.loginUser.email,
        roles: response.roles || ['Customer'] // Default to Customer if no roles in response
      };
      
      this.userAuth.saveUser(userData);
      console.log('💾 User data saved with roles:', userData.roles);

      // Notify other components
      this.authStateService.setAuthState(true);

      // 🔥 Check role and redirect
      if (this.userAuth.isAdmin()) {
        console.log('🎯 User is Admin - redirecting to admin dashboard');
        this.router.navigate(['/admin/dashboard']);
      } else {
        console.log('🎯 User is Customer - redirecting to profile');
        this.router.navigate(['/profile']);
      }
    },
    error: (error) => {
      console.error('Login failed:', error);
      alert('Login failed: ' + (error.error?.message || 'Please check your credentials'));
    }
  });
}

  private extractNameFromEmail(email: string): string {
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
}
