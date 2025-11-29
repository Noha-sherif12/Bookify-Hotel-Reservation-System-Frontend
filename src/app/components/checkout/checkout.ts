import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingRooms } from '../../services/booking-rooms';
import { PaymentService, BookingConfirmationDto } from '../../services/payment.service';
import { ToastNotificationService } from '../../services/toast-notification.service';
import { LoggingService } from '../../services/logging.service';
import { BookingStateService } from '../../services/booking-state.service';
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
  // Test card input for Complete mode
  testCard: string = '4242 4242 4242 4242';
    // Toggle for Complete payment mode
    useCompletePayment: boolean = true; // Set to true for testing
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
    private bookingStateService: BookingStateService,
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

  // FIX 1: Enhanced Stripe initialization with better error handling
  private initializeStripe(): void {
    // Check if Stripe is already loaded
    if ((window as any).Stripe) {
      this.setupStripe();
      return;
    }

    // Load Stripe.js dynamically
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      console.log('Stripe.js loaded successfully');
      this.setupStripe();
    };
    script.onerror = () => {
      console.error('Failed to load Stripe.js');
      this.paymentError = 'Failed to load payment processor. Please refresh the page.';
    };
    document.head.appendChild(script);
  }

  // FIX 2: Enhanced Stripe setup with key validation and better timing
  private setupStripe(): void {
    // Use Stripe key from environment (replace with your actual import)
    // import { environment } from '../../environments/environment.development';
    const stripeKey = (window as any).STRIPE_PUBLISHABLE_KEY || 'pk_test_51STS1jIZ0zYznzPCBz5ONFUqmPqHEtgK8bYX3CdjrKM7tgvGwNrNpmGk9HnKZSQgN2XrajYq1D9sqb59p0L0yllC00jXevq3sc';

    if (!stripeKey || stripeKey.startsWith('pk_test_') === false) {
      console.error('Invalid Stripe key - please update with actual key');
      this.paymentError = 'Payment configuration error. Please contact support.';
      return;
    }

    // Only initialize Stripe if not already done
    if (!(window as any)._stripeInstance) {
      (window as any)._stripeInstance = (window as any).Stripe(stripeKey);
    }
    this.stripe = (window as any)._stripeInstance;
    this.elements = this.stripe.elements();

    // Wait for next tick to ensure DOM is ready
    setTimeout(() => {
      this.createCardElement();
    }, 100);
  }

  // FIX 3: Enhanced card element creation with better error handling
  private createCardElement(): void {
    if (!this.elements) {
      console.error('Stripe Elements not initialized');
      return;
    }

    // Clear any existing card element
    const cardContainer = document.getElementById('card-element');
    if (cardContainer) {
      cardContainer.innerHTML = '';
    }

    const cardElement = this.elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          lineHeight: '40px',
          '::placeholder': {
            color: '#aab7c4'
          }
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a'
        }
      },
      hidePostalCode: true
    });

    if (cardContainer) {
      cardElement.mount(cardContainer);
      this.cardElement = cardElement;

      // Handle real-time validation
      cardElement.on('change', (event: any) => {
        const errorElement = document.getElementById('card-errors');
        if (errorElement) {
          if (event.error) {
            errorElement.textContent = event.error.message;
            errorElement.style.display = 'block';
          } else {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
          }
        }
        console.log('Card element change:', event);
      });

      cardElement.on('ready', () => {
        console.log('Card element ready for input');
      });

    } else {
      console.error('Card container element not found');
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

  // Updated processPayment with better error handling
  async processPayment(): Promise<void> {
    console.log('=== PAYMENT PROCESS STARTED ===');
    if (!this.validateForm()) {
      console.log('Form validation failed');
      return;
    }

    this.isProcessing = true;
    this.paymentError = '';

    if (this.useCompletePayment) {
      // Simulate a Complete payment and show a Complete success page
      if (!this.testCard || this.testCard.trim() === '') {
        this.paymentError = 'Please enter a test card number.';
        this.isProcessing = false;
        return;
      }
      setTimeout(() => {
        this.showCompleteSuccessPage();
        this.isProcessing = false;
      }, 1200);
      return;
    }

    // ...existing Stripe payment code...
    try {
      console.log('Creating payment method...');
      const { error, paymentMethod } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.cardElement,
        billing_details: {
          name: this.formData.cardholderName,
          email: this.formData.email,
          phone: this.formData.phone
        }
      });
      console.log('Payment method result:', { error, paymentMethod });
      if (error) {
        console.error('Stripe error:', error);
        this.paymentError = error.message;
        this.toastService.error(this.paymentError);
        this.isProcessing = false;
        return;
      }
      if (paymentMethod) {
        console.log('Payment method created successfully, ID:', paymentMethod.id);
        await this.confirmBookingWithPayment(paymentMethod.id);
      } else {
        throw new Error('No payment method created');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      this.paymentError = 'Payment processing failed. Please try again.';
      this.toastService.error(this.paymentError);
      this.isProcessing = false;
    }
  }


  // Show a Complete success page for testing
  private showCompleteSuccessPage(): void {
  const bookingData = {
    id: Math.floor(Math.random() * 10000) + 1000, // Generate a random ID for demo
    roomNumber: this.cartItem?.roomNumber || '101',
    roomTypeName: this.cartItem?.roomTypeName || 'Deluxe Room',
    customerName: this.formData.fullName || 'Test User',
    customerEmail: this.formData.email || 'test@example.com',
    checkInDate: this.cartItem?.checkInDate || '2025-12-01',
    checkOutDate: this.cartItem?.checkOutDate || '2025-12-05',
    numberOfNights: this.cartItem?.numberOfNights || 4,
    totalCost: this.cartItem?.totalCost || 600,
    status: 'Confirmed',
    createdAt: new Date().toISOString()
  };

  const completeResponse = {
    message: 'Booking created and payment processed successfully! (Complete)',
    booking: bookingData,
    nextSteps: [
      'Your booking is pending admin confirmation',
      'You will receive a confirmation email once approved',
      'You can cancel the booking before it is confirmed'
    ]
  };

  this.toastService.success('Complete: Payment successful! Booking confirmed.');
  
  Swal.fire({
    title: 'Complete Success!',
    html: `<div>
      <p>Your booking has been confirmed! (Complete)</p>
      <p><strong>${completeResponse.message}</strong></p>
      <ul style="text-align: left; margin: 15px 0;">
        ${completeResponse.nextSteps.map((step: string) => `<li>${step}</li>`).join('')}
      </ul>
      <hr />
      <p><strong>Booking ID:</strong> ${bookingData.id}</p>
      <p><strong>Room:</strong> ${bookingData.roomNumber} (${bookingData.roomTypeName})</p>
      <p><strong>Guest:</strong> ${bookingData.customerName}</p>
      <p><strong>Email:</strong> ${bookingData.customerEmail}</p>
      <p><strong>Check-in:</strong> ${bookingData.checkInDate}</p>
      <p><strong>Check-out:</strong> ${bookingData.checkOutDate}</p>
      <p><strong>Nights:</strong> ${bookingData.numberOfNights}</p>
      <p><strong>Total Cost:</strong> $${bookingData.totalCost}</p>
      <p><strong>Status:</strong> ${bookingData.status}</p>
    </div>`,
    icon: 'success',
    confirmButtonText: 'View My Bookings',
    showCancelButton: true,
    cancelButtonText: 'Stay Here'
  }).then((result) => {
    if (result.isConfirmed) {
      // Store the booking data in the state service
      this.bookingStateService.setNewBooking(bookingData);
      this.loggingService.info('New booking data stored in state', { bookingId: bookingData.id });
      
      // Navigate to bookings page with the new booking data
      this.router.navigate(['/bookings'], {
        state: { newBooking: bookingData }
      });
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
        
        // Prepare booking data to pass to bookings page
        const bookingData = response.booking || {
          id: response.bookingId || 0,
          roomNumber: this.cartItem?.roomNumber,
          roomTypeName: this.cartItem?.roomTypeName,
          customerName: this.formData.fullName,
          customerEmail: this.formData.email,
          checkInDate: this.cartItem?.checkInDate,
          checkOutDate: this.cartItem?.checkOutDate,
          numberOfNights: this.cartItem?.numberOfNights,
          totalCost: this.cartItem?.totalCost,
          status: 'Confirmed',
          createdAt: new Date().toISOString()
        };

        Swal.fire({
          title: 'Success!',
          html: `<div>
            <p>Your booking has been confirmed!</p>
            <p><strong>${response.message}</strong></p>
            <ul style="text-align: left; margin: 15px 0;">
              ${response.nextSteps?.map((step: string) => `<li>${step}</li>`).join('') || ''}
            </ul>
          </div>`,
          icon: 'success',
          confirmButtonText: 'View My Bookings'
        }).then(() => {
          this.bookingStateService.setNewBooking(bookingData);
          this.loggingService.info('New booking data stored in state', { bookingId: bookingData.id });
          this.router.navigate(['/bookings'], {
            state: { newBooking: bookingData }
          });
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

  // Temporary test method - call this from browser console
  testStripeIntegration(): void {
    console.log('Stripe instance:', this.stripe);
    console.log('Card element:', this.cardElement);
    console.log('Elements:', this.elements);
    
    if (this.cardElement) {
      // Test if card element can create a token
      this.stripe.createToken(this.cardElement).then((result: any) => {
        console.log('Token creation test:', result);
      });
    }
  }
}