import { Component } from '@angular/core';
import { IUsers } from '../../models/iusers';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserRegister } from '../../services/user-register';
import { AuthStateService } from '../../services/auth-state.service';
import Swal from 'sweetalert2'; // ✅ Correct import for SweetAlert2
import { Router } from '@angular/router';

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
    role: 'Customer'
  } as IUsers;

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private apiRegister: UserRegister,
    private authStateService: AuthStateService,
    private router: Router
  ) {}

  addNewUser(form: NgForm) {
    this.errorMessage = '';
    this.successMessage = '';

    if (form && form.valid) {
      this.isLoading = true;

      console.log('📤 Sending registration data:', this.newUser);

    console.log('🎯 Selected role:', this.newUser.role); // Add this line

      this.apiRegister.register(this.newUser).subscribe({
        next: (res) => {
          console.log('✅ User registered successfully:', res);

          // ✅ Correct usage for SweetAlert2
          Swal.fire({
            title: 'Success!',
            text: 'Registration completed successfully!',
            icon: 'success',
            confirmButtonText: 'Continue'
          }).then(() => {
    this.router.navigate(['/login']);   // ✅ Redirect to /login after clicking OK
  });

          this.successMessage = 'Registration successful!';
          
          // Notify other components about successful registration/login
          this.authStateService.setAuthState(true);
          
          this.resetForm(form);
          this.isLoading = false;
        },
        error: (err) => {
          console.error('❌ Registration failed:', err);
          this.isLoading = false;

          // Handle the specific "email already exists" error
          if (err.error && err.error.errors && err.error.errors.length > 0) {
            const errorMessage = err.error.errors[0];

            // ✅ Correct usage for SweetAlert2
            Swal.fire({
              title: 'Registration Failed',
              text: errorMessage,
              icon: 'error',
              confirmButtonText: 'Try Again'
            });
          } else {
            Swal.fire({
              title: 'Error!',
              text: 'Registration failed. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        }
      });
    } else {
      this.errorMessage = 'Please fill all required fields correctly.';
      // ✅ Correct usage for SweetAlert2
      Swal.fire({
        title: 'Form Incomplete',
        text: 'Please fill all required fields correctly.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
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
