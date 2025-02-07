import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: '<router-outlet></router-outlet>',
  styleUrls: ['../../styles/components/auth.css']
})
export class AuthComponent {} 