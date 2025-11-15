import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IBookings } from '../../models/ibooking';
import { BookingRooms } from '../../services/booking-rooms';
import { ToastNotificationService } from '../../services/toast-notification.service';
import { LoggingService } from '../../services/logging.service';
import { BookingStateService } from '../../services/booking-state.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bookings',
  imports: [CommonModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class Bookings implements OnInit, OnDestroy {
  bookings: IBookings[] = [];
  isLoading: boolean = false;
  activeFilter: 'all' | 'confirmed' | 'pending' | 'cancelled' = 'all';
  confirmedCount: number = 0;
  pendingCount: number = 0;
  cancelledCount: number = 0;
  newBookingHighlight: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private bookingService: BookingRooms,
    private toastService: ToastNotificationService,
    private loggingService: LoggingService,
    private bookingStateService: BookingStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if there's a newly created booking passed from checkout via router state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state && (navigation.extras.state as any)['newBooking']) {
      const newBooking = (navigation.extras.state as any)['newBooking'];
      this.newBookingHighlight = newBooking.id;
      this.loggingService.info('New booking received from checkout (router state)', { bookingId: newBooking.id });
      this.toastService.success('Booking created successfully!');
    }

    // Also subscribe to BookingStateService for booking data
    this.bookingStateService.getNewBooking$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((booking) => {
        if (booking && booking.id) {
          this.newBookingHighlight = booking.id as number;
          this.loggingService.info('New booking received from checkout (booking state service)', { bookingId: booking.id });
          if (!navigation?.extras?.state?.['newBooking']) {
            this.toastService.success('Booking created successfully!');
          }
        }
      });

    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.bookingStateService.clearNewBooking();
  }

  loadBookings(): void {
    this.isLoading = true;
    this.bookingService.getAllBookings().subscribe({
      next: (res) => {
        this.bookings = res;
        this.updateBadgeCounts();
        this.loggingService.info('Bookings loaded successfully', { count: res.length });
        this.toastService.success('Bookings loaded successfully');
        this.isLoading = false;
      },
      error: (err) => {
        this.loggingService.error('Error fetching bookings', err);
        this.toastService.error('Failed to load bookings');
        this.isLoading = false;
      }
    });
  }

  private updateBadgeCounts(): void {
    this.confirmedCount = this.countByStatus('Confirmed');
    this.pendingCount = this.countByStatus('Pending');
    this.cancelledCount = this.countByStatus('Cancelled');
  }

  private countByStatus(status: string): number {
    return this.bookings.filter((booking: IBookings) => booking.status === status).length;
  }

  getFilteredBookings(): IBookings[] {
    if (this.activeFilter === 'all') {
      return this.bookings;
    }
    return this.bookings.filter(booking => booking.status.toLowerCase() === this.activeFilter);
  }

  setFilter(filter: 'all' | 'confirmed' | 'pending' | 'cancelled'): void {
    this.activeFilter = filter;
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Confirmed': 'bg-success',
      'Pending': 'bg-warning',
      'Cancelled': 'bg-danger',
      'Completed': 'bg-info'
    };
    return statusMap[status] || 'bg-secondary';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      'Confirmed': 'bi-check-circle',
      'Pending': 'bi-clock',
      'Cancelled': 'bi-x-circle',
      'Completed': 'bi-check2-all'
    };
    return iconMap[status] || 'bi-info-circle';
  }

  isNewBooking(bookingId: number): boolean {
    return this.newBookingHighlight === bookingId;
  }

  viewBookingDetails(booking: IBookings): void {
    this.loggingService.info('Viewing booking details', { bookingId: booking.id });
    
    // Pass booking data through router state for potential future detail page
    Swal.fire({
      title: `Booking #${booking.id}`,
      html: `
        <div style="text-align: left;">
          <div class="booking-detail-section">
            <h6 style="color: #667eea; font-weight: 600; margin-bottom: 10px;">Room Information</h6>
            <p><strong>Room Number:</strong> ${booking.roomNumber}</p>
            <p><strong>Room Type:</strong> ${booking.roomTypeName}</p>
          </div>
          <hr style="margin: 15px 0;">
          <div class="booking-detail-section">
            <h6 style="color: #667eea; font-weight: 600; margin-bottom: 10px;">Guest Information</h6>
            <p><strong>Guest Name:</strong> ${booking.customerName}</p>
            <p><strong>Email:</strong> ${booking.customerEmail}</p>
          </div>
          <hr style="margin: 15px 0;">
          <div class="booking-detail-section">
            <h6 style="color: #667eea; font-weight: 600; margin-bottom: 10px;">Stay Details</h6>
            <p><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Duration:</strong> ${booking.numberOfNights} night(s)</p>
          </div>
          <hr style="margin: 15px 0;">
          <div class="booking-detail-section">
            <h6 style="color: #667eea; font-weight: 600; margin-bottom: 10px;">Cost Information</h6>
            <p><strong>Total Cost:</strong> <span style="font-size: 1.2rem; color: #28a745; font-weight: bold;">$${booking.totalCost}</span></p>
          </div>
          <hr style="margin: 15px 0;">
          <div class="booking-detail-section">
            <h6 style="color: #667eea; font-weight: 600; margin-bottom: 10px;">Booking Status</h6>
            <p><strong>Status:</strong> <span class="badge ${this.getStatusBadgeClass(booking.status)}" style="padding: 6px 12px; font-size: 0.9rem;">${booking.status}</span></p>
            <p><strong>Booked on:</strong> ${new Date(booking.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Close',
      confirmButtonColor: '#667eea',
      width: '600px'
    });
  }

  cancelBooking(booking: IBookings): void {
    this.loggingService.info('Cancel booking requested', { 
      bookingId: booking.id,
      roomNumber: booking.roomNumber,
      customerName: booking.customerName
    });
    
    Swal.fire({
      title: 'Cancel Booking?',
      html: `
        <div style="text-align: left;">
          <p>Are you sure you want to cancel this booking?</p>
          <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 10px;">
            <p style="margin: 5px 0;"><strong>Booking #${booking.id}</strong></p>
            <p style="margin: 5px 0; color: #6c757d;">Room ${booking.roomNumber} (${booking.roomTypeName})</p>
            <p style="margin: 5px 0; color: #6c757d;">Guest: ${booking.customerName}</p>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Cancel Booking',
      cancelButtonText: 'Keep Booking'
    }).then((result) => {
      if (result.isConfirmed) {
        // Pass booking data for cancellation
        this.loggingService.info('Booking cancellation confirmed', { 
          bookingId: booking.id,
          bookingData: booking
        });
        this.toastService.info('Booking cancellation request submitted');
        
        Swal.fire({
          title: 'Request Submitted',
          text: 'Your booking cancellation request has been submitted. You will receive a confirmation email shortly.',
          icon: 'success',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  downloadReceipt(booking: IBookings): void {
    this.loggingService.info('Downloading booking receipt', { 
      bookingId: booking.id,
      customerName: booking.customerName
    });

    const receiptContent = `
╔════════════════════════════════════════════════════════════════╗
║                   BOOKIFY - BOOKING RECEIPT                    ║
╚════════════════════════════════════════════════════════════════╝

BOOKING INFORMATION
──────────────────────────────────────────────────────────────────
Booking ID:          ${booking.id}
Booking Date:        ${new Date(booking.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Status:              ${booking.status}

ROOM DETAILS
──────────────────────────────────────────────────────────────────
Room Number:         ${booking.roomNumber}
Room Type:           ${booking.roomTypeName}

GUEST INFORMATION
──────────────────────────────────────────────────────────────────
Guest Name:          ${booking.customerName}
Email:               ${booking.customerEmail}

STAY DETAILS
──────────────────────────────────────────────────────────────────
Check-in Date:       ${new Date(booking.checkInDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Check-out Date:      ${new Date(booking.checkOutDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Number of Nights:    ${booking.numberOfNights}

COST BREAKDOWN
──────────────────────────────────────────────────────────────────
Total Amount:        $${booking.totalCost}

PAYMENT STATUS
──────────────────────────────────────────────────────────────────
Payment Status:      ${booking.status === 'Confirmed' ? 'PAID' : 'PENDING'}

──────────────────────────────────────────────────────────────────
Thank you for booking with Bookify!
For any queries, contact us at: support@bookify.com

Receipt Generated:   ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
╚════════════════════════════════════════════════════════════════╝
    `.trim();

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
    element.setAttribute('download', `Bookify-Receipt-${booking.id}-${new Date().getTime()}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    this.loggingService.info('Receipt downloaded successfully', { bookingId: booking.id });
    this.toastService.success('Receipt downloaded successfully');
  }
}
