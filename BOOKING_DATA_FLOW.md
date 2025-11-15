# Booking Data Flow - Complete Payment to My Bookings

## Overview
This document describes how booking data flows from the checkout complete payment page to the My Bookings page.

## Architecture

### Components & Services Involved:
1. **CheckoutComponent** - Handles payment processing
2. **BookingStateService** - Shared state management for booking data
3. **Bookings Component** - Displays user's bookings

### Data Flow Diagram:
```
┌─────────────────┐
│ User completes  │
│ payment in      │
│ Checkout        │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 1. Checkout calls:                      │
│    - showCompleteSuccessPage()          │
│    - confirmBookingWithPayment()        │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 2. Prepare booking data from:           │
│    - cartItem (room info, dates, cost)  │
│    - formData (customer name, email)    │
│    - response from backend              │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 3. Store booking data via:              │
│    - BookingStateService                │
│    - Router state (navigation)          │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 4. Show Success Modal with:             │
│    - Booking summary                    │
│    - Booking ID                         │
│    - Guest & room details               │
│    - Confirmation message               │
└────────┬────────────────────────────────┘
         │
         ▼ User clicks "View My Bookings"
┌─────────────────────────────────────────┐
│ 5. Navigate to /bookings with state     │
│    router.navigate(['/bookings'], {     │
│      state: { newBooking: bookingData } │
│    })                                   │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 6. Bookings component ngOnInit:         │
│    - Check router navigation state      │
│    - Subscribe to BookingStateService   │
│    - Set newBookingHighlight ID         │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 7. Load all bookings from backend       │
│    - Call getAllBookings()              │
│    - Update badge counts                │
│    - Apply filters                      │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ 8. Render bookings list with:           │
│    - Highlight new booking with:        │
│      * Gold/yellow border               │
│      * "NEW" badge with star icon       │
│      * isNewBooking() check              │
│    - Display other bookings normally    │
└─────────────────────────────────────────┘
```

## Code Implementation

### 1. Checkout Component (checkout.ts)

**Store booking data using BookingStateService:**
```typescript
// In both showCompleteSuccessPage() and confirmBookingWithPayment()
const bookingData = {
  id: 12345,
  roomNumber: this.cartItem?.roomNumber || '101',
  roomTypeName: this.cartItem?.roomTypeName || 'Deluxe Room',
  customerName: this.formData.fullName || 'Test User',
  customerEmail: this.formData.email || 'test@example.com',
  checkInDate: this.cartItem?.checkInDate || '2025-12-01',
  checkOutDate: this.cartItem?.checkOutDate || '2025-12-05',
  numberOfNights: this.cartItem?.numberOfNights || 4,
  totalCost: this.cartItem?.totalCost || 600,
  status: 'Confirmed',
  createdAt: new Date().toISOString()
};

// Store in service
this.bookingStateService.setNewBooking(bookingData);

// Navigate with state
this.router.navigate(['/bookings'], {
  state: { newBooking: bookingData }
});
```

### 2. BookingStateService (booking-state.service.ts)

**Centralized state management:**
```typescript
export class BookingStateService {
  private newBookingSubject = new BehaviorSubject<Partial<IBookings> | null>(null);
  public newBooking$ = this.newBookingSubject.asObservable();

  setNewBooking(booking: Partial<IBookings>): void {
    this.newBookingSubject.next(booking);
  }

  getNewBooking(): Partial<IBookings> | null {
    return this.newBookingSubject.getValue();
  }

  clearNewBooking(): void {
    this.newBookingSubject.next(null);
  }
}
```

### 3. Bookings Component (bookings.ts)

**Receive and highlight new booking:**
```typescript
ngOnInit(): void {
  // Check router navigation state
  const navigation = this.router.getCurrentNavigation();
  if (navigation?.extras?.state && (navigation.extras.state as any)['newBooking']) {
    const newBooking = (navigation.extras.state as any)['newBooking'];
    this.newBookingHighlight = newBooking.id;
  }

  // Also listen to service
  this.bookingStateService.getNewBooking$()
    .pipe(takeUntil(this.destroy$))
    .subscribe((booking) => {
      if (booking && booking.id) {
        this.newBookingHighlight = booking.id as number;
      }
    });

  this.loadBookings();
}

isNewBooking(bookingId: number): boolean {
  return this.newBookingHighlight === bookingId;
}

ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
  this.bookingStateService.clearNewBooking();
}
```

### 4. Bookings Template (bookings.html)

**Highlight new booking:**
```html
<div class="booking-card" [class.new-booking-highlight]="isNewBooking(booking.id)">
  @if (isNewBooking(booking.id)) {
    <div class="new-booking-badge">
      <i class="bi bi-star-fill me-1"></i>NEW
    </div>
  }
  <!-- Booking content -->
</div>
```

### 5. Bookings Styling (bookings.css)

**Visual highlighting:**
```css
.booking-card.new-booking-highlight {
  border: 2px solid #ffc107;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.3);
}

.new-booking-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}
```

## Data Flow During Fake Payment Mode

When `useCompletePayment = true` (fake payment):

1. User fills form and clicks "Complete Payment"
2. `processPayment()` calls `showCompleteSuccessPage()`
3. Booking data prepared from cart + form data
4. BookingStateService stores data
5. Success modal shows booking details
6. User clicks "View My Bookings"
7. Navigate to bookings with booking data
8. Bookings component displays list with new booking highlighted

## Data Flow During Real Payment Mode

When `useCompletePayment = false` (real Stripe payment):

1. User fills form and clicks "Complete Payment"
2. `processPayment()` calls `createPaymentMethod()`
3. Stripe processes payment with payment method
4. Backend confirms booking via `confirmBookingFromCart()`
5. Booking data prepared from response + cart
6. BookingStateService stores data
7. Success modal shows booking details
8. User clicks "View My Bookings"
9. Navigate to bookings with booking data
10. Bookings component displays list with new booking highlighted

## Key Features

✅ **Dual Storage**: Data stored in both service and router state for reliability
✅ **Visual Highlight**: New booking marked with gold border and "NEW" badge
✅ **Full Details**: Booking ID, room, guest, dates, cost all preserved
✅ **Logging**: All transitions logged for debugging
✅ **Cleanup**: Service clears data after component destruction
✅ **Responsive**: Works with both fake and real payment flows

## Testing

The flow can be tested by:

1. **Fake Payment Mode**:
   - Navigate to checkout
   - Fill all form fields
   - Click "Complete Payment"
   - Verify success modal appears
   - Click "View My Bookings"
   - Verify new booking appears with gold highlight

2. **Real Payment Mode** (requires backend):
   - Set `useCompletePayment = false`
   - Add real Stripe test card
   - Complete same flow as above

## Browser Console Logs

You can monitor data flow in DevTools console:

```
✅ New booking data stored in state
📊 New booking received from checkout (router state)
✅ Bookings loaded successfully
⚠️ New booking highlighted with ID: 12345
```
