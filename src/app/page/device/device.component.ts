import { Component, OnInit } from '@angular/core';
import { AuthService, Device } from '../../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-device',
  imports: [CommonModule, FormsModule],
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css'],
})
export class DeviceComponent implements OnInit {
  devices: Device[] = [];
  deviceName: string = '';
  deviceType: string = '';
  deviceStatus: string = '';
  currentDeviceId: number | null | undefined = null;
  deviceId: any;
  http: any;
  constructor(private deviceService: AuthService) { }

  ngOnInit(): void {
    // Fetch devices on page load
    this.deviceService.getDevices().subscribe((data: Device[]) => {
      this.devices = data;
      console.log('Devices:', this.devices); // Log to ensure devices are being fetched
    });
  }

  addDevice() {
    const deviceData = {
      device_name: this.deviceName,
      device_type: this.deviceType,
      device_id: this.deviceId,  // Include other fields as necessary
    };
  
    this.http.post('http://127.0.0.1:8000/api/devices/', deviceData).subscribe(
      (      response: any) => {
        console.log('Device added successfully:', response);
      },
      (      error: { error: any; }) => {
        console.error('Error adding device:', error);
        // Log the error details to help with debugging
        console.log('Error details:', error.error);
      }
    );
  }

  // Add or Update device
  addOrUpdateDevice(): void {
    // Check if required fields are filled in
    if (!this.deviceName || !this.deviceType) {
      console.error('Please fill in all required fields.');
      return;
    }
    const storedUser = localStorage.getItem('user');
    let userIdNumber: number | null = null;
    if (storedUser) {
      const user = JSON.parse(storedUser);
      userIdNumber = user.id; // Extract the user ID
    }
  
    if (!userIdNumber) {
      console.error('User ID not found in localStorage.');
      return;
    }

    const newDevice: Device = {
      name: this.deviceName,
      type: this.deviceType,
      user: userIdNumber,
      status: 'Inactive',
      last_reading: null,
      created_at: '',
      updated_at: ''
    };

    if (this.currentDeviceId) {
      // If editing, update the device
      this.deviceService.updateDevice(this.currentDeviceId, newDevice).subscribe({
        next: (device: Device) => {
          this.getDevices();
          this.clearForm();
        },
        error: (err) => {
          console.error('Error updating device: ', err);
        },
      });
    } else {
      // If adding, send a POST request
      this.deviceService.addDevice(newDevice).subscribe({
        next: (device: Device) => {
          this.getDevices();
          this.clearForm();
        },
        error: (err) => {
          console.error('Error adding device: ', err);
        },
      });
    }
  }
  
  // Fetch devices from the server
  getDevices(): void {
    this.deviceService.getDevices().subscribe((data: Device[]) => {
      this.devices = data;
      console.log(this.devices);  // Log devices to verify
    });
  }

  // Clear form fields
  clearForm(): void {
    this.deviceName = '';
    this.deviceType = '';
    this.deviceStatus = '';
    this.currentDeviceId = null;
  }

  // Edit device
  editDevice(deviceId: number): void {
    const device = this.devices.find(d => d.id === deviceId);
    if (device) {
      this.deviceName = device.name;
      this.deviceType = device.type;
      this.deviceStatus = device.status;
      this.currentDeviceId = device.id;
    } else {
      console.error('Device not found:', deviceId);
    }
  }

  // Delete device
  deleteDevice(deviceId: number): void {
    this.deviceService.deleteDevice(deviceId).subscribe(() => {
      this.devices = this.devices.filter((device) => device.id !== deviceId);
    });
  }


  // activate and inactivate button 
  toggleState(device: Device): void {
    this.deviceService.toggleDeviceStatus(device.id!).subscribe({
      next: (response: any) => {
        device.status = response.device_status;  // Update device status from the backend response
        device.last_reading = response.last_reading;  // Optionally update last reading if provided
  
        // Log the new device status and last reading (if available)
        console.log('Device Status:', device.status);
        if (device.last_reading) {
          console.log('Last Reading:', device.last_reading);
        }
  
        // Fetch the latest device data after toggling the status
        this.getDeviceData(device.id!);  // Call getDeviceData to log the data in console
      },
      error: (err) => {
        console.error('Error toggling device status:', err);
      },
    });
  }
  getDeviceData(deviceId: number): void {
    this.deviceService.getDeviceData(deviceId).subscribe((data: any) => {
      console.log('Device Data:', data);  // Log the fetched data for testing
      // Optionally, you can set this data to a local variable and display it in the UI
      // Example: this.deviceData = data;
    }, error => {
      console.error('Error fetching device data:', error);
    });
  }
}


