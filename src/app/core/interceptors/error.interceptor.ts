import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        // A client-side or network error occurred
        return throwError(() => ({
          message: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
          status: error.status
        }));
      }

      if ([401, 403].includes(error.status)) {
        // Auto logout if 401 or 403 response returned from api
        localStorage.removeItem('recycleHub_token');
        localStorage.removeItem('recycleHub_currentUser');
        location.reload();
        return throwError(() => ({
          message: 'Session expirée. Veuillez vous reconnecter.',
          status: error.status
        }));
      }

      if (error.status === 404) {
        return throwError(() => ({
          message: 'La ressource demandée n\'existe pas.',
          status: error.status
        }));
      }

      if (error.status === 400) {
        // Handle validation errors
        const validationErrors = error.error?.errors;
        if (validationErrors) {
          const messages = Object.values(validationErrors).flat();
          return throwError(() => ({
            message: messages.join('. '),
            status: error.status,
            validationErrors
          }));
        }
      }

      // Server-side error
      const errorMessage = error.error?.message 
        || error.error?.error 
        || error.statusText 
        || 'Une erreur est survenue sur le serveur. Veuillez réessayer plus tard.';

      return throwError(() => ({
        message: errorMessage,
        status: error.status
      }));
    })
  );
}; 