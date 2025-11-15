// admin.service.ts - SIMPLIFIED WITH INTERCEPTOR
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) {}

  // Get ALL bookings from Admin API
  getAllBookings(): Observable<any[]> {
    console.log('📡 Calling Admin API (interceptor will add token)');
    return this.http.get<any[]>(`${environment.baseUrl}/api/Admin/bookings`);
  }

  // Confirm a booking (Admin only)
  confirmBooking(bookingId: number): Observable<any> {
    return this.http.put<any>(`${environment.baseUrl}/api/Bookings/${bookingId}/confirm`, {});
  }

  // Reject a booking (Admin only)
  rejectBooking(bookingId: number, reason: string): Observable<any> {
    return this.http.put<any>(`${environment.baseUrl}/api/Bookings/${bookingId}/reject`, { reason });
  }

  // Test if user has admin access
  testAdminAccess(): Promise<boolean> {
    return new Promise((resolve) => {
      this.getAllBookings().subscribe({
        next: () => resolve(true),
        error: () => resolve(false)
      });
    });
  }
}