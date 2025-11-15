import { TestBed } from '@angular/core/testing';
import { BookingStateService } from './booking-state.service';
import { IBookings } from '../models/ibooking';

describe('BookingStateService', () => {
  let service: BookingStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get new booking', (done) => {
    const mockBooking: Partial<IBookings> = {
      id: 123,
      roomNumber: '101',
      roomTypeName: 'Deluxe Room',
      customerName: 'John Doe',
      status: 'Confirmed'
    };

    service.setNewBooking(mockBooking);
    service.getNewBooking$().subscribe((booking) => {
      expect(booking).toEqual(mockBooking);
      done();
    });
  });

  it('should clear new booking', (done) => {
    const mockBooking: Partial<IBookings> = {
      id: 456,
      roomNumber: '202',
      roomTypeName: 'Suite'
    };

    service.setNewBooking(mockBooking);
    service.clearNewBooking();
    service.getNewBooking$().subscribe((booking) => {
      expect(booking).toBeNull();
      done();
    });
  });

  it('should get new booking synchronously', () => {
    const mockBooking: Partial<IBookings> = {
      id: 789,
      roomNumber: '303'
    };

    service.setNewBooking(mockBooking);
    const booking = service.getNewBooking();
    expect(booking).toEqual(mockBooking);
  });

  it('should emit new booking through observable', (done) => {
    const mockBooking: Partial<IBookings> = {
      id: 999,
      roomNumber: '999'
    };

    let emissionCount = 0;
    service.getNewBooking$().subscribe((booking) => {
      emissionCount++;
      if (emissionCount === 2) {
        // First emission is null (initial), second is the new booking
        expect(booking).toEqual(mockBooking);
        done();
      }
    });

    service.setNewBooking(mockBooking);
  });
});
