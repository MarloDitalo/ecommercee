import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { DataserviceService } from '../services/dataservice.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit {
  products: any[] = [];
  allProducts: any[] = [];
  cartItems: any[] = [];
  cartCount: number = 0;
  totalPrice: number = 0;
  isCartVisible: boolean = false;
  currentUserId!: number;

  private baseUrl: string = 'http://localhost/ecommerce-api/uploads/';

  constructor(
    private dataService: DataserviceService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUserId = +localStorage.getItem('user_id')!;
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.dataService.receiveApiRequest('getProducts').subscribe(
      (response: any) => {
        if (response && response.data && Array.isArray(response.data)) {
          this.allProducts = response.data;
          this.products = this.allProducts.map((product) => {
            product.imageUrl = `${this.baseUrl}${product.file_name}`;
            product.maxQuantity = product.maxQuantity || 10;
            product.sold = 0;
            product.selectedQuantity = 1; // Initialize selectedQuantity to 1
            return product;
          });
        } else {
          console.error('Invalid response data format:', response);
        }
      },
      (error: any) => {
        console.error('Error fetching products:', error);
      }
    );
  }

  addToCart(product: any): void {
    const existingItem = this.cartItems.find((item) => item.id === product.id);

    if (existingItem) {
      if (
        existingItem.quantity + product.selectedQuantity <=
        product.maxQuantity
      ) {
        existingItem.quantity += product.selectedQuantity;
        swal.fire(
          'Added!',
          `${product.selectedQuantity} of ${product.name} added to your cart.`,
          'success'
        );
      } else {
        swal.fire(
          'Limit reached!',
          `You have reached the maximum quantity for ${product.name}.`,
          'warning'
        );
      }
    } else {
      this.cartItems.push({ ...product, quantity: product.selectedQuantity });
      swal.fire(
        'Added!',
        `${product.selectedQuantity} of ${product.name} has been added to your cart.`,
        'success'
      );
    }

    this.updateCartCountAndTotal();
  }

  removeFromCart(item: any): void {
    this.cartItems = this.cartItems.filter(
      (cartItem) => cartItem.id !== item.id
    );
    this.updateCartCountAndTotal();
    swal.fire(
      'Removed!',
      `${item.name} has been removed from your cart.`,
      'success'
    );
  }

  updateCartCountAndTotal(): void {
    this.cartCount = this.cartItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    this.totalPrice = this.cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
  }
  orderProduct(product: any): void {
    swal
      .fire({
        title: 'Confirm Order',
        text: `Are you sure you want to order ${product.selectedQuantity} of ${product.name}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, order now',
        cancelButtonText: 'Cancel',
      })
      .then((result) => {
        if (result.isConfirmed) {
          const orderData = {
            userId: this.currentUserId,
            totalAmount: product.price * product.selectedQuantity,
            items: [
              {
                productId: product.id,
                quantity: product.selectedQuantity,
              },
            ],
          };

          // Log the order data being sent
          console.log('Order data being sent:', orderData);

          this.dataService.sendApiRequest('orderProduct', orderData).subscribe(
            (response: any) => {
              if (response.code === 200) {
                swal.fire(
                  'Ordered!',
                  `${product.selectedQuantity} of ${product.name} has been ordered successfully.`,
                  'success'
                );
                // Optionally, you can clear the selected quantity after ordering
                product.selectedQuantity = 1; // Resetting to 1 after ordering
              } else {
                swal.fire(
                  'Error!',
                  'There was an issue processing your order. Please try again.',
                  'error'
                );
              }
            },
            (error: any) => {
              swal.fire(
                'Error!',
                'There was an issue processing your order. Please try again.',
                'error'
              );
              console.error('Order error:', error);
            }
          );
        }
      });
  }




  viewCart(): void {
    this.isCartVisible = true;
  }

  closeCart(): void {
    this.isCartVisible = false;
  }
  checkout(item: any): void{
    this.orderProduct(item)
  }


  logout(): void {
    swal
      .fire({
        title: 'Are you sure?',
        text: 'You will be logged out of your account.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, log out',
        cancelButtonText: 'Cancel',
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.dataService.logout();

          this.router.navigate(['/login']).then(() => {
            swal.fire({
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
