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

  getCartItems():Observable<ICartItems[]>{
    return this.httpClient.get<ICartItems[]>(`${environment.baseUrl}/api/Bookings/cart`)
  }

  getAllBookings():Observable<IBookings[]>{
     return this.httpClient.get<IBookings[]>(`${environment.baseUrl}/api/Bookings/Bookings`)
  }

  getBookingById(id:number):Observable<IBookings[]>{
     return this.httpClient.get<IBookings[]>(`${environment.baseUrl}/api/Bookings/${id}`)
  }

  getBookingStatusId(statusId:number):Observable<string>{
     return this.httpClient.get<string>(`${environment.baseUrl}/api/Bookings/${statusId}/status`)
  }

  deleteBookingCart(){

  }

  addBookingCart(cartData: IAddRoom){
    return this.httpClient.post<IAddRoom>(`${environment.baseUrl}/api/Bookings/cart`, cartData

    )
  }

  confirmBookingCart(){

  }

  cancelBookingById(){

  }

  confirmBookingById(){

  }
  rejectBookingById(){

  }
}
