import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { IBookingCart, IBookings } from '../models/ibooking';
import { IAddRoom, ICartItems } from '../models/icart';

export interface BookingConfirmationDto {
  paymentMethodId: string;
  totalAmount?: number;
}
@Injectable({
  providedIn: 'root'
})
export class BookingRooms {

  constructor(private httpClient: HttpClient) {}

  getCartItems(): Observable<ICartItems> { 
    return this.httpClient.get<ICartItems>(`${environment.baseUrl}/api/Bookings/cart`, {
      withCredentials: true
    });
  }

  getAllBookings(): Observable<IBookings[]> {
    return this.httpClient.get<IBookings[]>(`${environment.baseUrl}/api/Bookings`, {
      withCredentials: true
    });
  }

  addBookingCart(cartData: IAddRoom): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrl}/api/Bookings/cart`, cartData, {
      withCredentials: true
    });
  }

  /// FIXED: Correct endpoint path
confirmBookingCart(paymentData: BookingConfirmationDto): Observable<any> {
  return this.httpClient.post<any>(`${environment.baseUrl}/api/Bookings/confirm`, paymentData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}


  clearCart(): Observable<any> {
    return this.httpClient.delete<any>(`${environment.baseUrl}/api/Bookings/cart`, {
      withCredentials: true
    });
  }
 getBookingById(bookingId: number): Observable<IBookings> {
  return this.httpClient.get<IBookings>(`${environment.baseUrl}/api/Bookings/${bookingId}`, {
    withCredentials: true
  });
}

  cancelBookingById(){

  }

  confirmBookingById(){

  }
  rejectBookingById(){

  }
}
