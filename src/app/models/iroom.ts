export interface Room {
  id: number;
  roomNumber: string;
  roomTypeName: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  isAvailable: boolean;
}

export interface RoomSearchResponse {
  rooms: Room[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface AvailableRooms {
  id: number;
  roomNumber: string;
  roomTypeName: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  isAvailable: boolean;
}


export interface Roomtypes {
  id: number;
  name: string;
  description: string;
  pricePerNight: number;
  capacity: number;
  imageUrl: string;
}
