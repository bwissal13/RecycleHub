import { createAction, props } from '@ngrx/store';

// Load Points Data
export const loadPointsData = createAction('[Points] Load Points Data');

export const loadPointsDataSuccess = createAction(
  '[Points] Load Points Data Success',
  props<{ 
    total: number;
    history: any[];
    rewards: any[];
  }>()
);

export const loadPointsDataFailure = createAction(
  '[Points] Load Points Data Failure',
  props<{ error: any }>()
);

// Add Points
export const addPoints = createAction(
  '[Points] Add Points',
  props<{ 
    points: number;
    description: string;
    operationType: 'collecte';
  }>()
);

export const addPointsSuccess = createAction(
  '[Points] Add Points Success',
  props<{ 
    points: number;
    total: number;
    historyEntry: any;
  }>()
);

export const addPointsFailure = createAction(
  '[Points] Add Points Failure',
  props<{ error: any }>()
);

// Convert Points
export const convertPoints = createAction(
  '[Points] Convert Points',
  props<{ 
    rewardId: number;
    pointsCost: number;
  }>()
);

export const convertPointsSuccess = createAction(
  '[Points] Convert Points Success',
  props<{ 
    pointsCost: number;
    total: number;
    historyEntry: any;
    reward: any;
  }>()
);

export const convertPointsFailure = createAction(
  '[Points] Convert Points Failure',
  props<{ error: any }>()
); 