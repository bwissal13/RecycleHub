import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable, of, throwError, BehaviorSubject } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

interface User {
  id: number;
  email: string;
  password: string;
  nom: string;
  prenom: string;
  adresse: string;
  telephone: string;
  dateNaissance: string;
  photo?: string;
  role: 'user' | 'collecteur';
  points: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'currentUser';
  private readonly AUTH_TOKEN_KEY = 'authToken';
  
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAuth();
      this.ensureCollectorsExist();
    }
  }

  private initializeAuth() {
    // Try to restore the authentication state from localStorage
    const currentUserJson = localStorage.getItem(this.CURRENT_USER_KEY);
    const authToken = localStorage.getItem(this.AUTH_TOKEN_KEY);
    
    if (currentUserJson && authToken) {
      try {
        const currentUser = JSON.parse(currentUserJson);
        this.currentUserSubject.next(currentUser);
      } catch (error) {
        console.error('Error restoring auth state:', error);
        this.logout();
      }
    }
  }

  private ensureCollectorsExist(): void {
    // Pre-registered collectors that should always exist
    const preRegisteredCollectors: User[] = [
      {
        id: 1,
        email: 'collecteur1@recyclehub.ma',
        password: btoa('Collector123!'),
        nom: 'Alami',
        prenom: 'Hassan',
        adresse: 'Youssoufia, Maroc',
        telephone: '0600000001',
        dateNaissance: '1990-01-01',
        role: 'collecteur',
        points: 0
      },
      {
        id: 2,
        email: 'collecteur2@recyclehub.ma',
        password: btoa('Collector123!'),
        nom: 'Bennani',
        prenom: 'Karim',
        adresse: 'Youssoufia, Maroc',
        telephone: '0600000002',
        dateNaissance: '1992-02-02',
        role: 'collecteur',
        points: 0
      },
      {
        id: 3,
        email: 'collecteur3@recyclehub.ma',
        password: btoa('Collector123!'),
        nom: 'Idrissi',
        prenom: 'Ahmed',
        adresse: 'Marrakech, Maroc',
        telephone: '0600000003',
        dateNaissance: '1988-03-03',
        role: 'collecteur',
        points: 0
      }
    ];
    
    // Get existing users
    let users = this.getUsers();
    
    // Remove existing collectors
    users = users.filter(user => !user.email.includes('@recyclehub.ma'));
    
    // Add collectors
    users.push(...preRegisteredCollectors);
    
    // Save updated users list
    this.saveUsers(users);
  }

  private getItem(key: string): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key);
    }
    return null;
  }

  private setItem(key: string, value: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, value);
    }
  }

  private removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }

  private getUsers(): User[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    const usersJson = localStorage.getItem(this.USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveUsers(users: User[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }
  }

  login(email: string, password: string): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Cannot login in non-browser environment'));
    }

    console.log('Login attempt:', { email });
    const users = this.getUsers();
    console.log('Available users:', users);
    
    const hashedPassword = btoa(password);
    console.log('Hashed password:', hashedPassword);
    
    const user = users.find(u => u.email === email && u.password === hashedPassword);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      const token = 'token-' + Math.random();
      
      // Store auth state
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      localStorage.setItem(this.AUTH_TOKEN_KEY, token);
      
      // Update the behavior subject
      this.currentUserSubject.next(userWithoutPassword);
      
      return of({ user: userWithoutPassword, token }).pipe(delay(500));
    }

    return throwError(() => ({ message: 'Email ou mot de passe incorrect' })).pipe(delay(500));
  }

  register(userData: Omit<User, 'id' | 'role' | 'points'>): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Cannot register in non-browser environment'));
    }

    const users = this.getUsers();
    
    if (users.find(u => u.email === userData.email)) {
      return throwError(() => ({ message: 'Cet email est déjà utilisé' })).pipe(delay(500));
    }

    if (userData.email.includes('@recyclehub.ma')) {
      return throwError(() => ({ message: 'Cet email est réservé aux collecteurs' })).pipe(delay(500));
    }

    const hashedPassword = btoa(userData.password);
    const newUser: User = {
      ...userData,
      id: Date.now(),
      password: hashedPassword,
      role: 'user',
      points: 0
    };
    
    users.push(newUser);
    this.saveUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;
    return of({ user: userWithoutPassword }).pipe(delay(500));
  }

  updateProfile(userId: number, userData: Partial<Omit<User, 'id' | 'role' | 'password'>>): Observable<Omit<User, 'password'>> {
    if (!isPlatformBrowser(this.platformId)) {
      return throwError(() => new Error('Cannot update profile in non-browser environment'));
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return throwError(() => new Error('Utilisateur non trouvé'));
    }

    const currentUser = users[userIndex];
    console.log('Current user before update:', currentUser);
    console.log('Update data:', userData);

    const updatedUser = {
      ...currentUser,
      ...userData,
      points: userData.points !== undefined ? userData.points : (currentUser.points || 0)
    };

    console.log('Updated user:', updatedUser);
    users[userIndex] = updatedUser;
    this.saveUsers(users);

    const { password: _, ...userWithoutPassword } = updatedUser;
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    this.currentUserSubject.next(userWithoutPassword);

    return of(userWithoutPassword).pipe(delay(500));
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
      return throwError(() => ({ message: 'Aucun compte trouvé avec cet email' })).pipe(delay(500));
    }

    const hashedPassword = btoa(newPassword);
    users[userIndex].password = hashedPassword;
    this.saveUsers(users);

    return of({ message: 'Mot de passe réinitialisé avec succès' }).pipe(delay(500));
  }

  logout(): Observable<void> {
    if (isPlatformBrowser(this.platformId)) {
      // Clear local storage
      localStorage.removeItem(this.CURRENT_USER_KEY);
      localStorage.removeItem(this.AUTH_TOKEN_KEY);
      
      // Clear current user subject
      this.currentUserSubject.next(null);
    }
    return of(void 0).pipe(delay(500));
  }

  deleteAccount(userId: number): Observable<void> {
    const users = this.getUsers();
    const updatedUsers = users.filter(u => u.id !== userId);
    this.saveUsers(updatedUsers);
    this.removeItem(this.CURRENT_USER_KEY);
    return of(void 0).pipe(delay(500));
  }

  requestPasswordReset(email: string): Observable<void> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return throwError(() => new Error('Aucun compte associé à cet email'));
    }

    return of(void 0).pipe(delay(500));
  }

  getCurrentUser(): Observable<Omit<User, 'password'> | null> {
    return this.currentUser$;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
} 