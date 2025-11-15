# Week 3 & 4 Implementation - Frontend Testing Guide

## Overview
This document provides comprehensive testing instructions for the Week 3 & Week 4 implementations including Booking Confirmation, Stripe Integration, Profile Management, Health Checks, and Logging.

---

## Week 3: Booking Confirmation & Stripe Integration

### 1. Cart Management & Session Handling
**Test Case 1.1: Add Room to Cart**
- [ ] Navigate to Home page
- [ ] Search for available rooms (select dates and room type)
- [ ] Click "Add to Cart" button
- [ ] Verify session persistence:
  - Open browser DevTools (F12)
  - Check Application > Cookies for session cookie
  - Navigate away and back to confirm session maintained
- [ ] Verify cart displays the added room with correct details:
  - Room number
  - Room type
  - Check-in/Check-out dates
  - Number of nights
  - Total cost calculation

**Test Case 1.2: Cart Persistence**
- [ ] Add room to cart
- [ ] Refresh page - room should still be in cart
- [ ] Close browser and reopen - cart should restore from session
- [ ] Navigate to different pages and return - cart should persist

### 2. Checkout & Payment UI

**Test Case 2.1: Navigate to Checkout**
- [ ] Add room to cart
- [ ] Click "Proceed to Checkout" button
- [ ] Verify redirection to `/checkout` route
- [ ] Verify user is authenticated (if not logged in, should redirect to login)
- [ ] Verify order summary displays:
  - Room details
  - Check-in/Check-out dates
  - Pricing breakdown
  - Total amount

**Test Case 2.2: Checkout Form Validation**
- [ ] Attempt to submit form with empty fields
- [ ] Verify error messages appear for:
  - Full Name
  - Email
  - Phone Number
  - Cardholder Name
- [ ] Verify form can be filled with valid data
- [ ] Test email validation (invalid email should show error)
- [ ] Test phone validation

**Test Case 2.3: Stripe Card Element**
- [ ] Verify Stripe card element loads without errors
- [ ] Test with valid test card: `4242 4242 4242 4242`
- [ ] Test with invalid card: `4000 0000 0000 0002`
- [ ] Verify card errors display correctly
- [ ] Test card expiry validation
- [ ] Test CVC validation

**Test Case 2.4: Payment Processing**
- [ ] Fill all form fields with valid data
- [ ] Use test card: `4242 4242 4242 4242` (exp: 12/25, CVC: 123)
- [ ] Click "Complete Payment" button
- [ ] Verify payment processing indicator shows
- [ ] Verify successful payment message appears
- [ ] Verify redirection to bookings page
- [ ] Check browser DevTools Network tab for successful API call

### 3. Toast Notifications

**Test Case 3.1: Notification Display**
- [ ] Trigger success notification (e.g., when item added to cart)
- [ ] Verify toast appears in top-right corner
- [ ] Verify correct message text
- [ ] Verify auto-dismiss after 4 seconds
- [ ] Test error notification (same process, different styling)
- [ ] Test info and warning notifications
- [ ] Verify close button works

**Test Case 3.2: Multiple Notifications**
- [ ] Trigger multiple notifications quickly
- [ ] Verify all display stacked without overlap
- [ ] Verify each dismisses independently
- [ ] Check CSS animations are smooth

---

## Week 3: User Profiles & Booking History

### 4. Profile Page

**Test Case 4.1: Profile Information**
- [ ] Navigate to `/profile`
- [ ] Verify user is authenticated (redirect to login if not)
- [ ] Verify profile tab displays:
  - Full name
  - Email address
  - Phone number (if available)
  - Member since date
  - Account roles/type
- [ ] Test that profile info matches logged-in user

**Test Case 4.2: Upcoming Bookings Tab**
- [ ] Click "Upcoming Bookings" tab
- [ ] Verify only future bookings display
- [ ] For each booking, verify:
  - Booking ID
  - Room number
  - Room type
  - Guest name
  - Check-in date
  - Check-out date
  - Total cost
  - Status badge (green for Confirmed)
  - Action buttons

**Test Case 4.3: Past Bookings Tab**
- [ ] Click "Past Bookings" tab
- [ ] Verify only past bookings display (checkout date has passed)
- [ ] Verify bookings sorted by check-out date (newest first)
- [ ] Test receipt download functionality:
  - Click "Receipt" button
  - Verify file downloads as `Receipt-[ID].txt`
  - Open file and verify correct booking information

**Test Case 4.4: Booking Actions**
- [ ] Upcoming booking: Click "Cancel" button
  - Verify confirmation dialog appears
  - Confirm cancellation
  - Verify toast notification
  - Verify booking status updates
- [ ] Past booking: "Cancel" button should not appear
- [ ] Both tabs: Click "View Details" button
  - Verify SweetAlert dialog opens
  - Verify all booking details displayed
  - Verify status badge displayed correctly

**Test Case 4.5: Tab Switching**
- [ ] Switch between Profile/Upcoming/Past tabs
- [ ] Verify smooth tab transitions with animations
- [ ] Verify tab badges show correct counts
- [ ] Verify correct content displays for each tab

---

## Week 4: Health Checks & Logging

### 5. Health Status Indicator

**Test Case 5.1: Health Indicator Display**
- [ ] Health indicator should display in top-right of page
- [ ] When healthy, verify:
  - Green background color
  - "System Operational" text
  - Pulsing green dot animation
  - "Last check: [timestamp]"
