import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserAuth } from '../../services/user-auth';
import { ToastNotificationService } from '../../services/toast-notification.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  userProfile: any = null;
  isLoading: boolean = false;

  constructor(
    private userAuth: UserAuth,
    private toastService: ToastNotificationService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.userProfile = this.userAuth.getUser();
      console.log('User Profile:', this.userProfile);
      this.isLoading = false;
    }, 500);
  }

  
}