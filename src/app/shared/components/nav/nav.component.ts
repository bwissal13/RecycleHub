import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <!-- Logo/Home -->
            <div class="flex-shrink-0 flex items-center">
              <a routerLink="/home" class="text-green-600 font-bold text-xl">RecycleHub</a>
            </div>

            <!-- Navigation Links -->
            <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
              <a routerLink="/home" 
                 routerLinkActive="border-green-500 text-gray-900"
                 [routerLinkActiveOptions]="{exact: true}"
                 class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Accueil
              </a>
              <a routerLink="/collecte" 
                 routerLinkActive="border-green-500 text-gray-900"
                 class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Mes Collectes
              </a>
              <a routerLink="/points" 
                 routerLinkActive="border-green-500 text-gray-900"
                 [routerLinkActiveOptions]="{exact: true}"
                 class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium cursor-pointer">
                Mes Points
              </a>
            </div>
          </div>

          <!-- Right side buttons -->
          <div class="flex items-center">
            <a routerLink="/profile" 
               routerLinkActive="bg-green-100 text-green-700"
               class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100">
              Mon Profil
            </a>
            <button (click)="logout()" 
                    class="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile menu -->
      <div class="sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
          <a routerLink="/home"
             routerLinkActive="bg-green-50 border-green-500 text-green-700"
             [routerLinkActiveOptions]="{exact: true}"
             class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Accueil
          </a>
          <a routerLink="/collecte"
             routerLinkActive="bg-green-50 border-green-500 text-green-700"
             class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Mes Collectes
          </a>
          <a routerLink="/points"
             routerLinkActive="bg-green-50 border-green-500 text-green-700"
             [routerLinkActiveOptions]="{exact: true}"
             class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium cursor-pointer">
            Mes Points
          </a>
          <a routerLink="/profile"
             routerLinkActive="bg-green-50 border-green-500 text-green-700"
             class="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
            Mon Profil
          </a>
        </div>
      </div>
    </nav>
  `
})
export class NavComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
} 