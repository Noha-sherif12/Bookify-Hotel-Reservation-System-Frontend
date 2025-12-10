export interface IAddRoom{
 roomId: number,
 checkInDate: string,
 checkOutDate: string,

}

export interface ICartItems{
  message: string
  roomId: number,
  roomNumber: string,
  roomTypeName: string,
  pricePerNight: number,
  checkInDate: string,
  checkOutDate: string,
  numberOfNights: number,
  totalCost: number,
  customerName: string,
  customerEmail: string
}
