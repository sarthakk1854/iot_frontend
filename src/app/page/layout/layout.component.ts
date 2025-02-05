import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "../../navbar/navbar.component";

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterOutlet, RouterLinkActive, CommonModule, NavbarComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  activeForm: 'login' | 'register' = 'register';
  loggedUser: { firstName: string; lastName: string } | null = null;
  isSidebarActive: boolean = false;

  constructor(private authService: AuthService, private snackBar: MatSnackBar, private router: Router) {}

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (userData) {
      this.loggedUser = JSON.parse(userData); // Ensure only the current user is stored
    }
  }
  
  // ngOnInit() {
  //   const userData = localStorage.getItem('user'); // Fetch stored user details
  //   if (userData) {
  //     this.loggedUser = JSON.parse(userData);
  //   }
  // }

  toggleSidebar() {
    this.isSidebarActive = !this.isSidebarActive;
  }
  logoutUser() {
    this.authService.logout();
    localStorage.removeItem('access_token'); // Clear token
    localStorage.removeItem('user'); // Clear user info
    this.snackBar.open('Logged out successfully!', 'Close', { duration: 3000 });
    this.router.navigateByUrl('/login');
  }
  
  // logoutUser() {
  //   this.authService.logout();
  //   this.snackBar.open('Logged out successfully!', 'Close', { duration: 3000 });
  //   this.router.navigateByUrl('/login');
  // }
}
