import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataserviceService } from '../services/dataservice.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private ds: DataserviceService, private http: HttpClient, private router: Router,) {}

  signup() {
    // Check if the form fields are not empty
    if (!this.username || !this.email || !this.password) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'All fields are required!',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Check if the password is at least 10 characters long
    if (this.password.length < 10) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Password must be at least 10 characters long!',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Prepare data to send to the API
    const requestData = {
      username: this.username,
      email: this.email,
      password: this.password
    };

    // Call the register method from the DataserviceService
    this.ds.sendApiRequest('signup', requestData).subscribe(
      (response: any) => {
        console.log(response); // Handle success response here

        // Show a SweetAlert for successful registration
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'You have registered successfully!',
          confirmButtonText: 'OK'
        }).then(() => {
          // Reset the form fields after successful addition
          this.username = '';
          this.email = '';
          this.password = '';
        });
      },
      (error: any) => {
        console.error(error); // Handle error response here
        // Optionally, display an error message to the user
      }
    );
  }


  onLogin(): void {
    this.router.navigate(['/login']); // Navigate to the register component/page
  }
}
