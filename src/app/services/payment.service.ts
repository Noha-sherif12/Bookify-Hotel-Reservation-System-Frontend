import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface BookingConfirmationDto {
  paymentMethodId: string;
  // Cart data comes from session on backend
}

export interface BookingResponse {
  message: string;
  booking: any;
  nextSteps: string[];
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  bookingId?: number;
}

export interface PaymentResponse {
  clientSecret: string;
  paymentIntentId: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private httpClient: HttpClient) { }

  // Create a payment intent with the backend
  createPaymentIntent(request: PaymentRequest): Observable<PaymentResponse> {
    return this.httpClient.post<PaymentResponse>(
      `${environment.baseUrl}/api/Payment/create-payment-intent`,
      request,
      { withCredentials: true }
    );
  }

  // Confirm booking from cart with payment method
  // Backend endpoint: POST /api/Bookings/confirm
  // Cart data comes from session on backend
  confirmBookingFromCart(request: BookingConfirmationDto): Observable<BookingResponse> {
    return this.httpClient.post<BookingResponse>(
      `${environment.baseUrl}/api/Bookings/confirm`,
      request,
      { withCredentials: true } // ✅ Session will be sent automatically
    );
  }

  // Get payment status
  getPaymentStatus(paymentIntentId: string): Observable<any> {
    return this.httpClient.get<any>(
      `${environment.baseUrl}/api/Payment/payment-status/${paymentIntentId}`,
      { withCredentials: true }
    );
  }

  // Process refund
  refundPayment(paymentIntentId: string, amount?: number): Observable<any> {
    const request = { paymentIntentId, amount };
    return this.httpClient.post<any>(
      `${environment.baseUrl}/api/Payment/refund`,
      request,
      { withCredentials: true }
    );
  }
}
