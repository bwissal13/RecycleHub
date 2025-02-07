import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { routes } from './app.routes';
import { authReducer } from './core/store/auth/auth.reducer';
import { pointsReducer } from './core/store/points/points.reducer';
import { AuthEffects } from './core/store/auth/auth.effects';
import { PointsEffects } from './core/store/points/points.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([
        authInterceptor,
        errorInterceptor
      ])
    ),
    provideAnimations(),
    provideStore({
      auth: authReducer,
      points: pointsReducer
    }),
    provideEffects([
      AuthEffects,
      PointsEffects
    ])
  ]
};
