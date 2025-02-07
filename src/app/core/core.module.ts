import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { authInterceptor } from './interceptors';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: []
})
export class CoreModule { } 