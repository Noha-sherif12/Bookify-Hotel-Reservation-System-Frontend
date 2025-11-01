export interface IBookingCart {

}

export interface IBookings {
  id: number,
  roomId: number,
  userId: string,
  roomNumber: string,
  roomType: string,
  customerName: string,
  customerEmail: string,
  checkInDate: string,
  checkOutDate: string,
  numberOfNights: number,
  totalCost: number,
  status: string,
  createdAt: string,
  confirmedAt: string,
  cancelledAt: string,
  cancellationReason: string,
  refundAmount: number,
  cancellationFee: number,
  roomName: string,
  roomTypeName: string

}
