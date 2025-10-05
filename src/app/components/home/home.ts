import { Component, OnInit } from '@angular/core';
import { RoomsService } from '../../services/room-service';
import { CommonModule } from '@angular/common';
import { AvailableRooms, Roomtypes } from '../../models/iroom'
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit{
  availableRooms: AvailableRooms[] = [] ;
  roomsTypes: Roomtypes[] = [];
  availableParams = {
    from: '',
    to: '',
  };

  constructor(private roomService: RoomsService){

  }
  ngOnInit(): void {
    this.roomService.getRoomsTypes().subscribe({
      next: (res) => {
        this.roomsTypes = res;
       
      },
      error: (err) => {
        console.log(err)
      }
    })
    this.availableRoom()
  }
   availableRoom(): void {
    this.roomService.getAvailableRooms(this.availableParams.from, this.availableParams.to).subscribe({
      next: (res) => {
        this.availableRooms = res;
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

}
