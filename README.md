# 🏨 Bookify - Hotel Reservation System Frontend

## 📋 Overview

Bookify is a modern, responsive hotel reservation system built with Angular 20. It features complete booking management, Stripe payment integration, user profiles, health monitoring, and comprehensive logging.

**Version:** 1.0.0  
**Status:** Production Ready ✅  
**Last Updated:** November 14, 2025

---

## ✨ Features

### Week 3: Booking & Payment
- ✅ Shopping cart with session persistence
- ✅ Secure checkout process
- ✅ Stripe payment integration
- ✅ User profile management
- ✅ Booking history tracking
- ✅ Toast notifications

### Week 4: Polish & Monitoring
- ✅ Health check endpoint monitoring
- ✅ Structured logging system
- ✅ Real-time system status indicator
- ✅ Enhanced UI with Bootstrap
- ✅ Comprehensive error handling
- ✅ Performance monitoring

---

## 🚀 Quick Start

### Prerequisites
```bash
Node.js >= 18.x
npm >= 9.x
Angular CLI >= 20.x
```

### Installation

1. **Clone Repository**
```bash
git clone <repository-url>
cd Bookify-Hotel-Reservation-System-Frontend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
Update `src/environments/environment.development.ts`:
```typescript
export const environment = {
  baseUrl: 'https://localhost:44380'
};
```

4. **Start Development Server**
```bash
npm start
```

5. **Access Application**
```
http://localhost:4200
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Payment processing
│   │   ├── profile/           # User profile
│   │   ├── bookings/          # Booking management
│   │   ├── health-indicator/  # Health status
│   │   ├── header/
│   │   ├── footer/
│   │   └── ...
│   ├── services/
│   │   ├── payment.service.ts           # Stripe integration
│   │   ├── booking-rooms.ts             # Booking API
│   │   ├── health-check.service.ts      # Health monitoring
│   │   ├── logging.service.ts           # Structured logging
│   │   ├── toast-notification.service.ts # Notifications
│   │   └── ...
│   ├── models/
│   │   ├── ibooking.ts
│   │   ├── icart.ts
│   │   └── ...
│   ├── guards/
│   │   └── auth-guard.ts
│   ├── interceptors/
│   │   ├── auth-interceptor.service.ts
│   │   └── session-interceptor.service.ts
│   └── ...
├── environments/
├── assets/
└── styles.css
```

---

## 🔌 API Integration

### Core Endpoints

**Bookings:**
```
GET    /api/Bookings/cart                    # Get cart
POST   /api/Bookings/cart                    # Add to cart
DELETE /api/Bookings/cart                    # Clear cart
GET    /api/Bookings/Bookings                # Get all bookings
POST   /api/Bookings/confirm                 # Confirm booking
```

**Payments:**
```
POST   /api/Payment/create-payment-intent    # Create Stripe intent
POST   /api/Payment/confirm-payment          # Confirm payment
GET    /api/Payment/payment-status/{id}      # Check status
POST   /api/Payment/refund                   # Process refund
```

**Health:**
```
GET    /health                               # Health check
```

---

## 🛠️ Development

### Development server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app reloads automatically on file changes.

### Building

```bash
ng build
```

Artifacts stored in `dist/` directory.

### Running tests

```bash
npm test
```

### Running end-to-end tests

```bash
ng e2e
```

---

## 📚 Documentation

- **Full Implementation Guide:** `IMPLEMENTATION_GUIDE.md`
- **Testing Guide:** `TESTING_GUIDE.md`
- **API Reference:** Backend documentation

---

## 🔑 Key Features

### Cart & Checkout
- Session persistence
- Secure Stripe integration
- Form validation
- Order summary
- Payment processing

### Profile Management
- User details display
- Upcoming bookings
- Past bookings
- Receipt download
- Booking cancellation

### Monitoring
- Health status indicator
- Real-time system monitoring
- Structured logging
- Error tracking

### UI/UX
- Bootstrap 5 responsive design
- Toast notifications
- SweetAlert modals
- Smooth animations
- Mobile friendly

---

## 📞 Support

For issues or questions, check:
1. IMPLEMENTATION_GUIDE.md
2. TESTING_GUIDE.md
3. Browser console logs
4. Network requests (DevTools)

---

## 📄 License

Proprietary - DEPI Program

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** November 14, 2025

