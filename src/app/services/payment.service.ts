import { Injectable } from '@angular/core';
import { BookingRooms, BookingConfirmationDto } from '../services/booking-rooms';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private bookingRooms: BookingRooms) {}

  confirmBookingFromCart(bookingConfirmation: BookingConfirmationDto) {
    return this.bookingRooms.confirmBookingCart(bookingConfirmation);
  }
}