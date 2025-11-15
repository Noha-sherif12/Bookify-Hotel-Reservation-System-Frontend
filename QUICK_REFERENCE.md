# 🚀 Quick Reference - Week 3 & 4 Features

## 📍 Feature Locations

### Week 3 Features

| Feature | Location | Route | Protected |
|---------|----------|-------|-----------|
| Shopping Cart | `cart/` | `/cart` | No |
| Checkout/Payment | `checkout/` | `/checkout` | ✅ Yes |
| Payment Service | `services/payment.service.ts` | - | - |
| Toast Notifications | `services/toast-notification.service.ts` | - | - |
| User Profile | `profile/` | `/profile` | ✅ Yes |
| Booking History | `profile/` | `/profile` | ✅ Yes |

### Week 4 Features

| Feature | Location | Status |
|---------|----------|--------|
| Health Check Service | `services/health-check.service.ts` | ✅ Active |
| Health Indicator | `health-indicator/` | ✅ Top-right corner |
| Logging Service | `services/logging.service.ts` | ✅ Global |
| Enhanced Auth Interceptor | `interceptors/auth-interceptor.service.ts` | ✅ Active |
| Enhanced Bookings | `bookings/` | ✅ Filtered view |

---

## 🔧 Common Tasks

### Add Item to Cart
```typescript
const cartData: IAddRoom = {
  roomId: 1,
  checkInDate: "2025-12-01",
  checkOutDate: "2025-12-05",
  customerName: "John Doe",
  customerEmail: "john@example.com"
};

this.bookingRooms.addBookingCart(cartData).subscribe(
  (res) => {
    this.toastService.success('Room added to cart!');
  }
);
```

### Process Payment
```typescript
// User navigates to checkout → Stripe form fills → Payment processes
// Flow: Cart → Checkout → Stripe → Backend → Booking Confirmed
```

### Display Toast Notification
```typescript
// Success
this.toastService.success('Operation completed!');

// Error
this.toastService.error('Something went wrong');

// Info
this.toastService.info('Processing your request');

// Warning
this.toastService.warning('Please confirm');
```

### Log Events
```typescript
// Info level
this.logging.info('User logged in', { userId: 123 });

// Error level
this.logging.error('Payment failed', { error: 'Card declined' });

// Debug level
this.logging.debug('Processing request', { url: '/api/...' });

// Export logs
this.logging.downloadLogs(); // Downloads as JSON
```

### Check Health Status
```typescript
this.healthCheck.getHealthStatus().subscribe(
  (response) => {
    console.log('System status:', response.status);
    console.log('Healthy:', this.healthCheck.isHealthy());
  }
);
```

---

## 🧪 Quick Testing

### Test Cart Session
1. Add room to cart
2. Refresh page (F5)
3. Cart should persist ✅

### Test Payment
1. Go to checkout
2. Fill form with:
   - Name: John Doe
   - Email: john@example.com
   - Phone: +1234567890
   - Card: 4242 4242 4242 4242
3. Exp: Any future date
4. CVC: 123
5. Click "Complete Payment" ✅

### Test Profile
1. Navigate to `/profile`
2. View personal details ✅
3. Click "Upcoming Bookings" tab ✅
4. Click "Download Receipt" ✅

### Test Health Indicator
1. Look for green indicator (top-right)
2. Verify "System Operational" text ✅
3. Wait 30+ seconds and see update ✅

### Test Logging
1. Open DevTools Console (F12)
2. Perform actions (login, book room)
3. See colored log messages ✅

---

## 📦 Dependencies Added

```json
{
  "@stripe/stripe-js": "^3.5.0",
  "@ngx-stripe/ngx-stripe": "^16.3.0",
  "toastr": "^2.1.4"
}
```

---

## 🗝️ Environment Setup

Update `src/environments/environment.development.ts`:
```typescript
export const environment = {
  baseUrl: 'https://localhost:44380'  // Backend URL
};
```

Update `src/app/components/checkout/checkout.ts`:
```typescript
const stripeKey = 'pk_test_YOUR_PUBLISHABLE_KEY';  // Stripe key
```

