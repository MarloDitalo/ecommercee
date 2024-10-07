import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DataserviceService } from '../services/dataservice.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  hidePassword: boolean = true;
  email: any;
  password: any;
  loginPrompt: string = '';

  constructor(
    private router: Router,
    private ds: DataserviceService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  async login() {
    const userInfo = {
      email: this.email,
      password: this.password,
    };

    this.ds.sendApiRequest('login', userInfo).subscribe(async (res: any) => {
      if (res.payload == null) {
        // Use SweetAlert2 for incorrect credentials
        await Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: 'Incorrect credentials. Please try again.',
          confirmButtonText: 'OK',
        });
      } else {
        localStorage.setItem('email', res.payload.email);
        localStorage.setItem('user_id', res.payload.user_id);
        localStorage.setItem('username', res.payload.username); // Store user's name
        localStorage.setItem('is_seller', res.payload.is_seller); // Store is_seller flag

        // Redirect based on is_seller flag
        if (res.payload.is_seller == 1) {
          this.router.navigate(['/gallery']);
        } else {
          this.router.navigate(['/product']); // Assuming you have a products route
        }

        // Use SweetAlert2 for successful login
        await Swal.fire({
          icon: 'success',
          title: 'Successfully Logged In',
          text: `Welcome, ${localStorage.getItem('username')}!`,
          confirmButtonText: 'OK',
        });
      }
    });
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onSignup(): void {
    this.router.navigate(['/signup']); // Navigate to the register component/page
  }
}
