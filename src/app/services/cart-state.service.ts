
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartStateService {
  private cartItemCount = new BehaviorSubject<number>(0);
  private cartItems = new BehaviorSubject<any[]>([]);
  
  // Observable for components to subscribe to
  cartItemCount$ = this.cartItemCount.asObservable();
  cartItems$ = this.cartItems.asObservable();

  constructor() {
    this.loadInitialCartState();
  }

  private loadInitialCartState(): void {
    // Check if there's a cart item in session/local storage
    const savedCart = localStorage.getItem('bookingCart');
    if (savedCart) {
      try {
        const cartItem = JSON.parse(savedCart);
        this.cartItems.next([cartItem]);
        this.cartItemCount.next(1);
      } catch (error) {
        console.error('Error loading cart from storage:', error);
      }
    }
  }

  addToCart(item: any): void {
    this.cartItems.next([item]); // Since we only have one item at a time
    this.cartItemCount.next(1);
    
    // Save to localStorage as backup
    localStorage.setItem('bookingCart', JSON.stringify(item));
    
    // Trigger animation
    this.triggerCartAnimation();
  }

  clearCart(): void {
    this.cartItems.next([]);
    this.cartItemCount.next(0);
    localStorage.removeItem('bookingCart');
  }

  getCartItemCount(): number {
    return this.cartItemCount.value;
  }

  getCartItems(): any[] {
    return this.cartItems.value;
  }

  private triggerCartAnimation(): void {
    // This will be used by the cart badge directive
    const event = new CustomEvent('cartItemAdded');
    window.dispatchEvent(event);
  }
}