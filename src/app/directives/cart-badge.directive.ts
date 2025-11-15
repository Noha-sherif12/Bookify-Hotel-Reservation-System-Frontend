// directives/cart-badge.directive.ts
import { Directive, ElementRef, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CartStateService } from '../services/cart-state.service';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appCartBadge]',
  standalone: true
})
export class CartBadgeDirective implements OnInit, OnDestroy {
  private badgeElement: HTMLElement | null = null;
  private subscriptions: Subscription[] = [];
  private itemCount = 0;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private cartState: CartStateService
  ) {}

  ngOnInit(): void {
    this.createBadge();
    this.subscribeToCartChanges();
    
    // Listen for cart animation events
    window.addEventListener('cartItemAdded', this.triggerAnimation.bind(this));
  }

  private createBadge(): void {
    // Create badge element
    this.badgeElement = this.renderer.createElement('span');
    this.renderer.addClass(this.badgeElement, 'cart-badge');
    this.renderer.addClass(this.badgeElement, 'position-absolute');
    this.renderer.addClass(this.badgeElement, 'top-0');
    this.renderer.addClass(this.badgeElement, 'start-100');
    this.renderer.addClass(this.badgeElement, 'translate-middle');
    this.renderer.addClass(this.badgeElement, 'badge');
    this.renderer.addClass(this.badgeElement, 'rounded-pill');
    this.renderer.addClass(this.badgeElement, 'bg-danger');
    
    // Style the badge
    this.renderer.setStyle(this.badgeElement, 'font-size', '0.7rem');
    this.renderer.setStyle(this.badgeElement, 'min-width', '18px');
    this.renderer.setStyle(this.badgeElement, 'height', '18px');
    this.renderer.setStyle(this.badgeElement, 'display', 'flex');
    this.renderer.setStyle(this.badgeElement, 'align-items', 'center');
    this.renderer.setStyle(this.badgeElement, 'justify-content', 'center');
    this.renderer.setStyle(this.badgeElement, 'z-index', '1000');

    // Ensure the host element has relative positioning
    this.renderer.addClass(this.el.nativeElement, 'position-relative');

    // Append badge to host element
    this.renderer.appendChild(this.el.nativeElement, this.badgeElement);

    // Initially hide the badge
    this.updateBadgeVisibility();
  }

  private subscribeToCartChanges(): void {
    const countSubscription = this.cartState.cartItemCount$.subscribe(count => {
      this.itemCount = count;
      this.updateBadge();
    });

    this.subscriptions.push(countSubscription);
  }

  private updateBadge(): void {
    if (!this.badgeElement) return;

    if (this.itemCount > 0) {
      this.renderer.setProperty(this.badgeElement, 'textContent', this.itemCount.toString());
      this.renderer.removeClass(this.badgeElement, 'd-none');
      this.renderer.addClass(this.badgeElement, 'd-flex');
    } else {
      this.renderer.addClass(this.badgeElement, 'd-none');
      this.renderer.removeClass(this.badgeElement, 'd-flex');
    }

    this.updateBadgeVisibility();
  }

  private updateBadgeVisibility(): void {
    if (!this.badgeElement) return;
    
    if (this.itemCount > 0) {
      this.renderer.removeStyle(this.badgeElement, 'display');
    } else {
      this.renderer.setStyle(this.badgeElement, 'display', 'none');
    }
  }

  private triggerAnimation(): void {
    if (!this.badgeElement || this.itemCount === 0) return;

    // Add animation class
    this.renderer.addClass(this.badgeElement, 'pulse');

    // Remove animation class after animation completes
    setTimeout(() => {
      this.renderer.removeClass(this.badgeElement, 'pulse');
    }, 500);
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    window.removeEventListener('cartItemAdded', this.triggerAnimation.bind(this));
    
    // Remove badge element
    if (this.badgeElement) {
      this.renderer.removeChild(this.el.nativeElement, this.badgeElement);
    }
  }
}