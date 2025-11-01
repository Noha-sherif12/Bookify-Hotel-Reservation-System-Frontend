import { Component } from '@angular/core';

@Component({
  selector: 'app-access-denied',
  imports: [],
  template: `
    <div class="container mt-5 text-center">
      <h1 class="text-danger">403 - Access Denied</h1>
      <p>You don't have permission to access this page.</p>
      <a routerLink="/" class="btn btn-primary">Go Home</a>
    </div>
  `
})
export class AccessDeniedComponent {}