import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthState } from '../../store/auth/auth.reducer';
import * as AuthActions from '../../store/auth/auth.actions';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center">
              <a routerLink="/" class="text-2xl font-bold text-green-600">RecycleHub</a>
            </div>
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a routerLink="/" routerLinkActive="border-green-500 text-gray-900" 
                 [routerLinkActiveOptions]="{exact: true}"
                 class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Accueil
              </a>
              <a routerLink="/collecte" routerLinkActive="border-green-500 text-gray-900"
                 class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Collectes
              </a>
              <a routerLink="/points" routerLinkActive="border-green-500 text-gray-900"
                 class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Points
              </a>
            </div>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:items-center">
            <div class="ml-3 relative">
              <div class="flex space-x-4">
                <a routerLink="/profile" routerLinkActive="bg-green-100 text-green-700"
                   class="text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Mon Profil
                </a>
                <button (click)="logout()" 
                        class="text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">
                  Déconnexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavComponent {
  constructor(private store: Store<{ auth: AuthState }>) {}

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
} 