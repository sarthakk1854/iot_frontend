import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
// import { Device } from '../../auth.service';
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api', // Base URL for Django backend
};
export interface Device {
  updated_at: string | number | Date;
  created_at: string | number | Date;
  id?: number;       
  name: string;
  type: string;
  user: number;  //  Ensure user ID is included
  status: string;
  last_reading?: any; // Optional, only if relevant
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 

  private apiUrl = 'http://127.0.0.1:8000/api'; // Django API URL
  private tokenKey = 'access_token'; // Key for storing token in localStorage
  private userKey = 'user_data'; // Store user data in localStorage

  private userSubject = new BehaviorSubject<any>(this.getStoredUser()); // Initialize with stored data
  user$ = this.userSubject.asObservable(); // Observable for real-time updates


  constructor(private http: HttpClient, private _router: Router) { }
  //register
  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register/`, data);
  }
  // login 
  login(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login/`, data).pipe(
      tap((response: any) => {
        // Save token to localStorage
        localStorage.setItem(this.tokenKey, response.token);
        this.fetchUserData();
      })
    );
  }
    // Fetch user details from API
    fetchUserData(): void {
      const token = localStorage.getItem(this.tokenKey);
      if (!token) return; // If no token, stop execution
  
      this.http.get<any>(`${this.apiUrl}/user/`, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe(
        (user) => {
          localStorage.setItem(this.userKey, JSON.stringify(user)); //  Store user data
          this.userSubject.next(user);  //  Update user state
        },
        (error) => console.error('Error fetching user:', error)
      );
    }
     // Retrieve stored user data
  private getStoredUser(): any {
    const storedUser = localStorage.getItem(this.userKey);
    return storedUser ? JSON.parse(storedUser) : null;
  }

  getUserData(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/`, {
      headers: this.getAuthHeaders(),
    });
  }
  
  // logout
  logout(): void {
    localStorage.removeItem(this.tokenKey); // Remove token from localStorage
    localStorage.removeItem(this.userKey); //  Remove user data
    this.userSubject.next(null);
    this._router.navigateByUrl('/login'); // Redirect to login page
  }

  // Get token from localStorage
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  // Add token to HTTP headers
  private getAuthHeaders(): any {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

   // Get devices for the logged-in user
  getDevices(): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.apiUrl}/devices/`, {
      headers: this.getAuthHeaders(),
    });
  }
  addDevice(device: Device): Observable<Device> {
    return this.http.post<Device>(`${this.apiUrl}/devices/`, device, {
      headers: this.getAuthHeaders(),
    });
  }
  updateDevice(deviceId: number, device: Device): Observable<Device> {
    return this.http.put<Device>(`${this.apiUrl}/devices/${deviceId}/`, device, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteDevice(deviceId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/devices/${deviceId}/`, {
      headers: this.getAuthHeaders(),
    });
  }

  getDeviceData(deviceId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/devices/${deviceId}/data/`,{
      headers: this.getAuthHeaders(),
    });
  }  
  toggleDeviceStatus(deviceId: number) {
    return this.http.post<any>(`${environment.apiUrl}/toggle-device-status/${deviceId}/`, {
      headers: this.getAuthHeaders(),
    });
  }
  getReportData(deviceName: string, dateRange: string): Observable<any[]> {
    // Use device_name and date_range to match Django API
    const params = { device_name: deviceName, date_range: dateRange };
    return this.http.get<any[]>(`${this.apiUrl}/reports/`, { params });
  }

}
