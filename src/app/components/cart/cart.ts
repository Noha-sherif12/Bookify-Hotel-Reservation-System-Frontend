import { Component, OnInit } from '@angular/core';
import { BookingRooms } from '../../services/booking-rooms';
import { ToastNotificationService } from '../../services/toast-notification.service';
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
    private toastService: ToastNotificationService,
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
        
        this.toastService.error(`Failed to load cart: ${err.status} ${err.statusText}`);
      }
    });
  }

  proceedToCheckout(): void {
    if (!this.cartItem) {
      this.toastService.warning('Your cart is empty');
      return;
    }

    // Navigate to checkout
    this.router.navigate(['/checkout']);
  }

  confirmBooking(): void {
    this.isLoading = true;
    this.errorDetails = '';
    
    this._BookingRooms.confirmBookingCart().subscribe({
      next: (response) => {
        console.log('✅ Booking confirmed:', response);
        this.isLoading = false;
        this.toastService.success('Booking confirmed successfully!');
        Swal.fire({
          title: 'Success!',
          text: 'Your booking has been confirmed',
          icon: 'success',
          confirmButtonText: 'View Bookings'
        }).then(() => {
          this.router.navigate(['/bookings']);
        });
      },
      error: (error) => {
        console.error('❌ Confirm Booking Error:', error);
        this.isLoading = false;
        this.errorDetails = `Status: ${error.status} - ${error.message}`;
        this.toastService.error(error.error?.message || 'Failed to confirm booking');
      }
    });
  }

  clearCart(): void {
    Swal.fire({
      title: 'Clear Cart?',
      text: 'Are you sure you want to clear your cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Clear Cart'
    }).then((result) => {
      if (result.isConfirmed) {
        this._BookingRooms.clearCart().subscribe({
          next: (response) => {
            console.log('🛒 Cart cleared:', response);
            this.cartItem = null;
            this.toastService.success('Cart has been cleared');
          },
          error: (error) => {
            console.error('❌ Clear Cart Error:', error);
            this.errorDetails = `Status: ${error.status} - ${error.message}`;
            this.toastService.error('Failed to clear cart');
          }
        });
      }
    });
  }

  continueShopping(): void {
    this.router.navigate(['/Rooms']);
  }
}
