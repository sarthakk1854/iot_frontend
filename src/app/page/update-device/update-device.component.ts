// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router, RouterLink } from '@angular/router';
// import { AuthService, Device } from '../../auth.service';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-update-device',
//   imports : [CommonModule, FormsModule, RouterLink],
//   templateUrl: './update-device.component.html',
//   styleUrls: ['./update-device.component.css'],
// })
// export class UpdateDeviceComponent implements OnInit {
//   deviceId!: number;
//   device: Device = { id: 0, name: '', type: '', status: '' };  // Initialize device object

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private authService: AuthService
//   ) {}

//   ngOnInit(): void {
//     this.deviceId = Number(this.route.snapshot.paramMap.get('id'));

//     this.authService.getDeviceById(this.deviceId).subscribe({
//       next: (data) => {
//         this.device = { ...data }; // Properly assign the fetched data
//       },
//       error: (err) => {
//         console.error('Error fetching device:', err);
//       },
//     });
//   }

//   updateDevice(): void {
//     this.authService.updateDevice(this.deviceId, this.device).subscribe({
//       next: (updatedDevice) => {
//         console.log('Device updated successfully:', updatedDevice);
//         this.router.navigate(['/device']);  // Redirect after update
//       },
//       error: (err) => {
//         console.error('Error updating device:', err);
//       },
//     });
//   }
// }
