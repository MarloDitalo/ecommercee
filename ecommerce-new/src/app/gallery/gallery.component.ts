import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DataserviceService } from '../services/dataservice.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  selectedFile: File | null = null;
  productName: string = '';
  productPrice: number = 0;
  productDescription: string = '';
  uploadedProduct: any = null;
  products: any[] = []; // Variable to store the fetched products

  constructor(
    private dataService: DataserviceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const validImageTypes = ['image/jpeg', 'image/png'];
      if (!validImageTypes.includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Please select a valid image file (JPG, JPEG, PNG).',
          confirmButtonText: 'OK',
        });
        this.selectedFile = null;
      } else {
        this.selectedFile = file;
      }
    }
  }

  uploadProduct(): void {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('image', this.selectedFile);
      formData.append('name', this.productName);
      formData.append('price', this.productPrice.toString());
      formData.append('description', this.productDescription);
  
      // Log FormData content using forEach
      console.log('FormData content:');
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
  
      this.dataService.sendFormDataRequest('uploadProduct', formData).subscribe(
        (response: any) => {
          console.log('Raw response:', response); // Log the raw response
  
          if (response && response.code === 200) {
            console.log('Product uploaded successfully:', response);
            this.uploadedProduct = {
              name: this.productName,
              price: this.productPrice,
              description: this.productDescription,
            };
            this.clearForm();
            this.fetchProducts();
  
            Swal.fire({
              icon: 'success',
              title: 'Upload Successful',
              text: 'Your product has been uploaded successfully!',
              confirmButtonText: 'OK',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Upload Failed',
              text: 'Unexpected response format. Please try again.',
              confirmButtonText: 'OK',
            });
          }
        },
        (error: any) => {
          console.error('Error response:', error); // Log the error response
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: 'There was an error uploading the product.',
            confirmButtonText: 'OK',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'No File Selected',
        text: 'Please select a file to upload.',
        confirmButtonText: 'OK',
      });
    }
  }

  clearForm(): void {
    this.selectedFile = null;
    this.productName = '';
    this.productPrice = 0;
    this.productDescription = '';

    if (this.fileInput) {
      this.fileInput.nativeElement.value = ''; // Clear the file input
    }
  }

  fetchProducts(): void {
    this.dataService.receiveApiRequest('getProducts').subscribe(
      (response: any) => {
        console.log('Products fetched successfully:', response);
        if (response && Array.isArray(response.data)) {
          this.products = response.data;
        } else {
          console.error('Invalid response data format:', response);
        }
      },
      (error: any) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  removeProduct(productId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this product?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataService.deleteProduct(productId).subscribe(
          (response) => {
            console.log('Product deleted successfully:', response);
            Swal.fire({
              icon: 'success',
              title: 'Product deleted',
              text: 'Product deleted successfully.',
              confirmButtonText: 'OK',
            });
            this.fetchProducts(); // Refresh the product list
          },
          (error) => {
            console.error('Error deleting product:', error);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text: 'There was an error removing the product.',
              confirmButtonText: 'OK',
            });
          }
        );
      }
    });
  }

  logout(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataService.logout();
        this.router.navigate(['/login']).then(() => {
          Swal.fire({
            icon: 'success',
            title: 'Logged out',
            text: 'You have been successfully logged out.',
            confirmButtonText: 'OK',
          });
        });
      }
    });
  }
}
