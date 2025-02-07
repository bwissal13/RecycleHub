import { createAction, props } from '@ngrx/store';

export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: any; token: string }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: any }>()
);

export const register = createAction(
  '[Auth] Register',
  props<{
    email: string;
    password: string;
    nom: string;
    prenom: string;
    adresse: string;
    telephone: string;
    dateNaissance: string;
    photo?: File;
  }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: any }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: any }>()
);

export const updateProfile = createAction(
  '[Auth] Update Profile',
  props<{
    userData: {
      id: number;
      email: string;
      nom: string;
      prenom: string;
      adresse: string;
      telephone: string;
      dateNaissance: string;
      photo?: File;
    }
  }>()
);

export const updateProfileSuccess = createAction(
  '[Auth] Update Profile Success',
  props<{ user: any }>()
);

export const updateProfileFailure = createAction(
  '[Auth] Update Profile Failure',
  props<{ error: any }>()
);

export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');

export const requestPasswordReset = createAction(
  '[Auth] Request Password Reset',
  props<{ email: string }>()
);

export const requestPasswordResetSuccess = createAction(
  '[Auth] Request Password Reset Success'
);

export const requestPasswordResetFailure = createAction(
  '[Auth] Request Password Reset Failure',
  props<{ error: any }>()
);

export const resetPassword = createAction(
  '[Auth] Reset Password',
  props<{ email: string; password: string }>()
);

export const resetPasswordSuccess = createAction(
  '[Auth] Reset Password Success'
);

export const resetPasswordFailure = createAction(
  '[Auth] Reset Password Failure',
  props<{ error: any }>()
);

export const deleteAccount = createAction(
  '[Auth] Delete Account',
  props<{ userId: number }>()
);

export const deleteAccountSuccess = createAction(
  '[Auth] Delete Account Success'
);

export const deleteAccountFailure = createAction(
  '[Auth] Delete Account Failure',
  props<{ error: any }>()
); 