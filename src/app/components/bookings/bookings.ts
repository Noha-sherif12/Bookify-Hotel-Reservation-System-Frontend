import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IBookings } from '../../models/ibooking';
import { BookingRooms } from '../../services/booking-rooms';
import { ToastNotificationService } from '../../services/toast-notification.service';
import { LoggingService } from '../../services/logging.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-bookings',
  imports: [CommonModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class Bookings implements OnInit {
  bookings: IBookings[] = [];
  isLoading: boolean = false;
  activeFilter: 'all' | 'confirmed' | 'pending' | 'cancelled' = 'all';
  confirmedCount: number = 0;
  pendingCount: number = 0;
  cancelledCount: number = 0;

  constructor(
    private bookingService: BookingRooms,
    private toastService: ToastNotificationService,
    private loggingService: LoggingService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
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

  viewBookingDetails(booking: IBookings): void {
    Swal.fire({
      title: `Booking #${booking.id}`,
      html: `
        <div style="text-align: left;">
          <p><strong>Room:</strong> ${booking.roomNumber} - ${booking.roomTypeName}</p>
          <p><strong>Guest:</strong> ${booking.customerName}</p>
          <p><strong>Email:</strong> ${booking.customerEmail}</p>
          <p><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString()}</p>
          <p><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toLocaleDateString()}</p>
          <p><strong>Nights:</strong> ${booking.numberOfNights}</p>
          <p><strong>Total Cost:</strong> $${booking.totalCost}</p>
          <p><strong>Status:</strong> <span class="badge ${this.getStatusBadgeClass(booking.status)}">${booking.status}</span></p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Close'
    });
  }

  cancelBooking(booking: IBookings): void {
    Swal.fire({
      title: 'Cancel Booking?',
      text: `Cancel booking #${booking.id}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.toastService.info('Booking cancellation request submitted');
        this.loggingService.info('Booking cancellation requested', { bookingId: booking.id });
      }
    });
  }

  downloadReceipt(booking: IBookings): void {
    const receiptContent = `
BOOKING RECEIPT
========================================
Booking ID: ${booking.id}
Room: ${booking.roomNumber} (${booking.roomTypeName})
Guest: ${booking.customerName}
Email: ${booking.customerEmail}
Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}
Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()}
Nights: ${booking.numberOfNights}
Total Cost: $${booking.totalCost}
Status: ${booking.status}
Booking Date: ${new Date(booking.createdAt).toLocaleDateString()}
========================================
Thank you for your booking!
    `.trim();

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
    element.setAttribute('download', `Receipt-${booking.id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    this.toastService.success('Receipt downloaded');
  }
}
