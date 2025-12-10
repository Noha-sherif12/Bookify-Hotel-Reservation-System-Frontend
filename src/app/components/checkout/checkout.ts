import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingRooms, BookingConfirmationDto  } from '../../services/booking-rooms';
import { PaymentService} from '../../services/payment.service';
import { ToastNotificationService } from '../../services/toast-notification.service';
import { LoggingService } from '../../services/logging.service';
import { BookingStateService } from '../../services/booking-state.service';
import { ICartItems } from '../../models/icart';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment.development';

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
  useCompletePayment: boolean = false; // Changed to false for real Stripe integration
  
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

  private setupStripe(): void {
    // Use your actual Stripe key from environment
    const stripeKey = 'pk_test_51RQkSYR6inIN8enJw8AKINX8oIKlxK2bbB5OCqh6mqtQAalg6FuIj5IiPoLa2ljXXtQUFygvMnNsLS4ywsIQv8wg00MMDDQ1jv';

    if (!stripeKey || stripeKey.startsWith('pk_test_') === false) {
      console.error('Invalid Stripe key');
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

  // Main payment processing method
  async processPayment(): Promise<void> {
    console.log('=== PAYMENT PROCESS STARTED ===');
    
    if (!this.validateForm()) {
      console.log('Form validation failed');
      return;
    }

    this.isProcessing = true;
    this.paymentError = '';

    // OPTION 1: For testing with hardcoded pm_card_visa (EASIEST)
    console.log('Using test payment method: pm_card_visa');
    await this.confirmBookingWithPayment('pm_card_visa');
    
    // OPTION 2: Uncomment below for real Stripe integration
    /*
    if (this.useCompletePayment) {
      // Test card mode
      if (!this.testCard || this.testCard.trim() === '') {
        this.paymentError = 'Please enter a test card number.';
        this.isProcessing = false;
        return;
      }
      
      try {
        // Create payment method with test card
        const { error, paymentMethod } = await this.stripe.createPaymentMethod({
          type: 'card',
          card: { number: this.testCard },
          billing_details: {
            name: this.formData.cardholderName,
            email: this.formData.email,
            phone: this.formData.phone
          }
        });
        
        if (error) throw error;
        await this.confirmBookingWithPayment(paymentMethod.id);
      } catch (error: any) {
        this.paymentError = error.message;
        this.isProcessing = false;
      }
    } else {
      // Real Stripe payment
      try {
        const { error, paymentMethod } = await this.stripe.createPaymentMethod({
          type: 'card',
          card: this.cardElement,
          billing_details: {
            name: this.formData.cardholderName,
            email: this.formData.email,
            phone: this.formData.phone
          }
        });
        
        if (error) throw error;
        await this.confirmBookingWithPayment(paymentMethod.id);
      } catch (error: any) {
        this.paymentError = error.message;
        this.isProcessing = false;
      }
    }
    */
  }

  // Method to confirm booking with payment
  private confirmBookingWithPayment(paymentMethodId: string): void {
console.log('Full URL being called:', `${environment.baseUrl}/api/Bookings/confirm`);
  console.log('Payment method ID:', paymentMethodId);
    const bookingConfirmation: BookingConfirmationDto = {
      paymentMethodId: paymentMethodId,
      totalAmount: this.cartItem?.totalCost
    };

    this.paymentService.confirmBookingFromCart(bookingConfirmation).subscribe({
      next: (response: any) => {
        this.loggingService.info('Booking confirmed successfully', response);
        this.toastService.success('Payment successful! Booking confirmed.');
        
        // Clear cart after successful booking
        this.bookingRooms.clearCart().subscribe(() => {
          console.log('Cart cleared successfully');
        });
        
        // Prepare booking data from response
        const bookingData = response.booking || {
          id: response.bookingId || Math.floor(Math.random() * 10000),
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
            <p><strong>${response.message || 'Booking created successfully'}</strong></p>
            <ul style="text-align: left; margin: 15px 0;">
              ${(response.nextSteps || []).map((step: string) => `<li>${step}</li>`).join('')}
            </ul>
            <hr />
            <p><strong>Booking ID:</strong> ${bookingData.id}</p>
            <p><strong>Room:</strong> ${bookingData.roomNumber} (${bookingData.roomTypeName})</p>
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
            
            // Navigate to bookings page
            this.router.navigate(['/bookings'], {
              state: { newBooking: bookingData }
            });
          }
        });

        this.isProcessing = false;
      },
      error: (err: any) => {
        console.error('Full error response:', err);
        
        // Handle specific error cases
        if (err.status === 401) {
          this.paymentError = 'Please log in to complete your booking';
          this.toastService.error('Authentication required. Please log in.');
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else if (err.status === 400) {
          this.paymentError = err.error?.message || 'Invalid payment information';
        } else if (err.status === 404) {
          this.paymentError = 'Cart not found. Please add items to cart again.';
          setTimeout(() => this.router.navigate(['/cart']), 2000);
        } else {
          this.paymentError = err.error?.message || 'Failed to confirm booking. Please try again.';
        }
        
        this.toastService.error(this.paymentError);
        this.loggingService.error('Booking confirmation failed', { 
          status: err.status, 
          message: err.error?.message,
          error: err.error
        });
        this.isProcessing = false;
      }
    });
  }

  // Add this test method for quick testing
  testWithPmCardVisa(): void {
    console.log('Testing with pm_card_visa...');
    
    // Fill form with test data if empty
    if (!this.formData.fullName) {
      this.formData = {
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        cardholderName: 'Test User'
      };
    }
    
    this.processPayment();
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