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
  errorDetails: string = '';

  constructor(
    private _BookingRooms: BookingRooms,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('🔧 Cart Component Initialized');
    this.loadCart();
  }

  loadCart(): void {
    this.isLoading = true;
    this.errorDetails = '';
    
    console.log('🛒 Attempting to load cart...');
    
    this._BookingRooms.getCartItems().subscribe({
      next: (res) => {
        console.log('✅ Cart API Response:', res);
        
        if (res && typeof res === 'object') {
          if (res.message === 'Cart is empty') {
            this.cartItem = null;
            console.log('🛒 Cart is empty');
          } else {
            this.cartItem = res as ICartItems;
            console.log('✅ Cart item found:', this.cartItem);
          }
        } else {
          this.cartItem = res;
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Cart Error Details:', err);
        console.error('❌ Error Status:', err.status);
        console.error('❌ Error Message:', err.message);
        console.error('❌ Full Error:', err);
        
        this.isLoading = false;
        this.errorDetails = `Status: ${err.status} - ${err.message}`;
        
        Swal.fire({
          title: 'Cart Error',
          text: `Failed to load cart: ${err.status} ${err.statusText}`,
          icon: 'error',
          footer: this.errorDetails
        });
      }
    });
  }

  confirmBooking(): void {
    this.isLoading = true;
    this.errorDetails = '';
    
    this._BookingRooms.confirmBookingCart().subscribe({
      next: (response) => {
        console.log('✅ Booking confirmed:', response);
        this.isLoading = false;
        Swal.fire('Success!', 'Booking confirmed successfully!', 'success');
        this.router.navigate(['/bookings']);
      },
      error: (error) => {
        console.error('❌ Confirm Booking Error:', error);
        this.isLoading = false;
        this.errorDetails = `Status: ${error.status} - ${error.message}`;
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
        console.error('❌ Clear Cart Error:', error);
        this.errorDetails = `Status: ${error.status} - ${error.message}`;
        Swal.fire('Error', 'Failed to clear cart', 'error');
      }
    });
  }
}