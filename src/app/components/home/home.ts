import { Component, OnInit } from '@angular/core';
import { RoomsService } from '../../services/room-service';
import { CommonModule } from '@angular/common';
import { AvailableRooms, Roomtypes } from '../../models/iroom'
import { FormsModule } from '@angular/forms';
import { BookingRooms } from '../../services/booking-rooms';
import Swal from 'sweetalert2';
import { IAddRoom } from '../../models/icart';




@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
    templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit{
  availableRooms: AvailableRooms[] = [];
  roomsTypes: Roomtypes[] = [];
  availableParams = {
    from: '',
    to: '',
  };


  selectedRoomId: number | null = null;

  constructor(private roomService: RoomsService, private _roomService: BookingRooms) {}

  ngOnInit(): void {
    this.roomService.getRoomsTypes().subscribe({
      next: (res) => {
        this.roomsTypes = res;
      },
      error: (err) => {
        console.log(err)
      }
    });

  }

  availableRoom(): void {
    if (!this.availableParams.from || !this.availableParams.to) {
      Swal.fire('Error', 'Please select both check-in and check-out dates', 'error');
      return;
    }

    this.roomService.getAvailableRooms(this.availableParams.from, this.availableParams.to).subscribe({
      next: (res) => {
        this.availableRooms = res;
      },
      error: (err) => {
        console.log(err);
        Swal.fire('Error', 'Failed to load available rooms', 'error');
      }
    });
  }

  selectRoom(roomId: number): void {
    this.selectedRoomId = roomId;
  }

  addToCart(room: AvailableRooms): void {
    if (!this.availableParams.from || !this.availableParams.to) {
      Swal.fire('Error', 'Please select dates first', 'error');
      return;
    }

    const cartData: IAddRoom = {
      roomId: 1,
      checkInDate: this.availableParams.from,
      checkOutDate: this.availableParams.to,
      customerName: "customer",
      customerEmail: "customer@example.com"
    };

this._roomService.addBookingCart(cartData).subscribe({
  next: (res) => {
    console.log('Response:', res);
    console.log('Session cookies should be automatically handled by browser');

    // If you want to see what cookies are currently stored
    console.log('Document cookies:', document.cookie);

    Swal.fire({
      title: "Room added successfully",
      icon: "success",
    });
  },
  error: (err) => {
    console.error('Add to cart error:', err);
    Swal.fire('Error', 'Failed to add room to cart', 'error');
  }
});
  }
}
