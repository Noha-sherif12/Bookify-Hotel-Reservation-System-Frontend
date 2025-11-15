# Bookify Frontend - AI Agent Instructions

## 🎯 Project Overview

**Bookify** is a hotel reservation system built with **Angular 20** featuring booking management, Stripe payment integration, health monitoring, and structured logging. This is a standalone frontend connecting to a C# backend at `https://localhost:44380`.

**Key Tech Stack:** Angular 20, Bootstrap 5, Stripe.js, RxJS, TypeScript 5.9

---

## 🏗️ Critical Architecture Patterns

### Session-Based Communication
All HTTP requests use `withCredentials: true` to preserve backend sessions. This is **essential** for cart persistence and user state:

```typescript
// In all services: booking-rooms.ts, payment.service.ts, health-check.service.ts
this.httpClient.get(url, { withCredentials: true })
```

**Why:** Backend uses session cookies; without this flag, cart and auth state are lost on refresh.

### Authentication Flow
- **Guard:** `authGuard` (function-based) redirects to `/login` if not authenticated
- **Token Storage:** JWT stored in `localStorage` with keys `auth_token` and `user_data`
- **Service:** `UserAuth` manages token lifecycle (save, get, logout)
- **Interceptor:** `authInterceptor` injects `Authorization: Bearer {token}` header + logs all requests

Protected routes: `/profile`, `/checkout`, `/bookings`, `/admin/dashboard`

### Service Architecture
- **Booking APIs:** `BookingRooms` service calls `/api/Bookings/*` endpoints
- **Payment:** `PaymentService` integrates Stripe, creates payment intents, confirms payments
- **Health Monitoring:** `HealthCheckService` polls `/health` every 30 seconds (stores last status)
- **Notifications:** `ToastNotificationService` displays auto-dismissing toast messages (4 sec default)
- **Logging:** `LoggingService` logs to console with colors, stores last 100 entries in memory

### Component Patterns
- **Standalone components** (Angular 20 style, no NgModules)
- **OnInit injection pattern:** Constructor uses dependency injection, ngOnInit loads data
- **Error handling:** Always subscribe with `.subscribe({ next, error })` syntax
- **Loading states:** Use `isLoading` boolean to disable buttons during API calls
- **User feedback:** Always show toast notifications for success/error, use SweetAlert2 for confirmations

---

## 🔑 Key Data Models

### Cart (ICartItems)
```typescript
interface ICartItems {
  message: string;
  roomId: number;
  roomNumber: string;
  roomTypeName: string;
  pricePerNight: number;
  checkInDate: string;        // ISO date string
  checkOutDate: string;
  numberOfNights: number;
  totalCost: number;
  customerName: string;
  customerEmail: string;
}
```

### Bookings (IBookings)
Includes status (`Confirmed`, `Pending`, `Cancelled`), timestamps, amounts, and reason for cancellations.

### Add to Cart (IAddRoom)
Minimal payload: `roomId`, `checkInDate`, `checkOutDate`, `customerName`, `customerEmail`

---

## 🛠️ Common Development Tasks

### Add Feature to Protected Route
1. Create component in `src/app/components/`
2. Add route in `app.routes.ts` with `canActivate: [authGuard]`
3. Import component in route definition
4. Inject required services in constructor

### Handle API Errors
```typescript
// Always follow this pattern:
this.service.getData().subscribe({
  next: (data) => {
    this.loggingService.info('Success', { data });
    this.toastService.success('Operation completed');
  },
  error: (err) => {
    this.loggingService.error('API failed', { status: err.status, message: err.message });
    this.toastService.error(`Error: ${err.message}`);
  }
});
```

### Modify Stripe Integration
- Stripe publishable key: hardcoded in `checkout.ts` (TODO: move to environment)
- Test card: `4242 4242 4242 4242`
- Always use `createPaymentIntent` before `confirmPayment`

### Add Toast Notification
```typescript
this.toastService.success('Message');   // Green, 4 sec
this.toastService.error('Message');     // Red
this.toastService.info('Message');      // Blue
this.toastService.warning('Message');   // Orange
```

### Export Logs
```typescript
const logs = this.loggingService.getLogs();           // Get all 100 logs
const errors = this.loggingService.getLogsByLevel('ERROR');
this.loggingService.downloadLogs();                   // Auto-download JSON
```

---

## 📁 Essential File Locations

