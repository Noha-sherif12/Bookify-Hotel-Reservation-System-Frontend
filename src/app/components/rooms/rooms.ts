import { Component, OnInit } from '@angular/core';
import { RoomsService } from '../../services/room-service';
import { Room, RoomSearchResponse } from '../../models/iroom';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rooms',
  imports: [FormsModule, CommonModule],
  templateUrl: './rooms.html',
  styleUrls: ['./rooms.css']
})
export class Rooms  {
  rooms: Room[] = [];
  searchParams = {
    from: '',
    to: '',
    roomTypeId: 0
  };

  // Define room types with IDs 11-15
  roomTypes = [
    { id: 11, name: 'Standard Room' },
    { id: 12, name: 'Deluxe Room' },
    { id: 13, name: 'Suite' },
    { id: 14, name: 'Executive Suite' },
    { id: 15, name: 'Presidential Suite' }
  ];

  isLoading = false;
  errorMessage = '';


  totalCount = 0;
  pageNumber = 1;
  totalPages = 0;
  hasPrevious = false;
  hasNext = false;

  constructor(private roomService: RoomsService) {}

  // ngOnInit(): void {
  //   this.searchRooms();
  // }

  searchRooms(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.roomService.searchRooms(
      this.searchParams.from,
      this.searchParams.to,
      this.searchParams.roomTypeId
    ).subscribe({
      next: (result: RoomSearchResponse) => {

        this.rooms = result.rooms ?? [];
        this.totalCount = result.totalCount;
        this.pageNumber = result.pageNumber;
        this.totalPages = result.totalPages;
        this.hasPrevious = result.hasPrevious;
        this.hasNext = result.hasNext;

        this.isLoading = false;
        console.log('Rooms loaded successfully:', this.rooms);
      },
      error: (error) => {
        this.errorMessage = 'Failed to load rooms. Please try again.';
        this.isLoading = false;
        console.error('Error fetching rooms:', error);
      }
    });
  }
}
