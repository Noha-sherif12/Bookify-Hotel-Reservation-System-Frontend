import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { RoomsService } from '../../services/room-service';
import { CommonModule } from '@angular/common';
import { AvailableRooms, Roomtypes } from '../../models/iroom'
import { FormsModule } from '@angular/forms';
import { BookingRooms } from '../../services/booking-rooms';
import { UserAuth } from '../../services/user-auth';
import Swal from 'sweetalert2';
import { IAddRoom } from '../../models/icart';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  availableRooms: AvailableRooms[] = [];
  roomsTypes: Roomtypes[] = [];
  availableParams = {
    from: '',
    to: '',
  };

  selectedRoomId: number | null = null;
  private observer!: IntersectionObserver;
  private lastScrollY = 0;
  private ticking = false;

  // Make userAuth public for use in template
  constructor(
    private roomService: RoomsService, 
    private _roomService: BookingRooms,
    public userAuth: UserAuth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.roomService.getRoomsTypes().subscribe({
      next: (res) => {
        this.roomsTypes = res;
      },
      error: (err) => {
        console.log(err)
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initScrollAnimations();
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.handleScrollDirection();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  private handleScrollDirection(): void {
    const currentScrollY = window.scrollY;
    
    document.querySelectorAll('[data-aos]:not(.aos-animate)').forEach(el => {
      if (currentScrollY < this.lastScrollY) {
        el.classList.add('aos-scroll-up');
        el.classList.remove('aos-scroll-down');
      } else {
        el.classList.add('aos-scroll-down');
        el.classList.remove('aos-scroll-up');
      }
    });

    this.lastScrollY = currentScrollY;
  }

  private initScrollAnimations(): void {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const element = entry.target as HTMLElement;
        
        if (entry.isIntersecting) {
          if (element.classList.contains('aos-scroll-up')) {
            element.classList.add('aos-animate-up');
            element.classList.remove('aos-animate-down');
          } else {
            element.classList.add('aos-animate-down');
            element.classList.remove('aos-animate-up');
          }
          
          element.classList.add('aos-animate');
        } else {
          element.classList.remove('aos-animate', 'aos-animate-up', 'aos-animate-down', 'aos-scroll-up', 'aos-scroll-down');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -10px 0px'
    });

    const animatedElements = document.querySelectorAll('[data-aos]');
    if (animatedElements.length > 0) {
      animatedElements.forEach(el => {
        this.observer.observe(el);
      });
    }
  }

  availableRoom(): void {
    if (!this.availableParams.from || !this.availableParams.to) {
      Swal.fire('Error', 'Please select both check-in and check-out dates', 'error');
      return;
    }

    // Validate dates
    const checkIn = new Date(this.availableParams.from);
    const checkOut = new Date(this.availableParams.to);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn >= checkOut) {
      Swal.fire('Error', 'Check-out date must be after check-in date', 'error');
      return;
    }

    if (checkIn < today) {
      Swal.fire('Error', 'Check-in date must be today or in the future', 'error');
      return;
    }

    this.roomService.getAvailableRooms(this.availableParams.from, this.availableParams.to).subscribe({
      next: (res) => {
        this.availableRooms = res;
        setTimeout(() => {
          this.initScrollAnimations();
        }, 100);
      },
      error: (err) => {
        console.log(err);
        Swal.fire('Error', 'Failed to load available rooms', 'error');
      }
    });
  }

  selectRoom(roomId: number): void {
    this.selectedRoomId = roomId;
  }

  addToCart(room: AvailableRooms): void {
    console.log('🛒 Add to cart clicked for room:', room);
    
    // Check if user is logged in
    if (!this.userAuth.isAuthenticated()) {
      this.showLoginAlert('add to cart', room);
      return;
    }
    
    if (!this.availableParams.from || !this.availableParams.to) {
      Swal.fire('Error', 'Please select dates first', 'error');
      return;
    }

    // Validate dates before sending
    const checkIn = new Date(this.availableParams.from);
    const checkOut = new Date(this.availableParams.to);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn >= checkOut) {
      Swal.fire('Error', 'Check-out date must be after check-in date', 'error');
      return;
    }

    if (checkIn < today) {
      Swal.fire('Error', 'Check-in date must be today or in the future', 'error');
      return;
    }

    // Create cart data
    const cartData: IAddRoom = {
      roomId: room.id,
      checkInDate: this.availableParams.from,
      checkOutDate: this.availableParams.to,

    };

    console.log('🛒 Sending cart data:', cartData);

    // Show loading
    Swal.fire({
      title: 'Adding to cart...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this._roomService.addBookingCart(cartData).subscribe({
      next: (res) => {
        console.log('✅ Add to cart response:', res);
        
        Swal.fire({
          title: "Success!",
          html: `<div class="text-center">
            <i class="bi bi-cart-check display-4 text-success mb-3"></i>
            <h5>Room Added to Cart!</h5>
            <p class="mb-1"><strong>Room ${room.roomNumber}</strong> - ${room.roomTypeName}</p>
            <p class="mb-1"><strong>Dates:</strong> ${this.availableParams.from} to ${this.availableParams.to}</p>
            <p><strong>Price:</strong> $${room.pricePerNight} per night</p>
          </div>`,
          icon: "success",
          confirmButtonText: 'View Cart',
          showCancelButton: true,
          cancelButtonText: 'Continue Browsing',
          confirmButtonColor: '#294c57',
          cancelButtonColor: '#6c757d'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/cart']);
          }
        });
      },
      error: (err) => {
        console.error('❌ Add to cart error details:', err);
        
        let errorMessage = 'Failed to add room to cart';
        
        if (err.status === 400) {
          errorMessage = err.error?.message || 'Invalid request. Please check your dates.';
        } else if (err.status === 404) {
          errorMessage = 'Room not found or no longer available';
        } else if (err.status === 401) {
          errorMessage = 'Please log in to add items to cart';
          this.showLoginAlert('add to cart', room);
          return;
        }
        
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }

  // Method to show login alert
  showLoginAlert(action: string = 'continue', room?: AvailableRooms): void {
    Swal.fire({
      title: 'Login Required',
      html: `<div class="text-center">
        <i class="bi bi-person-circle display-1 text-primary mb-3"></i>
        <h5>Login Required</h5>
        <p class="text-muted">Please log in to ${action}.</p>
        ${room ? `<p class="small text-muted mb-0">Room: <strong>${room.roomNumber}</strong> - ${room.roomTypeName}</p>` : ''}
      </div>`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Go to Login',
      cancelButtonText: 'Maybe Later',
      confirmButtonColor: '#294c57',
      cancelButtonColor: '#6c757d',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to login page with room info if available
        const queryParams: any = {};
        if (room) {
          queryParams.roomId = room.id;
          if (this.availableParams.from && this.availableParams.to) {
            queryParams.checkIn = this.availableParams.from;
            queryParams.checkOut = this.availableParams.to;
          }
        }
        
        this.router.navigate(['/login'], { queryParams });
      }
    });
  }

  // Quick book method (optional)
  quickBook(room: AvailableRooms): void {
    if (!this.userAuth.isAuthenticated()) {
      this.showLoginAlert('book this room', room);
      return;
    }
    
    if (!this.availableParams.from || !this.availableParams.to) {
      Swal.fire('Error', 'Please select dates first', 'error');
      return;
    }

    // Validate dates
    const checkIn = new Date(this.availableParams.from);
    const checkOut = new Date(this.availableParams.to);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn >= checkOut) {
      Swal.fire('Error', 'Check-out date must be after check-in date', 'error');
      return;
    }

    if (checkIn < today) {
      Swal.fire('Error', 'Check-in date must be today or in the future', 'error');
      return;
    }

    // Calculate nights and total
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24));
    const total = nights * room.pricePerNight;

    Swal.fire({
      title: 'Quick Book',
      html: `<div class="text-center">
        <i class="bi bi-lightning-charge display-4 text-warning mb-3"></i>
        <h5>Book Room ${room.roomNumber}</h5>
        <div class="text-start">
          <p><strong>Type:</strong> ${room.roomTypeName}</p>
          <p><strong>Dates:</strong> ${this.availableParams.from} to ${this.availableParams.to}</p>
          <p><strong>Nights:</strong> ${nights}</p>
          <p><strong>Total:</strong> $${total} ($${room.pricePerNight} × ${nights} nights)</p>
        </div>
      </div>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Book Now',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#198754',
      cancelButtonColor: '#6c757d'
    }).then((result) => {
      if (result.isConfirmed) {
        this.addToCartAndCheckout(room);
      }
    });
  }

  // Private method to add to cart and go to checkout
  private addToCartAndCheckout(room: AvailableRooms): void {
    const cartData: IAddRoom = {
      roomId: room.id,
      checkInDate: this.availableParams.from,
      checkOutDate: this.availableParams.to,

    };

    Swal.fire({
      title: 'Processing...',
      text: 'Preparing your booking',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this._roomService.addBookingCart(cartData).subscribe({
      next: (res) => {
        console.log('✅ Room added to cart for quick booking:', res);
        // Navigate directly to checkout
        this.router.navigate(['/checkout']);
      },
      error: (err) => {
        console.error('❌ Error adding to cart:', err);
        
        let errorMessage = 'Failed to process booking';
        if (err.status === 401) {
          errorMessage = 'Please log in to make a booking';
          this.showLoginAlert('book this room', room);
        } else if (err.status === 400) {
          errorMessage = err.error?.message || 'Invalid booking request';
        }
        
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#dc3545'
        });
      }
    });
  }
}