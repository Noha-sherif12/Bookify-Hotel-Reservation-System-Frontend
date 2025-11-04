import { Component, OnInit } from '@angular/core';
import { BookingRooms } from '../../services/booking-rooms';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ICartItems } from '../../models/icart';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterModule],
  templateUrl: './cart.html',
  styleUrl: './cart.css'
})
export class Cart implements OnInit {
  cartItem: ICartItems | null = null;
  isLoading: boolean = false;

  constructor(
    private _BookingRooms: BookingRooms,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this._BookingRooms.getCartItems().subscribe({
      next: (res) => {
        console.log('🛒 Cart response:', res);
        
        if (res && typeof res === 'object') {
          if (res.message === 'Cart is empty') {
            this.cartItem = null;
          } else {
            this.cartItem = res as ICartItems;
          }
        } else {
          this.cartItem = res;
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading cart:', err);
        this.isLoading = false;
        Swal.fire('Error', 'Failed to load cart', 'error');
      }
    });
  }

  confirmBooking(): void {
    this.isLoading = true;
    this._BookingRooms.confirmBookingCart().subscribe({
      next: (response) => {
        console.log('✅ Booking confirmed:', response);
        this.isLoading = false;
        Swal.fire('Success!', 'Booking confirmed successfully!', 'success');
        this.router.navigate(['/bookings']);
      },
      error: (error) => {
        console.error('❌ Error confirming booking:', error);
        this.isLoading = false;
        Swal.fire('Error', error.error?.message || 'Failed to confirm booking', 'error');
      }
    });
  }

  clearCart(): void {
    this._BookingRooms.clearCart().subscribe({
      next: (response) => {
        console.log('🛒 Cart cleared:', response);
        this.cartItem = null;
        Swal.fire('Cart Cleared', 'Your cart has been cleared', 'info');
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
        Swal.fire('Error', 'Failed to clear cart', 'error');
      }
    });
  }
}