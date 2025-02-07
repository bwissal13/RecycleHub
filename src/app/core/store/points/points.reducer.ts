import { createReducer, on } from '@ngrx/store';
import * as PointsActions from './points.actions';

export interface PointsState {
  total: number;
  history: any[];
  rewards: any[];
  loading: boolean;
  error: any;
}

export const initialState: PointsState = {
  total: 0,
  history: [],
  rewards: [],
  loading: false,
  error: null
};

export const pointsReducer = createReducer(
  initialState,

  // Load Points Data
  on(PointsActions.loadPointsData, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(PointsActions.loadPointsDataSuccess, (state, { total, history, rewards }) => ({
    ...state,
    total,
    history,
    rewards,
    loading: false,
    error: null
  })),

  on(PointsActions.loadPointsDataFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Add Points
  on(PointsActions.addPoints, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(PointsActions.addPointsSuccess, (state, { total, historyEntry }) => ({
    ...state,
    total,
    history: [historyEntry, ...state.history],
    loading: false,
    error: null
  })),

  on(PointsActions.addPointsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Convert Points
  on(PointsActions.convertPoints, state => ({
    ...state,
    loading: true,
    error: null
  })),

  on(PointsActions.convertPointsSuccess, (state, { total, historyEntry }) => ({
    ...state,
    total,
    history: [historyEntry, ...state.history],
    loading: false,
    error: null
  })),

  on(PointsActions.convertPointsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
); 