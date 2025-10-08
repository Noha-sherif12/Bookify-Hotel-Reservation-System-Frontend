import { Component } from '@angular/core';
import { ILogin } from '../../models/iusers';
import { UserRegister } from '../../services/user-register';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})

export class Login {
  loginUser: ILogin = {
    email: '',
    password: '',
  };

  constructor(
    private apiRegister: UserRegister,
    private router: Router
  ) {}

  onLogin(form: NgForm) {
    this.apiRegister.login(this.loginUser).subscribe({
      next: (response) => {
        console.log('Login successful');
        this.router.navigate(['/profile']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        alert(error.message);
      }
    });
  }
}
