import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-debug-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Debug Button -->
    <button 
      (click)="toggleDebugPanel()" 
      class="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:rotate-12">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.5 12C17.5 13.576 16.8371 14.9972 15.7749 16C14.7127 17.0028 13.2761 17.5 11.7 17.5C10.1239 17.5 8.68734 17.0028 7.62513 16C6.56292 14.9972 5.9 13.576 5.9 12C5.9 10.424 6.56292 9.00277 7.62513 8C8.68734 6.99723 10.1239 6.5 11.7 6.5C13.2761 6.5 14.7127 6.99723 15.7749 8C16.8371 9.00277 17.5 10.424 17.5 12Z" fill="#FFD700"/>
        <path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3ZM4.5 12C4.5 7.85786 7.85786 4.5 12 4.5C16.1421 4.5 19.5 7.85786 19.5 12C19.5 16.1421 16.1421 19.5 12 19.5C7.85786 19.5 4.5 16.1421 4.5 12Z" fill="currentColor"/>
        <circle cx="9" cy="10" r="1.5" fill="white"/>
      </svg>
    </button>

    <!-- Debug Panel -->
    <div *ngIf="isDebugPanelOpen" 
         class="fixed bottom-20 right-6 z-50 w-80 bg-white rounded-lg shadow-xl border-2 border-green-600 overflow-hidden">
      <div class="bg-green-600 text-white px-4 py-2 flex justify-between items-center">
        <span class="font-semibold">🐍 Debug Panel</span>
        <button (click)="toggleDebugPanel()" class="text-white hover:text-green-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div class="p-4 space-y-4">
        <!-- Storage Info -->
        <div class="space-y-2">
          <h3 class="font-medium text-gray-700">Storage Info:</h3>
          <div class="text-sm text-gray-600">
            <p>Token: {{ getToken() || 'No token found' }}</p>
            <p>Users Count: {{ getUsersCount() }}</p>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-2">
          <h3 class="font-medium text-gray-700">Actions:</h3>
          <div class="flex flex-col gap-2">
            <button 
              (click)="clearStorage()" 
              class="bg-red-500 text-white px-3 py-1.5 rounded text-sm hover:bg-red-600 transition-colors">
              Clear Local Storage
            </button>
            <button 
              (click)="showStorageDetails()" 
              class="bg-blue-500 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-600 transition-colors">
              Show Full Details
            </button>
            <button 
              (click)="removeToken()" 
              class="bg-yellow-500 text-white px-3 py-1.5 rounded text-sm hover:bg-yellow-600 transition-colors">
              Remove Token Only
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      isolation: isolate;
    }
  `]
})
export class DebugButtonComponent {
  isDebugPanelOpen = false;

  toggleDebugPanel() {
    this.isDebugPanelOpen = !this.isDebugPanelOpen;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUsersCount(): number {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users).length : 0;
  }

  clearStorage() {
    if (confirm('Are you sure you want to clear all local storage data?')) {
      localStorage.clear();
      this.showNotification('Local storage cleared successfully!');
    }
  }

  removeToken() {
    if (confirm('Are you sure you want to remove the authentication token?')) {
      localStorage.removeItem('token');
      this.showNotification('Token removed successfully!');
    }
  }

  showStorageDetails() {
    const storage = localStorage;
    const users = storage.getItem('users');
    const token = storage.getItem('token');
    
    const debugInfo = {
      users: users ? JSON.parse(users) : [],
      token,
      allStorageKeys: Object.keys(storage),
      storageLength: storage.length
    };
    
    console.log('🐍 Debug Info:', debugInfo);
    
    const message = `
🔐 Authentication Debug Info:

Token: ${token || 'No token found'}

👥 Users (${debugInfo.users.length}):
${JSON.stringify(debugInfo.users, null, 2)}

🗝️ All Storage Keys:
${debugInfo.allStorageKeys.join(', ')}
    `;
    
    alert(message);
  }

  private showNotification(message: string) {
    // You could replace this with a more sophisticated notification system
    console.log('🐍', message);
  }
} 