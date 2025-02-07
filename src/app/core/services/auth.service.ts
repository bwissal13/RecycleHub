import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
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
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USERS_KEY = 'users';
  private readonly CURRENT_USER_KEY = 'currentUser';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.ensureCollectorsExist();
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
        role: 'collecteur'
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
        role: 'collecteur'
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
    const usersJson = this.getItem(this.USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  private saveUsers(users: User[]): void {
    this.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  login(email: string, password: string): Observable<any> {
    console.log('Login attempt:', { email }); // Debug log
    const users = this.getUsers();
    console.log('Available users:', users); // Debug log
    
    const hashedPassword = btoa(password);
    console.log('Hashed password:', hashedPassword); // Debug log
    
    const user = users.find(u => u.email === email && u.password === hashedPassword);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      const token = 'token-' + Math.random();
      this.setItem(this.CURRENT_USER_KEY, JSON.stringify({ ...userWithoutPassword, token }));
      return of({ user: userWithoutPassword, token }).pipe(delay(500));
    }

    return throwError(() => ({ message: 'Email ou mot de passe incorrect' })).pipe(delay(500));
  }

  register(userData: Omit<User, 'id' | 'role'>): Observable<any> {
    const users = this.getUsers();
    
    if (users.find(u => u.email === userData.email)) {
      return throwError(() => ({ message: 'Cet email est déjà utilisé' })).pipe(delay(500));
    }

    // Vérifier que l'email n'est pas un email de collecteur
    if (userData.email.includes('@recyclehub.ma')) {
      return throwError(() => ({ message: 'Cet email est réservé aux collecteurs' })).pipe(delay(500));
    }

    const hashedPassword = btoa(userData.password);
    const newUser: User = {
      ...userData,
      id: Date.now(),
      password: hashedPassword,
      role: 'user'
    };
    
    users.push(newUser);
    this.saveUsers(users);

    const { password: _, ...userWithoutPassword } = newUser;
    return of({ user: userWithoutPassword }).pipe(delay(500));
  }

  updateProfile(userId: number, userData: Partial<Omit<User, 'password' | 'role'>>): Observable<Omit<User, 'password'>> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return throwError(() => new Error('Utilisateur non trouvé'));
    }

    const currentUser = users[userIndex];
    const updatedUser = {
      ...currentUser,
      ...userData,
      id: userId,
      role: currentUser.role,
      password: currentUser.password
    };

    users[userIndex] = updatedUser;
    this.saveUsers(users);

    const { password: _, ...userWithoutPassword } = updatedUser;
    this.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

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
    this.removeItem(this.CURRENT_USER_KEY);
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
    const userJson = this.getItem(this.CURRENT_USER_KEY);
    return of(userJson ? JSON.parse(userJson) : null);
  }

  isAuthenticated(): boolean {
    return !!this.getItem(this.CURRENT_USER_KEY);
  }
} 