import { TestBed } from '@angular/core/testing';

import { RoomsService } from './room-service';

describe('RoomService', () => {
  let service: RoomsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