| Purpose | Path |
|---------|------|
| Routes definition | `src/app/app.routes.ts` |
| Auth guard | `src/app/guards/auth-guard.ts` |
| Auth interceptor | `src/app/interceptors/auth-interceptor.service.ts` |
| Cart API calls | `src/app/services/booking-rooms.ts` |
| Payment integration | `src/app/services/payment.service.ts` |
| Notifications | `src/app/services/toast-notification.service.ts` |
| Logging & monitoring | `src/app/services/logging.service.ts` |
| Health checks | `src/app/services/health-check.service.ts` |
| Auth state management | `src/app/services/user-auth.ts` |
| Main app config | `src/app/app.config.ts` |
| Environment setup | `src/environments/environment.development.ts` |

---

## ⚙️ Build & Runtime Commands

```bash
npm start                              # Dev server (http://localhost:4200)
npm test                               # Run Jasmine tests
npm run build                          # Production build
ng serve --open                        # Dev server + open browser
ng test --code-coverage                # Tests with coverage report
```

**No special build configuration needed** - Angular CLI handles everything.

---

## 🔍 Debugging Patterns

### Session/Cart Issues
- Open DevTools → Application tab → Cookies
- Verify `withCredentials: true` on all booking API calls
- Check Network tab for 401/403 responses (auth failures)

### Payment Failures
- Check Stripe logs in browser console for error details
- Verify Stripe key is correct in checkout.ts
- Ensure `/health` endpoint is up (blocks payment in some cases)

### Missing Notifications
- Verify `HealthIndicatorComponent` is imported in `app.ts`
- Check CSS is loaded (Bootstrap 5 + custom styles)
- Look for JavaScript errors in console (F12)

### Logging Issues
- Logs only show in browser console (DevTools → Console tab)
- Use `LoggingService` methods, not `console.log()` directly
- Last 100 logs kept in memory; call `downloadLogs()` to export

---

## 🧪 Testing Approach

**All components have `.spec.ts` files** using Jasmine/Karma. Key patterns:

- Mock services with `jasmine.createSpyObj()`
- Test observable subscriptions with `.pipe()` and `CompleteAsync()`
- Always clean up subscriptions in `afterEach()`

**Test coverage targets:** Components >80%, Services >90%, Guards >85%

---

## 🚀 Deployment Notes

1. **Environment Variables:** Update `environment.ts` (production) with real backend URL and Stripe live keys
2. **Build Command:** `ng build --configuration production`
3. **Output:** `dist/bookify/` folder (static files only)
4. **CORS:** Backend must have `Access-Control-Allow-Credentials: true`
5. **SSL:** Ensure backend is HTTPS (matches `baseUrl` in environment)

---

## 📊 Project-Specific Conventions

### Console Styling
```typescript
// Use emoji prefixes for quick scanning:
console.log('✅ Success');    // Green checkmark
console.log('❌ Error');      // Red X
console.log('🔧 Debug');      // Wrench
console.log('⚠️  Warning');   // Warning sign
console.log('💾 Storage');    // Save operation
```

### Error Messages
Always include context: `"API failed: 404 Not Found at /api/Bookings/cart"`

### Observable Naming
- `$` suffix for observables: `healthStatus$`, `bookings$`
- Unsubscribe pattern: `.unsubscribe()` in `ngOnDestroy()`

---

## ⚠️ Common Pitfalls

1. **Forgetting `withCredentials: true`** → Cart won't persist
2. **Not checking `isAuthenticated()` in guards** → Redirect loops
3. **Missing `.subscribe()` on observables** → API call never fires
4. **Hard-coding URLs** → Use `environment.baseUrl` instead
5. **Not handling errors in subscriptions** → Silent failures
6. **Using `console.log()` instead of `LoggingService`** → Inconsistent logging
7. **Modifying cart without API call** → State goes out of sync

---

## 🔗 External Dependencies

- **Stripe.js:** Loaded dynamically in checkout component; publish key in environment
- **Bootstrap 5:** Classes like `card`, `btn`, `badge`; imported globally in styles.css
- **SweetAlert2:** Used for modals (cancel booking, confirmations)
- **Toastr (2.1.4):** Underlying notification library

---

## 📚 Documentation Files

- **README.md** → Quick start & feature overview
- **IMPLEMENTATION_GUIDE.md** → Detailed architecture & API docs
- **QUICK_REFERENCE.md** → Common tasks & troubleshooting
- **TESTING_GUIDE.md** → Test procedures & coverage

---

## 💡 Tips for Productivity

1. **Run dev server first:** `npm start` watches file changes automatically
2. **Use Angular DevTools extension** for component tree inspection
3. **Check Network tab** before debugging subscriptions (see actual API calls)
4. **Disable cache** in DevTools → simulates fresh loads
5. **Use `console.time()` / `console.timeEnd()`** for performance tracking
6. **Export logs before closing browser:** Data lost on page reload

---

**Last Updated:** November 14, 2025 | **Version:** 1.0.0 | **Status:** Production Ready ✅
