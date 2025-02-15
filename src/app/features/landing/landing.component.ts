import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavComponent } from '../../shared/components/nav/nav.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, NavComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['../../styles/components/landing.css']
})
export class LandingComponent {} 