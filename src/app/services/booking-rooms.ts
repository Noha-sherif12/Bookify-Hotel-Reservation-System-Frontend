import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { IBookingCart, IBookings } from '../models/ibooking';
import { IAddRoom, ICartItems } from '../models/icart';

@Injectable({
  providedIn: 'root'
})
export class BookingRooms {

  constructor(private httpClient: HttpClient) {}

getCartItems(): Observable<ICartItems> { 
    return this.httpClient.get<ICartItems>(`${environment.baseUrl}/api/Bookings/cart`, {
      withCredentials: true // ✅ This preserves session
    });
  }

  getAllBookings(): Observable<IBookings[]> {
    return this.httpClient.get<IBookings[]>(`${environment.baseUrl}/api/Bookings/Bookings`, {
      withCredentials: true
    });
  }

  addBookingCart(cartData: IAddRoom): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrl}/api/Bookings/cart`, cartData, {
      withCredentials: true // ✅ Important for session
    });
  }

  confirmBookingCart(): Observable<any> {
    return this.httpClient.post<any>(`${environment.baseUrl}/api/Bookings/confirm`, {}, {
      withCredentials: true,
            observe: 'response' // This gives you access to full response including headers
    });
  }

  clearCart(): Observable<any> {
    return this.httpClient.delete<any>(`${environment.baseUrl}/api/Bookings/cart`, {
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