---

## 🚨 Error Handling

All errors are:
- Logged with details ✅
- Displayed as toast notifications ✅
- Tracked in console ✅
- Sent to monitoring (if configured) ✅

Example:
```typescript
.subscribe(
  (response) => { /* success */ },
  (error) => {
    this.logging.error('API call failed', error);
    this.toastService.error('Failed: ' + error.message);
  }
);
```

---

## 📱 Responsive Design

All components are mobile-friendly:
- ✅ Cart - Responsive layout
- ✅ Checkout - Vertical form
- ✅ Profile - Mobile optimized
- ✅ Bookings - Stacked cards
- ✅ Health Indicator - Compact display

---

## 🔐 Security

All requests include:
- ✅ JWT Authorization header
- ✅ Session cookies (withCredentials: true)
- ✅ HTTPS/SSL encryption
- ✅ CSRF protection (backend)
- ✅ XSS prevention

---

## 📊 Monitoring

### Real-time Status
- Health Indicator: Top-right corner
- Last Check: Timestamp shown
- System Status: Green/Red indicator
- Auto-updates: Every 30 seconds

### Logs
- View in DevTools Console
- Colors: Blue (INFO), Red (ERROR), Orange (WARNING)
- Export: Click menu → Download logs

---

## 🎯 API Quick Reference

| Operation | Method | Endpoint | Auth |
|-----------|--------|----------|------|
| Get cart | GET | `/api/Bookings/cart` | ✅ |
| Add to cart | POST | `/api/Bookings/cart` | ✅ |
| Clear cart | DELETE | `/api/Bookings/cart` | ✅ |
| Create payment | POST | `/api/Payment/create-payment-intent` | ✅ |
| Confirm payment | POST | `/api/Payment/confirm-payment` | ✅ |
| Get bookings | GET | `/api/Bookings/Bookings` | ✅ |
| Health check | GET | `/health` | - |

---

## 💡 Pro Tips

1. **Session Persistence:** All API calls use `withCredentials: true`
2. **Error Handling:** Always use toast notifications for user feedback
3. **Logging:** Use appropriate log levels (INFO, ERROR, DEBUG)
4. **Mobile:** Test on multiple screen sizes
5. **Performance:** Check Network tab in DevTools
6. **Debugging:** Use colored console logs
7. **Payment:** Use Stripe test cards for testing

---

## 🆘 Troubleshooting Quick Fixes

| Issue | Fix |
|-------|-----|
| Session lost on refresh | Check `withCredentials: true` |
| Toast not showing | Verify `app-health-indicator` in app.html |
| Health offline | Check backend `/health` endpoint |
| Payment fails | Use test card 4242 4242 4242 4242 |
| Logs not visible | Open DevTools Console (F12) |
| Cart empty | Check session cookies |

---

## 📚 Documentation Files

- **README.md** - Overview & quick start (this folder)
- **IMPLEMENTATION_GUIDE.md** - Detailed implementation
- **TESTING_GUIDE.md** - Complete test procedures
- **IMPLEMENTATION_SUMMARY.md** - Completion summary

---

## 🎓 Learning Path

**Beginner:**
1. Read README.md
2. Review IMPLEMENTATION_GUIDE.md
3. Explore component files

**Intermediate:**
1. Study service architecture
2. Review payment flow
3. Test all features

**Advanced:**
1. Modify components
2. Extend services
3. Add new features

---

## ✅ Deployment Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Environment configured
- [ ] Stripe keys set
- [ ] Backend URL correct
- [ ] Build succeeds (`ng build`)
- [ ] No console errors
- [ ] All features tested
- [ ] Documentation reviewed

---

## 🚀 Start Development

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Open browser
http://localhost:4200

# Run tests
npm test

# Build for production
ng build --configuration production
```

---

## 📞 Quick Help

**For Implementation:** See `IMPLEMENTATION_GUIDE.md`
**For Testing:** See `TESTING_GUIDE.md`
**For Issues:** Check browser console (F12)
**For Logs:** Open DevTools Console

---

**Last Updated:** November 14, 2025
**Version:** 1.0.0
