import { TestBed } from '@angular/core/testing';

import { BookingRooms } from './booking-rooms';

describe('BookingRooms', () => {
  let service: BookingRooms;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BookingRooms);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
