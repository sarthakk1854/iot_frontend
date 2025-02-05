import { Component } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';


@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule , FormsModule , HttpClientModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  step: number = 1; // Current step: 1 (Email), 2 (OTP), 3 (Reset Password)
  email: string = '';
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  constructor(private http: HttpClient, private router: Router) {}

  sendOtp() {
    this.http.post('http://127.0.0.1:8000/api/send-otp/', { email: this.email }).subscribe(
      (response: any) => {
        alert(response.message);
        this.step = 2;
      },
      (error) => {
        alert(error.error.error || 'Failed to send OTP');
      }
    );
  }

  verifyOtp() {
    this.http.post('http://127.0.0.1:8000/api/verify-otp/', { email: this.email, otp: this.otp }).subscribe(
      (response: any) => {
        alert(response.message);
        this.step = 3;
      },
      (error) => {
        alert(error.error.error || 'Invalid OTP');
      }
    );
  }

  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    this.http.post('http://127.0.0.1:8000/api/reset-password/', {
      email: this.email,
      new_password: this.newPassword,
      confirm_password: this.confirmPassword
    }).subscribe(
      (response: any) => {
        alert(response.message);
        this.router.navigate(['/login']);
      },
      (error) => {
        alert(error.error.error || 'Password reset failed');
      }
    );
  }
}