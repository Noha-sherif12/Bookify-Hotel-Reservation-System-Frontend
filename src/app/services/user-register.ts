import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IUsers, ILogin } from '../models/iusers';
import { environment } from '../../environments/environment.development';
import { Observable, throwError, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserAuth } from './user-auth';
@Injectable({
  providedIn: 'root'
})
export class UserRegister {
  constructor(private httpClient: HttpClient, private authService: UserAuth) {}

  register(user: IUsers): Observable<any> {
  console.log('🚀 Sending registration data:', JSON.stringify(user, null, 2));
  console.log('📡 URL:', `${environment.baseUrl}/api/Auth/register`);

  return this.httpClient.post<any>(
    `${environment.baseUrl}/api/Auth/register`,
    user
  ).pipe(
    tap((response) => {
      console.log('✅ Registration successful:', response);

      // Handle different response structures
      if (response.token) {
        this.authService.saveToken(response.token);
        console.log('💾 Token saved to localStorage');
      } else if (response.accessToken) {
        this.authService.saveToken(response.accessToken);
        console.log('💾 Access token saved to localStorage');
      } else if (response.jwt) {
        this.authService.saveToken(response.jwt);
        console.log('💾 JWT token saved to localStorage');
      } else if (response.data?.token) {
        this.authService.saveToken(response.data.token);
        console.log('💾 Token saved from data object');
      } else {
        console.warn('⚠️ No token found in response');
      }

      // Save user data if available
      if (response.user) {
        this.authService.saveUser(response.user);
      } else if (response.data?.user) {
        this.authService.saveUser(response.data.user);
      }
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('🔴 Full error details:', error);
      console.error('🔴 Error status:', error.status);
      console.error('🔴 Error message:', error.message);

      if (error.error) {
        console.error('📝 Backend error response:', error.error);

        if (typeof error.error === 'string') {
          console.error('📝 Backend error (string):', error.error);
        } else if (typeof error.error === 'object') {
          console.error('📝 Backend error (object):', JSON.stringify(error.error, null, 2));
        }
      }

      return throwError(() => error);
    })
  );
}

login (loginUser: ILogin): Observable<any>{
  return this.httpClient.post<any>(`${environment.baseUrl}/api/Auth/login`, loginUser)
}
}
