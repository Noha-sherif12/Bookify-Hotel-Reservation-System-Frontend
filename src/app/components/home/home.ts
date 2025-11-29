import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { RoomsService } from '../../services/room-service';
import { CommonModule } from '@angular/common';
import { AvailableRooms, Roomtypes } from '../../models/iroom'
import { FormsModule } from '@angular/forms';
import { BookingRooms } from '../../services/booking-rooms';
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

  constructor(
    private roomService: RoomsService, 
    private _roomService: BookingRooms,
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
    this.initScrollAnimations();
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
    
    document.querySelectorAll('[data-aos]').forEach(el => {
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
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          
          if (element.classList.contains('aos-scroll-up')) {
            element.classList.add('aos-animate-up');
            element.classList.remove('aos-animate-down');
          } else {
            element.classList.add('aos-animate-down');
            element.classList.remove('aos-animate-up');
          }
          
          element.classList.add('aos-animate');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('[data-aos]').forEach(el => {
      this.observer.observe(el);
    });
  }

  availableRoom(): void {
    if (!this.availableParams.from || !this.availableParams.to) {
      Swal.fire('Error', 'Please select both check-in and check-out dates', 'error');
      return;
    }

    this.roomService.getAvailableRooms(this.availableParams.from, this.availableParams.to).subscribe({
      next: (res) => {
        this.availableRooms = res;
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
    if (!this.availableParams.from || !this.availableParams.to) {
      Swal.fire('Error', 'Please select dates first', 'error');
      return;
    }

    const cartData: IAddRoom = {
      roomId: 1,
      checkInDate: this.availableParams.from,
      checkOutDate: this.availableParams.to,
      customerName: "customer",
      customerEmail: "customer@example.com"
    };

    this._roomService.addBookingCart(cartData).subscribe({
      next: (res) => {
        console.log('Response:', res);
        console.log('Session cookies should be automatically handled by browser');
        console.log('Document cookies:', document.cookie);

        Swal.fire({
          title: "Room added successfully",
          icon: "success",
        });
      },
      error: (err) => {
        console.error('Add to cart error:', err);
        Swal.fire('Error', 'Failed to add room to cart', 'error');
      }
    });
  }

  navigateToCheckout(): void {
    if (!this.availableParams.from || !this.availableParams.to) {
      Swal.fire('Error', 'Please select dates first', 'error');
      return;
    }
    
    this.router.navigate(['/checkout']);
  }
}