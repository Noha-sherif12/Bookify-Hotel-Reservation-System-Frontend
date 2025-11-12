import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core'
import { IBookings } from '../../models/ibooking';
import { BookingRooms } from '../../services/booking-rooms';

@Component({
  selector: 'app-bookings',
  imports: [CommonModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class Bookings implements OnInit {

  bookings: IBookings[] = [] ;

  constructor(private bookingService:BookingRooms) {

  }
    ngOnInit(): void {
    this.bookingService.getAllBookings().subscribe({
      next: (res) => {
        this.bookings = res;
        console.log(res);
      },
      error: (err) => {
        console.log('Error fetching bookings:', err);
      }
    }); 
  }

}
