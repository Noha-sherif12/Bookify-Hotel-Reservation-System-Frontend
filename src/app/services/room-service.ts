// room.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, RoomSearchResponse, AvailableRooms, Roomtypes } from '../models/iroom';
import { environment } from '../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class RoomsService {


  constructor(private httpClient: HttpClient) { }

  getAvailableRooms(from: string, to: string): Observable<AvailableRooms[]> {
     const params = new HttpParams()
      .set('CheckInDate', from)
      .set('CheckOutDate', to);

    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });
    return this.httpClient.get<AvailableRooms[]>(`${environment.baseUrl}/api/Rooms/available`,{
      params,
      headers,
      withCredentials: false
    })
  }

  getRoomsTypes(): Observable<Roomtypes[]> {
    return this.httpClient.get<Roomtypes[]>(`${environment.baseUrl}/api/Rooms/roomtypes`)
  }

  getAllRooms(): Observable<Room[]> {
    return this.httpClient.get<Room[]>(`${environment.baseUrl}/api/Rooms/search`);
  }

  searchRooms(from: string, to: string, roomTypeId: number): Observable<RoomSearchResponse> {
    const params = new HttpParams()
      .set('CheckInDate', from)
      .set('CheckOutDate', to)
      .set('roomTypeId', roomTypeId.toString());

    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    return this.httpClient.get<RoomSearchResponse>(`${environment.baseUrl}/api/Rooms/search`, {
      params,
      headers,
      withCredentials: false
    });
  }
}
