import { Component, OnInit } from '@angular/core';
import { BookingRooms } from '../../services/booking-rooms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ICartItems } from '../../models/icart';

@Component({
  selector: 'app-cart',
  imports: [CommonModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit{
  cartItems: ICartItems[] = [];

constructor(private _BookingRooms:BookingRooms){


}
  ngOnInit(): void {
    this._BookingRooms.getCartItems().subscribe({
      next: (res)=> {
        this.cartItems = res;
        console.log(res);

      },
      error: (res)=> {
        console.log(res)
      }
    })
  }


}
