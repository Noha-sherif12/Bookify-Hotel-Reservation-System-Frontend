# Bookify Hotel Reservation System - Frontend Implementation
## Week 3 & Week 4 Features

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Week 3 Features](#week-3-features)
3. [Week 4 Features](#week-4-features)
4. [Installation & Setup](#installation--setup)
5. [Architecture](#architecture)
6. [API Integration](#api-integration)
7. [Component Guide](#component-guide)
8. [Services Guide](#services-guide)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## 🎯 Project Overview

Bookify is a comprehensive hotel reservation system with:
- ✅ Booking confirmation with transaction handling
- ✅ Stripe payment integration
- ✅ User profile management
- ✅ Booking history tracking
- ✅ Health monitoring
- ✅ Structured logging
- ✅ Toast notifications
- ✅ Responsive UI with Bootstrap

**Technology Stack:**
- Angular 20.2
- Bootstrap 5.3
- Stripe.js
- TypeScript 5.9
- RxJS 7.8

---

## 🎯 Week 3 Features

### 1. **Shopping Cart & Session Management**

#### File: `src/app/components/cart/`

**Features:**
- Display cart items with booking details
- Session persistence with `withCredentials: true`
- Real-time cart calculation
- Multiple action buttons

**Session Handling Implementation:**
```typescript
// All API calls include withCredentials for session preservation
this._BookingRooms.getCartItems().subscribe({
  // Uses withCredentials: true
});
```

**Key Files:**
- `cart.ts` - Component logic
- `cart.html` - UI template
- `cart.css` - Styling

**Usage:**
```
Route: /cart
Protected: No (but requires items in cart)
```

---

### 2. **Checkout & Stripe Payment**

#### File: `src/app/components/checkout/`

**Features:**
- Secure payment form with Stripe Elements
- Order summary display
- Form validation
- Payment processing
- Error handling

**Architecture:**
```
┌─────────────────────┐
│   Checkout Page     │
├─────────────────────┤
│ • Order Summary     │
│ • Payment Form      │
│ • Stripe Card Elm   │
└─────────────────────┘
         ↓
  PaymentService
         ↓
  Backend API
         ↓
  Stripe Gateway
```

**Component Structure:**
```typescript
// checkout.ts
export class CheckoutComponent implements OnInit {
  cartItem: ICartItems;
  stripe: any;
  elements: any;
  cardElement: any;
  
  methods:
  - loadCart()
  - initializeStripe()
  - setupStripe()
  - processPayment()
  - confirmPaymentWithStripe()
  - completeBooking()
  - validateForm()
}
```

**Test Cards (Stripe):**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Exp: Any future date
- CVC: Any 3 digits

**Usage:**
```
Route: /checkout
Protected: Yes (canActivate: [authGuard])
Flow: Cart → Checkout → Payment → Confirmation
```

---

### 3. **Payment Service**

#### File: `src/app/services/payment.service.ts`

**API Endpoints:**
```
POST   /api/Payment/create-payment-intent
       → Creates Stripe PaymentIntent
       
POST   /api/Payment/confirm-payment
       → Confirms payment and creates booking
       
GET    /api/Payment/payment-status/:id
       → Checks payment status
       
POST   /api/Payment/refund
       → Processes refunds
```

**Implementation:**
```typescript
// Create payment intent
createPaymentIntent(request: PaymentRequest)

// Confirm payment after Stripe processes it
confirmPayment(request: ConfirmPaymentRequest)

// Get payment status
getPaymentStatus(paymentIntentId: string)

// Process refunds
refundPayment(paymentIntentId: string, amount?: number)
```

---

### 4. **Toast Notifications**

#### File: `src/app/services/toast-notification.service.ts`

**Features:**
- Non-blocking notifications
- Auto-dismiss after 4 seconds
- Manual dismiss button
- Stacked display
- Smooth animations

**Usage:**
```typescript
// Inject service
constructor(private toastService: ToastNotificationService) {}

// Show notifications
this.toastService.success('Booking confirmed!');
this.toastService.error('Payment failed');
this.toastService.info('Processing...');
this.toastService.warning('Please confirm');
```

**Styling:**
- Success: Green (#28a745)
- Error: Red (#dc3545)
- Info: Blue (#17a2b8)
- Warning: Orange (#ffc107)

---

### 5. **User Profile & Booking History**

#### File: `src/app/components/profile/`

**Features:**
- Personal information display
- Upcoming bookings tab
- Past bookings tab
- Receipt download
- Booking cancellation
- Status tracking

**Booking Categorization:**
```typescript
// Upcoming: Check-in date >= today && status !== 'Cancelled'
this.upcomingBookings = bookings.filter(booking => {
  const checkInDate = new Date(booking.checkInDate);
  return checkInDate >= today && booking.status !== 'Cancelled';
});

// Past: Check-out date < today || status === 'Cancelled'
this.pastBookings = bookings.filter(booking => {
  const checkOutDate = new Date(booking.checkOutDate);
  return checkOutDate < today || booking.status === 'Cancelled';
});
```

**Component Structure:**
```typescript
export class Profile implements OnInit {
  userProfile: any;
  bookings: IBookings[];
  upcomingBookings: IBookings[];
  pastBookings: IBookings[];
  activeTab: 'profile' | 'upcoming' | 'past';
  
  methods:
  - loadUserProfile()
  - loadBookingHistory()
  - categorizeBookings()
  - cancelBooking()
  - downloadReceipt()
  - getStatusBadgeClass()
}
```

**Usage:**
```
Route: /profile
Protected: Yes (canActivate: [authGuard])
Features:
  • View personal details
  • Filter bookings by status
  • Download receipts
  • Cancel bookings
```

---

### 6. **Updated Routes**

#### File: `src/app/app.routes.ts`

**New Routes Added:**
```typescript
{ path: 'checkout', component: CheckoutComponent, canActivate:[authGuard] }
{ path: 'profile', component: Profile, canActivate:[authGuard] }
```

**Protected Routes:**
- `/profile` - Requires authentication
- `/checkout` - Requires authentication
- `/bookings` - Requires authentication

---

## 🎯 Week 4 Features

### 7. **Health Check Service**

#### File: `src/app/services/health-check.service.ts`

**Features:**
- Periodic health checks (every 30 seconds)
- Backend connectivity monitoring
- Database health status
- Status caching

**API Endpoint:**
```
GET /health
Response:
{
  "status": "Healthy",
  "checks": {
    "Database": { "status": "Healthy" },
    "API": { "status": "Healthy" }
  },
  "totalDuration": "0ms",
  "timestamp": "2025-11-14T10:30:00Z"
}
```

**Implementation:**
```typescript
// Get current health status
getHealthStatus(): Observable<HealthCheckResponse>

// Start periodic checks
private startPeriodicHealthCheck(): void
  // Runs every 30 seconds

// Get last cached status
getLastHealthStatus(): HealthCheckResponse | null

// Check if system is healthy
isHealthy(): boolean
```

---

### 8. **Logging Service**

#### File: `src/app/services/logging.service.ts`

**Features:**
- Structured logging with levels
- Console styling (colored output)
- Log history (last 100 entries)
- Global error handler
- Unhandled rejection handler
- Log export functionality

**Log Levels:**
```
INFO    - General information
WARNING - Warning messages
ERROR   - Error conditions
DEBUG   - Debug information
```

**Usage:**
```typescript
constructor(private logging: LoggingService) {}

// Log messages
this.logging.info('User logged in', { userId: 123 });
this.logging.warning('Low memory', { available: '100MB' });
this.logging.error('Payment failed', { error: 'Declined' });
this.logging.debug('Processing request', { url: '/api/...' });

// Export logs
this.logging.downloadLogs(); // Downloads as JSON

// Get logs
const allLogs = this.logging.getLogs();
const errors = this.logging.getLogsByLevel('ERROR');

// Clear logs
this.logging.clearLogs();
```

**Log Entry Structure:**
```typescript
interface LogEntry {
  timestamp: string;      // ISO 8601 format
  level: string;          // INFO, WARNING, ERROR, DEBUG
  message: string;        // Log message
  details?: any;          // Additional context
}
```

---

### 9. **Health Status Indicator Component**

#### File: `src/app/components/health-indicator/`

**Features:**
- Real-time system status display
- Visual health indicator (green/red dot)
- Last check timestamp
- Pulsing animation when healthy
- Top-right corner placement

**Display States:**

**Healthy:**
- Green background
- "System Operational" text
- Pulsing green dot
- Shows last check time

**Unhealthy:**
- Red background
- "System Offline" text
- Static red dot
- Shows last check time

**Styling:**
```scss
.health-indicator {
  &.healthy {
    background-color: #d4edda;
    border-color: #28a745;
    color: #155724;
  }
  
  &.unhealthy {
    background-color: #f8d7da;
    border-color: #dc3545;
    color: #721c24;
  }
}
```

---

### 10. **Updated Interceptor with Logging**

#### File: `src/app/interceptors/auth-interceptor.service.ts`

**Enhanced Features:**
- Authorization header injection
- Request/response logging
- Error logging with details
- Performance monitoring

**Implementation:**
```typescript
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(UserAuth);
  const loggingService = inject(LoggingService);
  
  const token = authService.getToken();
  
  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    
    loggingService.debug('Adding Authorization header', { url: req.url });
    
    return next(cloned).pipe(
      tap(event => {
        if (event.type === 4) { // HttpResponse
          loggingService.debug('Request succeeded', { 
            url: req.url, 
            status: event.status 
          });
        }
      }),
      catchError(error => {
        loggingService.error('Request failed', { 
          url: req.url, 
          status: error.status 
        });
        return throwError(() => error);
      })
    );
  }
  
  return next(req);
};
```

---

### 11. **Enhanced Bookings Component**

#### File: `src/app/components/bookings/`

**New Features:**
- Filter by status (All, Confirmed, Pending, Cancelled)
- Booking details modal
- Receipt download
- Booking cancellation with confirmation
- Status badges with icons
- Loading states

**Filters:**
```typescript
setFilter(filter: 'all' | 'confirmed' | 'pending' | 'cancelled')
getFilteredBookings(): IBookings[]
```

**Actions:**
```typescript
viewBookingDetails(booking)     // Shows SweetAlert modal
cancelBooking(booking)          // Cancel with confirmation
downloadReceipt(booking)        // Download as text file
```

---

### 12. **UI Enhancements**

**Bootstrap Components Used:**
- Cards with hover effects
- Badges for status
- Buttons with icons
- Responsive grid layout
- Collapse/expand sections
- Modals (SweetAlert2)
- Toast notifications

**Icons (Bootstrap Icons):**
- Credit card: `bi-credit-card`
- Check circle: `bi-check-circle`
- Clock: `bi-clock`
- Download: `bi-download`
- Trash: `bi-trash`
- Eye: `bi-eye`
- Person: `bi-person-circle`
- Calendar: `bi-calendar-check`

---

## 📦 Installation & Setup

### Prerequisites
```bash
node >= 18.x
npm >= 9.x
Angular CLI >= 20.x
```

### Installation Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd Bookify-Hotel-Reservation-System-Frontend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
Update `src/environments/environment.development.ts`:
```typescript
export const environment = {
  baseUrl: 'https://localhost:44380'  // Your backend URL
};
```

4. **Stripe Setup**
Update Stripe key in `src/app/components/checkout/checkout.ts`:
```typescript
const stripeKey = 'pk_test_YOUR_PUBLISHABLE_KEY';
this.stripe = (window as any).Stripe(stripeKey);
```

5. **Start Development Server**
```bash
npm start
```

6. **Access Application**
```
http://localhost:4200
```

---

## 🏗️ Architecture

### Component Tree
```
App
├── Header
├── Health-Indicator
├── Router-Outlet
│   ├── Home
│   ├── Rooms
│   ├── Cart
│   ├── Checkout
│   ├── Profile
│   │   ├── Profile Info Tab
│   │   ├── Upcoming Bookings Tab
│   │   └── Past Bookings Tab
│   ├── Bookings
│   ├── Login
│   ├── Register
│   ├── Admin-Dashboard
│   └── Not-Found
└── Footer
```

### Service Architecture
```
Services/
├── auth-interceptor.ts
│   └── LoggingService
│   └── UserAuth
├── booking-rooms.ts
│   └── API calls for bookings
├── health-check.service.ts
│   └── Periodic health monitoring
├── logging.service.ts
│   └── Structured logging
├── payment.service.ts
│   └── Stripe integration
├── toast-notification.service.ts
│   └── UI notifications
└── user-auth.ts
    └── Authentication management
```

---

## 🔌 API Integration

### Booking APIs
```
GET    /api/Bookings/cart
GET    /api/Bookings/Bookings
POST   /api/Bookings/cart
POST   /api/Bookings/confirm
DELETE /api/Bookings/cart
```

### Payment APIs
```
POST   /api/Payment/create-payment-intent
POST   /api/Payment/confirm-payment
GET    /api/Payment/payment-status/{id}
POST   /api/Payment/refund
```

### Health APIs
```
GET    /health
```

### Request/Response Examples

**Add to Cart:**
```typescript
// Request
POST /api/Bookings/cart
{
  roomId: 1,
  checkInDate: "2025-12-01",
  checkOutDate: "2025-12-05",
  customerName: "John Doe",
  customerEmail: "john@example.com"
}

// Response
{
  message: "Room added to cart",
  roomId: 1,
  roomNumber: "101",
  roomTypeName: "Deluxe Room",
  pricePerNight: 150,
  checkInDate: "2025-12-01",
  checkOutDate: "2025-12-05",
  numberOfNights: 4,
  totalCost: 600
}
```

**Create Payment Intent:**
```typescript
// Request
POST /api/Payment/create-payment-intent
{
  amount: 60000,              // cents
  currency: "usd",
  description: "Hotel Room Booking - Room 101",
  bookingId: 1
}

// Response
{
  clientSecret: "pi_xxx_secret_yyy",
  paymentIntentId: "pi_xxx",
  status: "requires_payment_method"
}
```

**Health Check:**
```typescript
// Response
{
  status: "Healthy",
  checks: {
    "Database": {
      status: "Healthy",
      description: "Database is operational",
      duration: "50ms"
    }
  },
  totalDuration: "50ms",
  timestamp: "2025-11-14T10:30:00Z"
}
```

---

## 🔧 Component Guide

### Cart Component
**Location:** `src/app/components/cart/`
**Purpose:** Display shopping cart and booking summary
**Props:** None
**Methods:**
- `loadCart()` - Fetch cart from backend
- `proceedToCheckout()` - Navigate to payment
- `confirmBooking()` - Direct booking without payment
- `clearCart()` - Empty cart with confirmation
- `continueShopping()` - Return to room browsing

---

### Checkout Component
**Location:** `src/app/components/checkout/`
**Purpose:** Payment processing with Stripe
**Props:** None
**Methods:**
- `loadCart()` - Get order details
- `initializeStripe()` - Load Stripe.js
- `setupStripe()` - Configure Stripe elements
- `processPayment()` - Initiate payment
- `confirmPaymentWithStripe()` - Stripe confirmation
- `completeBooking()` - Create booking record

---

### Profile Component
**Location:** `src/app/components/profile/`
**Purpose:** User profile and booking history
**Props:** None
**Methods:**
- `loadUserProfile()` - Get user info
- `loadBookingHistory()` - Fetch all bookings
- `categorizeBookings()` - Filter upcoming/past
- `switchTab()` - Change active tab
- `viewBookingDetails()` - Show booking modal
- `cancelBooking()` - Cancel reservation
- `downloadReceipt()` - Export receipt

---

### Health Indicator Component
**Location:** `src/app/components/health-indicator/`
**Purpose:** Display system health status
**Props:** None
**Methods:**
- `checkHealth()` - Query health endpoint

---

### Bookings Component
**Location:** `src/app/components/bookings/`
**Purpose:** View all bookings with filtering
**Props:** None
**Methods:**
- `loadBookings()` - Fetch bookings
- `setFilter()` - Filter by status
- `getFilteredBookings()` - Apply filter
- `viewBookingDetails()` - Show modal
- `downloadReceipt()` - Export receipt
- `cancelBooking()` - Cancel reservation

---

## 🔐 Services Guide

### UserAuth Service
```typescript
// Save token to localStorage
saveToken(token: string): void

// Retrieve token
getToken(): string | null

// Save user data
saveUser(user: any): void

// Get user data
getUser(): any

// Check authentication
isAuthenticated(): boolean

// Check admin role
isAdmin(): boolean

// Logout
logout(): void
```

---

### BookingRooms Service
```typescript
// Get cart items
getCartItems(): Observable<ICartItems>

// Get all bookings
getAllBookings(): Observable<IBookings[]>

// Add to cart
addBookingCart(cartData: IAddRoom): Observable<any>

// Confirm booking
confirmBookingCart(): Observable<any>

// Clear cart
clearCart(): Observable<any>
```

---

### PaymentService
```typescript
// Create Stripe PaymentIntent
createPaymentIntent(request: PaymentRequest)

// Confirm payment
confirmPayment(request: ConfirmPaymentRequest)

// Get payment status
getPaymentStatus(paymentIntentId: string)

// Refund payment
refundPayment(paymentIntentId: string, amount?: number)
```

---

### ToastNotificationService
```typescript
// Show notification
show(notification: ToastNotification): void

// Success notification
success(message: string, duration?: number): void

// Error notification
error(message: string, duration?: number): void

// Info notification
info(message: string, duration?: number): void

// Warning notification
warning(message: string, duration?: number): void
```

---

### LoggingService
```typescript
// Log info
info(message: string, details?: any): void

// Log warning
warning(message: string, details?: any): void

// Log error
error(message: string, details?: any): void

// Log debug
debug(message: string, details?: any): void

// Get all logs
getLogs(): LogEntry[]

// Get logs by level
getLogsByLevel(level: string): LogEntry[]

// Export logs
exportLogs(): string

// Download logs as file
downloadLogs(): void

// Clear logs
clearLogs(): void
```

---

### HealthCheckService
```typescript
// Get current health status
getHealthStatus(): Observable<HealthCheckResponse>

// Get last cached status
getLastHealthStatus(): HealthCheckResponse | null

// Check if system is healthy
isHealthy(): boolean
```

---

## 🧪 Testing

### Running Tests
```bash
# Run unit tests
npm test

# Run with coverage
ng test --code-coverage

# Run e2e tests
ng e2e
```

### Test Coverage Targets
- Components: > 80%
- Services: > 90%
- Guards: > 85%

### Key Test Files
```
src/app/
├── components/
│   ├── cart/cart.spec.ts
│   ├── checkout/checkout.spec.ts
│   ├── profile/profile.spec.ts
│   └── bookings/bookings.spec.ts
├── services/
│   ├── payment.service.spec.ts
│   ├── health-check.service.spec.ts
│   └── logging.service.spec.ts
└── guards/
    └── auth-guard.spec.ts
```

---

## 📝 Models & Interfaces

### ICartItems
```typescript
interface ICartItems {
  message: string;
  roomId: number;
  roomNumber: string;
  roomTypeName: string;
  pricePerNight: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  totalCost: number;
}
```

### IBookings
```typescript
interface IBookings {
  id: number;
  roomId: number;
  userId: string;
  roomNumber: string;
  roomType: string;
  customerName: string;
  customerEmail: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  totalCost: number;
  status: string;
  createdAt: string;
  confirmedAt: string;
  cancelledAt: string;
  cancellationReason: string;
  refundAmount: number;
  cancellationFee: number;
  roomName: string;
  roomTypeName: string;
}
```

### PaymentRequest
```typescript
interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  bookingId?: number;
}
```

### HealthCheckResponse
```typescript
interface HealthCheckResponse {
  status: string;
  checks: {
    [key: string]: {
      status: string;
      description: string;
      duration: string;
    }
  };
  totalDuration: string;
  timestamp: string;
}
```

---

## 🚀 Deployment

### Build for Production
```bash
ng build --configuration production
```

### Output
```
dist/bookify/
├── index.html
├── main.js
├── styles.css
└── assets/
```

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Stripe keys updated (production keys)
- [ ] Backend URL updated
- [ ] Build succeeds without errors
- [ ] No console warnings
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] SSL/TLS enabled
- [ ] Health endpoint accessible
- [ ] All routes working

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 80
CMD ["npx", "http-server", "dist", "-p", "80"]
```

---

## 📚 Documentation Files

Generated documentation:
- `TESTING_GUIDE.md` - Comprehensive testing procedures
- `IMPLEMENTATION_SUMMARY.md` - Feature summary
- `API_DOCUMENTATION.md` - Backend API reference

---

## 🐛 Troubleshooting

### Common Issues

**1. Session not persisting**
- Ensure `withCredentials: true` in all HTTP requests
- Check backend CORS configuration
- Verify session cookies in DevTools

**2. Stripe payment fails**
- Use test card: `4242 4242 4242 4242`
- Verify Stripe key is correct
- Check browser console for errors
- Ensure backend processes Stripe webhooks

**3. Health indicator offline**
- Verify `/health` endpoint exists
- Check backend is running
- Review network tab for failed requests
- Check browser console for errors

**4. Toast notifications not showing**
- Verify `app-health-indicator` is in app.html
- Check CSS loaded correctly
- Verify DOM element created
- Check browser console

**5. Profile page empty**
- Ensure user is authenticated
- Verify booking data exists
- Check API response in network tab
- Review console for errors

---

## 📞 Support

For issues or questions:
1. Check the testing guide
2. Review browser console
3. Check network requests
4. Review component logs
5. Contact development team

---

## 📄 License

This project is part of the DEPI program and is proprietary.

---

## 👥 Contributors

- Frontend Development Team
- Project Manager: DEPI Program

---

**Last Updated:** November 14, 2025
**Version:** 1.0.0
**Status:** Production Ready ✅
