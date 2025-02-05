import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-navbar',
  imports: [FormsModule,CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  username: string = '';
  isLoginPage: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Check if the current route is login page
    this.router.events.subscribe(() => {
      this.isLoginPage = this.router.url === '/login';
    });

    

    // Subscribe to user$ to update username dynamically
    this.authService.user$.subscribe((user) => {
      if (user && user.username) {
        this.username = user.username;
      }
    });

    // Fetch user data when component loads
    this.authService.fetchUserData();
  }
}