- [ ] Check browser console for health check logs

**Test Case 5.2: Health Check Failure**
- [ ] Simulate backend unavailable by disconnecting network
- [ ] Verify health indicator changes to red
- [ ] Verify "System Offline" text displays
- [ ] No pulsing animation in offline mode
- [ ] Reconnect network and verify status updates

**Test Case 5.3: Periodic Health Checks**
- [ ] Wait 30+ seconds and observe health check updates
- [ ] Verify timestamp updates in indicator
- [ ] Check browser console for periodic health check calls

### 6. Logging Service

**Test Case 6.1: Console Logging**
- [ ] Open browser DevTools Console
- [ ] Perform various actions:
  - Add room to cart
  - Navigate to profile
  - Trigger errors
- [ ] Verify colored log messages appear:
  - Blue for INFO
  - Orange for WARNING
  - Red for ERROR
  - Gray for DEBUG

**Test Case 6.2: Log Levels**
- [ ] Check console for different log types:
  - Info: "Application started"
  - Debug: "Adding Authorization header to request"
  - Error: Network errors and failures
  - Warning: Deprecated features

**Test Case 6.3: Error Handling**
- [ ] Intentionally trigger network errors
- [ ] Verify error logs appear in console with:
  - Timestamp
  - Error message
  - Request details (if applicable)
- [ ] Verify error toast notifications appear to user

---

## Integration Testing

### 7. End-to-End Booking Flow

**Test Case 7.1: Complete Booking Journey**
- [ ] Start at Home page
- [ ] Search and select room
- [ ] Add to cart (verify session saved)
- [ ] Navigate to cart
- [ ] Click "Proceed to Checkout"
- [ ] Fill checkout form
- [ ] Process payment with Stripe test card
- [ ] Verify booking confirmation
- [ ] Navigate to Profile > Upcoming Bookings
- [ ] Verify new booking appears
- [ ] Download receipt
- [ ] Verify booking appears in bookings page
- [ ] Test cancellation (if applicable)

### 8. Error Scenarios

**Test Case 8.1: Network Error Handling**
- [ ] Disable network and try operations
- [ ] Verify error toasts appear
- [ ] Verify graceful fallback UI
- [ ] Verify error logs in console

**Test Case 8.2: Form Validation Errors**
- [ ] Submit checkout form with invalid email
- [ ] Submit with invalid phone
- [ ] Submit with empty fields
- [ ] Verify inline error messages
- [ ] Verify error toast notifications

**Test Case 8.3: Authentication Errors**
- [ ] Try accessing profile without login
- [ ] Try accessing checkout without login
- [ ] Verify redirect to login
- [ ] Login and retry
- [ ] Verify access granted

---

## Performance Testing

### 9. Performance Checks

**Test Case 9.1: Page Load Times**
- [ ] Using DevTools Performance tab:
  - Home page: Should load < 3 seconds
  - Profile page: Should load < 2 seconds
  - Checkout page: Should load < 2 seconds

**Test Case 9.2: API Response Times**
- [ ] Using DevTools Network tab:
  - Cart API: Should respond < 500ms
  - Checkout payment: Should respond < 1000ms
  - Health check: Should respond < 200ms

### 10. Browser Compatibility

**Test Case 10.1: Cross-Browser Testing**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

Verify all features work consistently across browsers:
- Stripe card element
- Toast notifications
- Health indicator
- Profile tabs
- Payment processing

---

## Security Testing

### 11. Security Checks

**Test Case 11.1: Authentication**
- [ ] Verify JWT token in Authorization header
- [ ] Verify session cookie in network requests
- [ ] Verify token persists across page reloads
- [ ] Verify logout clears token

**Test Case 11.2: Payment Security**
- [ ] Verify payment form uses HTTPS
- [ ] Verify card details not logged in console
- [ ] Verify no sensitive data in local storage
- [ ] Verify Stripe script loaded from official CDN

**Test Case 11.3: Data Protection**
- [ ] Verify personal data visible only to authenticated users
- [ ] Verify logout prevents profile access
- [ ] Verify bookings belong to correct user
- [ ] Verify receipts contain correct user information

---

## Testing Checklist

### Pre-Launch Verification
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] No console errors or warnings
- [ ] No network request failures
- [ ] Performance meets requirements
- [ ] Security vulnerabilities checked
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsive design tested
- [ ] Accessibility guidelines followed (WCAG 2.1)
- [ ] Documentation complete

### Success Criteria
✅ All test cases pass
✅ No critical bugs remaining
✅ Performance acceptable
✅ User experience smooth
✅ Security requirements met
✅ Code properly documented
✅ Team sign-off received

---

## Troubleshooting Guide

### Issue: Payment fails with "card_error"
**Solution:** Check if using valid test card `4242 4242 4242 4242`

### Issue: Session not persisting
**Solution:** Verify `withCredentials: true` in all API calls

### Issue: Health indicator offline
**Solution:** Check backend `/health` endpoint is accessible

### Issue: Profile page shows no bookings
**Solution:** Verify user has completed bookings or create test booking

### Issue: Toast notifications not showing
**Solution:** Check if `app-health-indicator` component is rendering in app.html

---

## Sign-Off

- **QA Lead:** ___________________
- **Date:** ___________________
- **All Tests Passed:** [ ] Yes [ ] No
- **Issues Reported:** ___________
