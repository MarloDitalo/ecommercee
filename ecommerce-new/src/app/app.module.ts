import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GalleryComponent } from './gallery/gallery.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// Import NgxImageCropperModule from ngx-image-cropper
import { MatDialogModule } from '@angular/material/dialog';
import { AngularCropperjsModule } from 'angular-cropperjs'; // Import CropperModule
import { ProductComponent } from './product/product.component';





@NgModule({
  declarations: [
    AppComponent,
    GalleryComponent,
    ProductComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatDialogModule

  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent],
 

})
export class AppModule { }
