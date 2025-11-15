
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserAuth } from '../../services/user-auth';
import { RoomsService } from '../../services/room-service';
import { AdminService } from '../../services/admin';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
    // Stats
  totalBookings: number = 0;
  pendingBookings: number = 0;
  confirmedBookings: number = 0;
  cancelledBookings: number = 0;
  totalRevenue: number = 0;
  
  // Data
  bookings: any[] = [];
  roomTypes: any[] = [];
  availableRooms: any[] = [];
  
  // Loading states
  isLoading: boolean = true;
  isBookingsLoading: boolean = false;
  isRoomsLoading: boolean = false;
  
  // Current admin
  currentAdmin: any = {};

  constructor(
    private adminService: AdminService,
    private roomsService: RoomsService,
    private userAuth: UserAuth,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.userAuth.isAdmin()) {
      this.router.navigate(['/access-denied']);
      return;
    }

    this.currentAdmin = this.userAuth.getUser();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Load all data
    Promise.all([
      this.loadBookings(),
      this.loadRoomTypes(),
      this.loadAvailableRooms()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  loadBookings(): Promise<void> {
    this.isBookingsLoading = true;
    
    return new Promise((resolve) => {
      this.adminService.getAllBookings().subscribe({
        next: (data) => {
          this.bookings = data || [];
          this.calculateStats();
          this.isBookingsLoading = false;
          console.log('✅ Bookings loaded:', this.bookings.length);
          resolve();
        },
        error: (error) => {
          console.error('❌ Error loading bookings:', error);
          this.bookings = [];
          this.isBookingsLoading = false;
          resolve();
        }
      });
    });
  }

  loadRoomTypes(): Promise<void> {
    return new Promise((resolve) => {
      this.roomsService.getRoomsTypes().subscribe({
        next: (data) => {
          this.roomTypes = data || [];
          resolve();
        },
        error: (error) => {
          console.error('Error loading room types:', error);
          this.roomTypes = [];
          resolve();
        }
      });
    });
  }

  loadAvailableRooms(): Promise<void> {
    this.isRoomsLoading = true;
    
    return new Promise((resolve) => {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      this.roomsService.getAvailableRooms(today, tomorrow).subscribe({
        next: (rooms) => {
          this.availableRooms = rooms || [];
          this.isRoomsLoading = false;
          resolve();
        },
        error: (error) => {
          console.error('Error loading available rooms:', error);
          this.availableRooms = [];
          this.isRoomsLoading = false;
          resolve();
        }
      });
    });
  }

  calculateStats() {
    this.totalBookings = this.bookings.length;
    this.pendingBookings = this.bookings.filter(b => 
      b.status?.toLowerCase() === 'pending'
    ).length;
    this.confirmedBookings = this.bookings.filter(b => 
      b.status?.toLowerCase() === 'confirmed'
    ).length;
    this.cancelledBookings = this.bookings.filter(b => 
      b.status?.toLowerCase() === 'cancelled'
    ).length;
    
    this.totalRevenue = this.bookings
      .filter(b => (b.status?.toLowerCase() === 'confirmed' || b.status?.toLowerCase() === 'completed') && b.totalCost)
      .reduce((sum, booking) => sum + (booking.totalCost || 0), 0);
  }

  confirmBooking(bookingId: number) {
    if (confirm('Are you sure you want to confirm this booking?')) {
      this.adminService.confirmBooking(bookingId).subscribe({
        next: (response) => {
          console.log('✅ Booking confirmed:', response);
          alert('Booking confirmed successfully!');
          this.loadBookings(); // Reload to update status
        },
        error: (error) => {
          console.error('❌ Error confirming booking:', error);
          alert('Failed to confirm booking: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
  }

  rejectBooking(bookingId: number) {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason || !reason.trim()) {
      alert('Rejection reason is required');
      return;
    }

    if (confirm('Are you sure you want to reject this booking?')) {
      this.adminService.rejectBooking(bookingId, reason).subscribe({
        next: (response) => {
          console.log('✅ Booking rejected:', response);
          alert('Booking rejected successfully!');
          this.loadBookings(); // Reload to update status
        },
        error: (error) => {
          console.error('❌ Error rejecting booking:', error);
          alert('Failed to reject booking: ' + (error.error?.message || 'Unknown error'));
        }
      });
    }
  }

  refreshData() {
    this.loadDashboardData();
  }

  getStatusBadgeClass(status: string): string {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'confirmed': return 'badge bg-success';
      case 'pending': return 'badge bg-warning text-dark';
      case 'cancelled': return 'badge bg-danger';
      case 'completed': return 'badge bg-info';
      case 'rejected': return 'badge bg-secondary';
      default: return 'badge bg-secondary';
    }
  }

  logout() {
    this.userAuth.logout();
    this.router.navigate(['/login']);
  }
}