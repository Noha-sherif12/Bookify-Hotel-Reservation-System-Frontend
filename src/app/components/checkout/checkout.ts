import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingRooms } from '../../services/booking-rooms';
import { PaymentService, BookingConfirmationDto } from '../../services/payment.service';
import { ToastNotificationService } from '../../services/toast-notification.service';
import { LoggingService } from '../../services/logging.service';
import { ICartItems } from '../../models/icart';
import Swal from 'sweetalert2';

declare var Stripe: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class CheckoutComponent implements OnInit {
  cartItem: ICartItems | null = null;
  isLoading: boolean = false;
  isProcessing: boolean = false;
  paymentError: string = '';
  orderSummary: any = null;

  // Stripe Elements
  stripe: any;
  elements: any;
  cardElement: any;
  clientSecret: string = '';
  paymentIntentId: string = '';

  // Form data
  formData = {
    fullName: '',
    email: '',
    phone: '',
    cardholderName: ''
  };

  constructor(
    private bookingRooms: BookingRooms,
    private paymentService: PaymentService,
    private toastService: ToastNotificationService,
    private loggingService: LoggingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.initializeStripe();
  }

  private loadCart(): void {
    this.isLoading = true;
    this.bookingRooms.getCartItems().subscribe({
      next: (res) => {
        if (res && res.message !== 'Cart is empty') {
          this.cartItem = res as ICartItems;
          this.formData.email = res.customerEmail || '';
          this.formData.fullName = res.customerName || '';
          this.prepareOrderSummary();
        } else {
          this.toastService.warning('Your cart is empty. Redirecting...');
          setTimeout(() => this.router.navigate(['/cart']), 2000);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Cart loading error:', err);
        this.toastService.error('Failed to load cart');
        this.isLoading = false;
      }
    });
  }

  private initializeStripe(): void {
    // Load Stripe.js dynamically
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      this.setupStripe();
    };
    document.head.appendChild(script);
  }

  private setupStripe(): void {
    const stripeKey = 'pk_test_YOUR_PUBLISHABLE_KEY'; // Replace with actual key from environment
    this.stripe = (window as any).Stripe(stripeKey);
    this.elements = this.stripe.elements();
    
    // Create card element
    const cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#424242',
          '::placeholder': {
            color: '#9ca3af'
          }
        },
        invalid: {
          color: '#fa755a'
        }
      }
    });

    const cardContainer = document.getElementById('card-element');
    if (cardContainer) {
      cardElement.mount(cardContainer);
      this.cardElement = cardElement;

      cardElement.on('change', (event: any) => {
        const errorElement = document.getElementById('card-errors');
        if (errorElement) {
          errorElement.textContent = event.error ? event.error.message : '';
        }
      });
    }
  }

  private prepareOrderSummary(): void {
    if (this.cartItem) {
      this.orderSummary = {
        roomNumber: this.cartItem.roomNumber,
        roomType: this.cartItem.roomTypeName,
        checkIn: new Date(this.cartItem.checkInDate).toLocaleDateString(),
        checkOut: new Date(this.cartItem.checkOutDate).toLocaleDateString(),
        nights: this.cartItem.numberOfNights,
        pricePerNight: this.cartItem.pricePerNight,
        totalAmount: this.cartItem.totalCost
      };
    }
  }

  processPayment(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isProcessing = true;
    this.paymentError = '';

    // Step 1: Create payment method with Stripe
    this.stripe.createPaymentMethod({
      type: 'card',
      card: this.cardElement,
      billing_details: {
        name: this.formData.cardholderName,
        email: this.formData.email
      }
    }).then((result: any) => {
      if (result.error) {
        this.paymentError = result.error.message;
        this.toastService.error(this.paymentError);
        this.loggingService.error('Payment method creation failed', { error: result.error });
        this.isProcessing = false;
      } else {
        // Step 2: Send payment method ID to backend (cart is in session)
        this.confirmBookingWithPayment(result.paymentMethod.id);
      }
    });
  }

  private confirmBookingWithPayment(paymentMethodId: string): void {
    this.loggingService.info('Confirming booking with payment method', { paymentMethodId });

    const bookingConfirmation: BookingConfirmationDto = {
      paymentMethodId: paymentMethodId
      // Cart data comes from session on backend automatically!
    };

    this.paymentService.confirmBookingFromCart(bookingConfirmation).subscribe({
      next: (response: any) => {
        this.loggingService.info('Booking confirmed successfully', response);
        this.toastService.success('Payment successful! Booking confirmed.');
        
        Swal.fire({
          title: 'Success!',
          html: `<div>
            <p>Your booking has been confirmed!</p>
            <p><strong>${response.message}</strong></p>
            <ul style="text-align: left; margin: 15px 0;">
              ${response.nextSteps.map((step: string) => `<li>${step}</li>`).join('')}
            </ul>
          </div>`,
          icon: 'success',
          confirmButtonText: 'View My Bookings'
        }).then(() => {
          this.router.navigate(['/bookings']);
        });

        this.isProcessing = false;
      },
      error: (err: any) => {
        this.paymentError = err.error?.message || 'Failed to confirm booking';
        this.toastService.error(this.paymentError);
        this.loggingService.error('Booking confirmation failed', { 
          status: err.status, 
          message: err.error?.message 
        });
        this.isProcessing = false;
      }
    });
  }

  private validateForm(): boolean {
    if (!this.formData.fullName.trim()) {
      this.paymentError = 'Please enter your full name';
      return false;
    }
    if (!this.formData.email.trim()) {
      this.paymentError = 'Please enter your email';
      return false;
    }
    if (!this.formData.cardholderName.trim()) {
      this.paymentError = 'Please enter cardholder name';
      return false;
    }
    if (!this.formData.phone.trim()) {
      this.paymentError = 'Please enter your phone number';
      return false;
    }
    return true;
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }
}
