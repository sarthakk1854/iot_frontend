import { Component, OnInit,OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService,Device } from '../../auth.service';
import { Chart, registerables } from 'chart.js';
import { format , subDays, subWeeks, subMonths, isAfter} from 'date-fns';
import { switchMap } from 'rxjs/operators';
import { Subscription, interval } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true, // Mark this component as standalone
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit,OnDestroy {
  devices: Device[] = []; // List of devices
  selectedDeviceId: string = ''; // Selected device ID from dropdown
  deviceData: any[] = []; // Data for chart
  deviceChart: any; // Chart instance
  currentTime: string = '';
  dateRange: string = '';
  currentDate: string = '';
  timeRange: string = 'daily'; // Default to daily view
 
  private timerSubscription!: Subscription;
  private pollingSubscription!: Subscription;
  constructor(private authService: AuthService) {}
 

  ngOnInit(): void {
    this.fetchDevices(); // Fetch devices for the dropdown
    this.initializeChart(); // Initialize the chart
    this.loadDevices();
    this.timerSubscription = interval(5000).subscribe(() => {
      const now = new Date();
      this.currentDate = format(now, "MMMM d yyyy, h:mm:ss a");
    });
  }
  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe(); // Clean up subscription
    }
  }

  loadDevices(): void {
    this.authService.getDevices().subscribe(
      (data: Device[]) => {
        console.log('Fetched devices:', data); // Debugging
        this.devices = data;
      },
      (error: any) => {
        console.error('Error fetching devices:', error);
      }
    );
  }
  

  fetchDevices(): void {
    this.authService.getDevices().subscribe(
      (devices: Device[]) => {
        this.devices = devices.map(device => ({
          ...device,
          status: device.status || 'inactive' // Default to inactive if no status
        }));
        console.log('Devices fetched:', this.devices);
      },
      (error: any) => {
        console.error('Error fetching devices:', error);
      }
    );
  }
  

  fetchDeviceData(deviceId: string): void {
    this.authService.getDeviceData(+deviceId).subscribe(
      (response: any) => {
        console.log('API Response:', response); // Log the entire response
        const data = response.data || response; // Try accessing the array if nested under a key
        if (Array.isArray(data)) {
          this.deviceData = data; // Store data
          this.updateChart(data); // Update chart

            // Update device status dynamically
        const selectedDevice = this.devices.find(device => String(device.id) === deviceId);
        if (selectedDevice) {
          selectedDevice.status = response.status || 'inactive';
        }
        } else {
          console.error('Response is not an array:', response);
        }
      },
      (error: any) => {
        console.error('Error fetching device data:', error);
      }
    );
  }
  

  initializeChart(): void {
    setTimeout(() => {
      const ctx = document.getElementById('chartCanvas') as HTMLCanvasElement;
      if (ctx) {
        this.deviceChart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: [],
            datasets: [
              {
                label: 'Device Data',
                data: [],
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                fill: true,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                title: { display: true, text: 'Timestamp' },
              },
              y: {
                title: { display: true, text: 'Value' },
                beginAtZero: true,
              },
            },
          },
        });
      } else {
        console.error('Canvas element not found!');
      }
    });
  }
  startPolling(deviceId: string): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe(); // Unsubscribe from previous polling
    }
  
    this.pollingSubscription = interval(1000) // Poll every 1 seconds
      .pipe(switchMap(() => this.authService.getDeviceData(+deviceId)))
      .subscribe(
        (response: any) => {
          const newData = response.data || response;
          if (Array.isArray(newData)) {
            // Append new data and prevent duplicates
            newData.forEach((newEntry: any) => {
              const exists = this.deviceData.some((d: any) => d.timestamp === newEntry.timestamp);
              if (!exists) {
                this.deviceData.push(newEntry);
              }
            });
  
            // Update chart
            this.updateChart();
          }
        },
        (error) => console.error('Error polling device data:', error)
      );
  }


  updateChart(data?: any[]): void {
    if (this.deviceChart && Array.isArray(this.deviceData)) {
      let filteredData = this.filterDataByTimeRange();
      filteredData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  
      let timestamps: string[];
  
      if (this.timeRange === 'daily') {
        timestamps = filteredData.map((d: any) => format(new Date(d.timestamp), 'dd:MM:yy HH:mm:ss'));
      } else if (this.timeRange === 'weekly') {
        timestamps = filteredData.map((d: any) => format(new Date(d.timestamp), 'EEE')); // Display weekday name
      } else if (this.timeRange === 'monthly') {
        timestamps = filteredData.map((d: any) => format(new Date(d.timestamp), 'MMM')); // Display month name
      } else {
        timestamps = filteredData.map((d: any) => format(new Date(d.timestamp), 'dd:MM:yy HH:mm:ss'));
      }
  
      const values = filteredData.map((d: any) => d.value);
  
      // Clear existing data before updating
      this.deviceChart.data.labels = [];
      this.deviceChart.data.datasets[0].data = [];
  
      // Assign new values
      this.deviceChart.data.labels = timestamps;
      this.deviceChart.data.datasets[0].data = values;
  
      // Update chart
      this.deviceChart.update();
    }
  }
  
  
  filterDataByTimeRange(): any[] {
    const now = new Date();
    let startDate: Date;

    switch (this.timeRange) {
      case 'daily':
        startDate = subDays(now, 1);
        break;
      case 'weekly':
        startDate = subWeeks(now, 1);
        break;
      case 'monthly':
        startDate = subMonths(now, 1);
        break;
      default:
        return this.deviceData;
    }

    return this.deviceData.filter((d: any) => isAfter(new Date(d.timestamp), startDate));
  }
  
  onDeviceChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedDeviceId = selectElement.value;

    if (this.selectedDeviceId) {
      
      this.fetchDeviceData(this.selectedDeviceId); // Fetch data for selected device
      this.startPolling(this.selectedDeviceId); // Start polling for updates
    }
  }

  onTimeRangeChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.timeRange = selectElement.value;
    this.updateChart();
  }
}
function moment() {
  throw new Error('Function not implemented.');
}

