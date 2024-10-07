import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataserviceService {
  private apiUrl =  'http://localhost/ecommerce-api/'; // Use environment variable for API URL

  constructor(private http: HttpClient) {}

  getOrderDetails(userId: number, orderId: number): Observable<any> {
    const orderData = { userId, orderId };
    return this.http.post<any>(`${this.apiUrl}getOrderDetails`, orderData, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    }).pipe(catchError(this.handleError));
}


// Add this method in your DataserviceService
addToCart(cartData: { userId: number; productId: number; quantity: number }): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}addToCart`, cartData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  }).pipe(catchError(this.handleError));
}

getCartItems(userId: number): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}getCartItems`, { userId }, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  }).pipe(catchError(this.handleError));
}


  // Example implementation for ordering products
  orderProduct(orderData: {
    userId: number;
    items: { productId: number; quantity: number; price: number }[];
    totalAmount: number;
  }): Observable<any> {
    console.log('Sending order data:', orderData); // Log the data being sent
    return this.http.post<any>(`${this.apiUrl}orderProduct`, orderData, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    }).pipe(catchError(this.handleError));
  }

  // Generic API request handler
  sendApiRequest(method: string, data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}${method}`, data, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Send FormData for file uploads
  sendFormDataRequest(uploadProduct: string, formData: FormData): Observable<any> {
    const url = `${this.apiUrl}${uploadProduct}`;
    return this.http.post<any>(url, formData).pipe(
      catchError(this.handleError)
    );
  }

  // Delete product
  deleteProduct(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}deleteProduct`, { id }, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Receive data from GET requests
  receiveApiRequest(method: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${method}`).pipe(
      catchError(this.handleError)
    );
  }

  // Get most sold products
  getMostSoldProducts(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}getMostSoldProducts`).pipe(
      catchError(this.handleError)
    );
  }

  // Logout method
  logout(): void {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
  }

  // Error handling method
  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError(error);
  }
}
