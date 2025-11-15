import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IBookings } from '../models/ibooking';

@Injectable({
  providedIn: 'root'
})
export class BookingStateService {
  private newBookingSubject = new BehaviorSubject<Partial<IBookings> | null>(null);
  public newBooking$ = this.newBookingSubject.asObservable();

  constructor() {}

  /**
   * Set a newly created booking from checkout
   * @param booking The booking data to store
   */
  setNewBooking(booking: Partial<IBookings>): void {
    this.newBookingSubject.next(booking);
  }

  /**
   * Get the current new booking data
   */
  getNewBooking(): Partial<IBookings> | null {
    return this.newBookingSubject.getValue();
  }

  /**
   * Clear the new booking data after it's been consumed
   */
  clearNewBooking(): void {
    this.newBookingSubject.next(null);
  }

  /**
   * Get new booking as observable for reactive updates
   */
  getNewBooking$(): Observable<Partial<IBookings> | null> {
    return this.newBooking$;
  }
}
