export interface IBookingCart {

}

export interface IBookings {
id: number;
  roomNumber: string;
  roomTypeName: string;
  customerName: string;
  customerEmail: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  totalCost: number;
  status: string;
  createdAt: string;

}
