import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookingRooms } from '../../services/booking-rooms';
import { UserAuth } from '../../services/user-auth';
import { ToastNotificationService } from '../../services/toast-notification.service';
import { IBookings } from '../../models/ibooking';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  userProfile: any = null;
  bookings: IBookings[] = [];
  upcomingBookings: IBookings[] = [];
  pastBookings: IBookings[] = [];
  isLoading: boolean = false;
  activeTab: 'profile' | 'upcoming' | 'past' = 'profile';

  constructor(
    private bookingRooms: BookingRooms,
    private userAuth: UserAuth,
    private toastService: ToastNotificationService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadBookingHistory();
  }

  private loadUserProfile(): void {
    this.userProfile = this.userAuth.getUser();
    console.log('User Profile:', this.userProfile);
  }

  private loadBookingHistory(): void {
    this.isLoading = true;
    this.bookingRooms.getAllBookings().subscribe({
      next: (response) => {
        console.log('Bookings:', response);
        this.bookings = response;
        this.categorizeBookings();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.toastService.error('Failed to load booking history');
        this.isLoading = false;
      }
    });
  }

  private categorizeBookings(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.upcomingBookings = this.bookings.filter(booking => {
      const checkInDate = new Date(booking.checkInDate);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate >= today && booking.status !== 'Cancelled';
    }).sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime());

    this.pastBookings = this.bookings.filter(booking => {
      const checkOutDate = new Date(booking.checkOutDate);
      checkOutDate.setHours(0, 0, 0, 0);
      return checkOutDate < today || booking.status === 'Cancelled';
    }).sort((a, b) => new Date(b.checkOutDate).getTime() - new Date(a.checkOutDate).getTime());
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

  cancelBooking(booking: IBookings): void {
    Swal.fire({
      title: 'Cancel Booking?',
      text: 'Are you sure you want to cancel this booking?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Cancel Booking'
    }).then((result) => {
      if (result.isConfirmed) {
        // Call cancel API when implemented
        this.toastService.info('Cancellation request submitted');
      }
    });
  }

  switchTab(tab: 'profile' | 'upcoming' | 'past'): void {
    this.activeTab = tab;
  }

  editProfile(): void {
    Swal.fire({
      title: 'Edit Profile',
      text: 'Profile editing feature coming soon',
      icon: 'info'
    });
  }

  downloadReceipt(booking: IBookings): void {
    // Generate and download receipt
    const receiptContent = this.generateReceiptContent(booking);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptContent));
    element.setAttribute('download', `Receipt-${booking.id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    this.toastService.success('Receipt downloaded');
  }

  private generateReceiptContent(booking: IBookings): string {
    return `
BOOKING RECEIPT
========================================
Booking ID: ${booking.id}
Guest Name: ${booking.customerName}
Email: ${booking.customerEmail}
Phone: -
Room: ${booking.roomNumber} (${booking.roomTypeName})
Check-in: ${new Date(booking.checkInDate).toLocaleDateString()}
Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()}
Number of Nights: ${booking.numberOfNights}
Total Cost: $${booking.totalCost}
Status: ${booking.status}
Booking Date: ${new Date(booking.createdAt).toLocaleDateString()}
========================================
Thank you for your reservation!
    `.trim();
  }
}

