import { Component } from '@angular/core';
import { IUsers } from '../../models/iusers';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserRegister } from '../../services/user-register';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register {
  newUser: IUsers = {
    firstName: '',
    lastName: '',
    email: '',
    userName: '',
    password: '',
    role: 'Customer' // default role
  } as IUsers;

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private apiRegister: UserRegister) {}

  addNewUser(form: NgForm) {
    this.errorMessage = '';
    this.successMessage = '';

    if (form && form.valid) {
      this.isLoading = true;

      console.log('📤 Sending registration data:', this.newUser);

      this.apiRegister.register(this.newUser).subscribe({
        next: (res) => {
          console.log('✅ User registered successfully:', res);
          this.successMessage = 'Registration successful!';
          this.resetForm(form);
        },
        error: (err) => {
          console.error('❌ Registration failed:', err);
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Please fill all required fields correctly.';
    }
  }

  private resetForm(form: NgForm) {
    form.resetForm();
    this.newUser = {
      firstName: '',
      lastName: '',
      email: '',
      userName: '',
      password: '',
      role: 'Customer'
    } as IUsers;
    this.isLoading = false;
  }


}
